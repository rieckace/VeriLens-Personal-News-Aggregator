import os

from selenium_utils import click, run_with_driver, type_into, unique_email, wait_for


def test_register(driver, app_url: str, password: str):
    email = os.getenv("TEST_EMAIL") or unique_email()

    driver.get(f"{app_url}/register")
    type_into(driver, '[data-testid="register-name"]', "Test User")
    type_into(driver, '[data-testid="register-email"]', email)
    type_into(driver, '[data-testid="register-password"]', password)
    type_into(driver, '[data-testid="register-confirm-password"]', password)
    click(driver, '[data-testid="register-submit"]')

    # Successful register should land on login
    wait_for(driver, '[data-testid="login-submit"]', timeout=25)

    print("Registration E2E test passed")


if __name__ == "__main__":
    run_with_driver(test_register)
