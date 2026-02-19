import os
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service


def env_bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    if v is None:
        return default
    return v.strip().lower() in {"1", "true", "yes", "y"}


def wait_for(driver, css, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, css))
    )


def click(driver, css, timeout=20):
    el = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, css))
    )
    el.click()
    return el


def type_into(driver, css, text, timeout=20, clear=True):
    el = wait_for(driver, css, timeout)
    if clear:
        el.clear()
    el.send_keys(text)
    return el


def main():
    app_url = os.getenv("APP_URL", "http://localhost:5173")
    password = os.getenv("TEST_PASSWORD", "Password@123")
    headless = env_bool("HEADLESS", False)

    # unique email each run
    email = os.getenv("TEST_EMAIL")
    if not email:
        email = f"test_{int(time.time())}@example.com"

    chrome_options = webdriver.ChromeOptions()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1400,900")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(f"{app_url}/register")

        type_into(driver, '[data-testid="register-name"]', "Test User")
        type_into(driver, '[data-testid="register-email"]', email)
        type_into(driver, '[data-testid="register-password"]', password)
        click(driver, '[data-testid="register-submit"]')

        # Preferences page
        wait_for(driver, '[data-testid="preferences-save"]', timeout=25)
        click(driver, '[data-testid="pref-technology"]')
        click(driver, '[data-testid="preferences-save"]')

        # Feed page
        wait_for(driver, '[data-testid="feed-refresh"]', timeout=25)
        click(driver, '[data-testid="feed-refresh"]')

        # Wait for at least 1 article card
        wait_for(driver, '[data-testid="article-card"]', timeout=30)

        # Search & apply filters
        type_into(driver, '[data-testid="feed-search"]', "mock")
        click(driver, '[data-testid="feed-apply"]')
        wait_for(driver, '[data-testid="article-card"]', timeout=20)

        # Bookmark first article
        click(driver, '[data-testid^="bookmark-"]', timeout=20)

        # Open bookmarks page from navbar
        click(driver, '[data-testid="nav-bookmarks"]', timeout=20)
        wait_for(driver, '[data-testid="article-card"]', timeout=20)

        # Logout
        click(driver, '[data-testid="nav-logout"]', timeout=20)
        wait_for(driver, '[data-testid="login-submit"]', timeout=20)

        # Login again
        type_into(driver, '[data-testid="login-email"]', email)
        type_into(driver, '[data-testid="login-password"]', password)
        click(driver, '[data-testid="login-submit"]')
        wait_for(driver, '[data-testid="preferences-save"]', timeout=25)

        print("E2E test passed")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
