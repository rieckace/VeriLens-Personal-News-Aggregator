import os

from selenium_utils import click, ensure_logged_in, run_with_driver, type_into, wait_for


def test_login(driver, app_url: str, password: str):
    # If TEST_EMAIL isn't provided, ensure_logged_in will register a new user first.
    email = os.getenv("TEST_EMAIL")
    email = ensure_logged_in(driver, app_url=app_url, email=email, password=password)

    # Log out and log back in using the same credentials (pure login verification)
    click(driver, '[data-testid="nav-profile-menu"]', timeout=20)
    wait_for(driver, '[data-testid="nav-logout"]', timeout=20)
    click(driver, '[data-testid="nav-logout"]', timeout=20)

    wait_for(driver, '[data-testid="login-submit"]', timeout=20)
    type_into(driver, '[data-testid="login-email"]', email)
    type_into(driver, '[data-testid="login-password"]', password)
    click(driver, '[data-testid="login-submit"]')

    wait_for(driver, '[data-testid="preferences-save"]', timeout=25)

    print("Login E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_login)
