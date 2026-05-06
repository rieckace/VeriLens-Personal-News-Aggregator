import os

from selenium_utils import click, ensure_logged_in, run_with_driver, wait_for


def test_notifications(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL")
    ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Navigate to notifications using the desktop bell icon
    click(driver, '[data-testid="nav-notifications"]', timeout=20)
    wait_for(driver, '[data-testid="notifications-title"]', timeout=25)

    # Either empty state or list is acceptable (depends on backend data)
    try:
        wait_for(driver, '[data-testid="notifications-empty"]', timeout=5)
        print("Notifications E2E test passed (empty)")
        return
    except Exception:
        pass

    wait_for(driver, '[data-testid="notifications-list"]', timeout=10)
    print("Notifications E2E test passed (list)")


if __name__ == "__main__":
    run_with_driver(test_notifications)
