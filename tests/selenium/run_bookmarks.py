import os

from selenium_utils import click, ensure_logged_in, run_with_driver, type_into, wait_for


def test_bookmarks(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Preferences -> feed
    click(driver, '[data-testid="pref-technology"]')
    click(driver, '[data-testid="preferences-save"]')

    # Feed
    wait_for(driver, '[data-testid="feed-refresh"]', timeout=25)
    click(driver, '[data-testid="feed-refresh"]')
    wait_for(driver, '[data-testid="article-card"]', timeout=30)

    # Narrow to mock articles (works with backend mock fallback)
    type_into(driver, '[data-testid="feed-search"]', "mock")
    click(driver, '[data-testid="feed-apply"]')
    wait_for(driver, '[data-testid="article-card"]', timeout=20)

    # Bookmark first article
    click(driver, '[data-testid^="bookmark-"]', timeout=20)

    # Open bookmarks and verify at least one card
    click(driver, '[data-testid="nav-bookmarks"]', timeout=20)
    wait_for(driver, '[data-testid="article-card"]', timeout=25)

    print("Bookmarks E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_bookmarks)
