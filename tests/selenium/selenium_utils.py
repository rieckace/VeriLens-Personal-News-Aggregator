import os
import time
import traceback
from pathlib import Path

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


def wait_for_visible(driver, css, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, css))
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


def unique_email() -> str:
    return f"test_{int(time.time())}@example.com"


def create_chrome_driver(headless: bool) -> webdriver.Chrome:
    chrome_options = webdriver.ChromeOptions()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1400,900")

    # 1) Preferred: Selenium Manager (Selenium 4+)
    try:
        return webdriver.Chrome(options=chrome_options)
    except Exception as first_error:
        # 2) Fallback: webdriver-manager
        driver_path = ChromeDriverManager().install()
        resolved = Path(driver_path)

        candidates = [resolved]
        if resolved.suffix.lower() != ".exe":
            candidates.append(resolved.with_suffix(".exe"))
        candidates.append(resolved.parent / "chromedriver.exe")

        chromedriver_exe = next((p for p in candidates if p.exists()), None)
        if chromedriver_exe is None:
            raise RuntimeError(
                "Failed to locate a ChromeDriver executable. "
                f"webdriver-manager returned: {driver_path}"
            ) from first_error

        service = Service(executable_path=str(chromedriver_exe))
        try:
            return webdriver.Chrome(service=service, options=chrome_options)
        except Exception as e:
            size = chromedriver_exe.stat().st_size if chromedriver_exe.exists() else -1
            raise RuntimeError(
                "Failed to start ChromeDriver. "
                f"chromedriver={chromedriver_exe} size={size} bytes. "
                "This often indicates a wrong-arch or wrong-OS driver binary."
            ) from e


def save_failure_artifacts(driver, artifacts_dir: str):
    os.makedirs(artifacts_dir, exist_ok=True)
    ts = int(time.time())
    png_path = os.path.join(artifacts_dir, f"failure_{ts}.png")
    html_path = os.path.join(artifacts_dir, f"failure_{ts}.html")
    try:
        driver.save_screenshot(png_path)
    except Exception:
        pass
    try:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
    except Exception:
        pass

    return png_path, html_path


def ensure_logged_in(driver, *, app_url: str, email: str | None, password: str, name: str = "Test User") -> str:
    """Ensure we end up logged in on Preferences page.

    If email is None, registers a fresh user first.
    Returns the email used.
    """
    if not email:
        email = unique_email()
        driver.get(f"{app_url}/register")
        type_into(driver, '[data-testid="register-name"]', name)
        type_into(driver, '[data-testid="register-email"]', email)
        type_into(driver, '[data-testid="register-password"]', password)
        type_into(driver, '[data-testid="register-confirm-password"]', password)
        click(driver, '[data-testid="register-submit"]')
        wait_for(driver, '[data-testid="login-submit"]', timeout=25)

    # login
    driver.get(f"{app_url}/login")
    wait_for(driver, '[data-testid="login-submit"]', timeout=25)
    type_into(driver, '[data-testid="login-email"]', email)
    type_into(driver, '[data-testid="login-password"]', password)
    click(driver, '[data-testid="login-submit"]')

    # Preferences page (after login)
    wait_for(driver, '[data-testid="preferences-save"]', timeout=25)
    return email


def run_with_driver(test_fn):
    app_url = os.getenv("APP_URL", "http://localhost:5173")
    password = os.getenv("TEST_PASSWORD", "Password@123")
    headless = env_bool("HEADLESS", False)
    artifacts_dir = os.getenv(
        "ARTIFACTS_DIR", os.path.join(os.path.dirname(__file__), "artifacts")
    )

    driver = create_chrome_driver(headless=headless)

    try:
        return test_fn(driver, app_url, password)
    except Exception:
        png_path, html_path = save_failure_artifacts(driver, artifacts_dir)
        print("E2E test failed")
        print(f"Saved artifacts: {png_path} , {html_path}")
        traceback.print_exc()
        raise
    finally:
        driver.quit()
