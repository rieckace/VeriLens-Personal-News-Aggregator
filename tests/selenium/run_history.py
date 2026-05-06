import os

from selenium_utils import click, ensure_logged_in, run_with_driver, wait_for


def test_history(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Preferences -> feed
    click(driver, '[data-testid="pref-technology"]')
    click(driver, '[data-testid="preferences-save"]')

    # Feed: open first article to create reading history
    wait_for(driver, '[data-testid="article-card"]', timeout=30)
    first_link = wait_for(driver, '[data-testid="article-card"] a', timeout=20)
    first_link.click()

    # Article page should load
    wait_for(driver, '[data-testid="article-title"]', timeout=25)

    # Go to history
    click(driver, '[data-testid="nav-history"]', timeout=20)
    wait_for(driver, '[data-testid="history-title"]', timeout=25)

    # Expect at least one article card
    wait_for(driver, '[data-testid="article-card"]', timeout=25)

    print("History E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_history)
