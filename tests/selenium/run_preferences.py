import os

from selenium_utils import click, ensure_logged_in, run_with_driver, wait_for


def test_preferences(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Toggle one preference and save
    wait_for(driver, '[data-testid="pref-technology"]', timeout=20)
    click(driver, '[data-testid="pref-technology"]')
    click(driver, '[data-testid="preferences-save"]')

    # Should land on feed
    wait_for(driver, '[data-testid="feed-refresh"]', timeout=25)

    # Go back to preferences and verify it stayed selected (class indicates active state)
    driver.get(f"{app_url}/preferences")
    pill = wait_for(driver, '[data-testid="pref-technology"]', timeout=25)
    classes = (pill.get_attribute("class") or "").lower()
    if "indigo" not in classes:
        raise AssertionError("Expected technology preference pill to look active, but it didn't.")

    print("Preferences E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_preferences)
