import os

from selenium_utils import click, ensure_logged_in, run_with_driver, wait_for


def test_analytics(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Preferences -> feed
    click(driver, '[data-testid="pref-technology"]')
    click(driver, '[data-testid="preferences-save"]')

    # Feed: open one article to ensure analytics has data
    wait_for(driver, '[data-testid="article-card"]', timeout=30)
    first_link = wait_for(driver, '[data-testid="article-card"] a', timeout=20)
    first_link.click()
    wait_for(driver, '[data-testid="article-title"]', timeout=25)

    # Analytics page
    click(driver, '[data-testid="nav-analytics"]', timeout=20)
    wait_for(driver, '[data-testid="analytics-title"]', timeout=25)

    print("Analytics E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_analytics)
