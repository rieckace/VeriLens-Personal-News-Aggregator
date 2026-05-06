import os

from selenium_utils import (
    click,
    ensure_logged_in,
    run_with_driver,
    type_into,
    wait_for,
    wait_for_visible,
)


def test_full_flow(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    email = ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Preferences: choose one category and continue
    click(driver, '[data-testid="pref-technology"]')
    click(driver, '[data-testid="preferences-save"]')

    # Feed: refresh and wait for articles
    wait_for(driver, '[data-testid="feed-refresh"]', timeout=25)
    click(driver, '[data-testid="feed-refresh"]')
    wait_for(driver, '[data-testid="article-card"]', timeout=30)

    # Search & apply filters
    type_into(driver, '[data-testid="feed-search"]', "mock")
    click(driver, '[data-testid="feed-apply"]')
    wait_for(driver, '[data-testid="article-card"]', timeout=20)

    # Bookmark first article
    click(driver, '[data-testid^="bookmark-"]', timeout=20)

    # Bookmarks page
    click(driver, '[data-testid="nav-bookmarks"]', timeout=20)
    wait_for(driver, '[data-testid="article-card"]', timeout=20)

    # Logout
    click(driver, '[data-testid="nav-profile-menu"]', timeout=20)
    wait_for_visible(driver, '[data-testid="nav-logout"]', timeout=20)
    click(driver, '[data-testid="nav-logout"]', timeout=20)
    wait_for(driver, '[data-testid="login-submit"]', timeout=20)

    # Login again
    type_into(driver, '[data-testid="login-email"]', email)
    type_into(driver, '[data-testid="login-password"]', password)
    click(driver, '[data-testid="login-submit"]')
    wait_for(driver, '[data-testid="preferences-save"]', timeout=25)

    print("E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_full_flow)
