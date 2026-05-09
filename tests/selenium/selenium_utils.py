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


def _strip_chromedriver_from_path() -> None:
    """Remove any PATH entries that contain chromedriver.exe.

    This prevents Selenium/Selenium Manager from picking up an outdated driver
    from a user's PATH (common on Windows after manual ChromeDriver downloads).
    Only affects the current Python process.
    """

    path_value = os.environ.get("PATH")
    if not path_value:
        return

    parts = path_value.split(os.pathsep)
    kept: list[str] = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        try:
            if (Path(part) / "chromedriver.exe").exists():
                continue
        except Exception:
            # If we can't inspect it, keep it.
            pass
        kept.append(part)

    os.environ["PATH"] = os.pathsep.join(kept)


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
    _strip_chromedriver_from_path()

    chrome_options = webdriver.ChromeOptions()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1400,900")

    # Reduce noisy Chrome/ChromeDriver output in terminal
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

    # Avoid push-messaging / background network noise during automation
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-sync")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--no-first-run")
    chrome_options.add_argument("--no-default-browser-check")
    chrome_options.add_argument("--disable-features=PushMessaging")

    # 1) Preferred: Selenium Manager (Selenium 4+)
    try:
        service = Service(log_output=os.devnull)
        return webdriver.Chrome(service=service, options=chrome_options)
    except Exception as first_error:
        # 2) Fallback: webdriver-manager
        driver_path = ChromeDriverManager().install()
        resolved = Path(driver_path)

        def is_chromedriver_exe(p: Path) -> bool:
            try:
                return p.exists() and p.is_file() and p.name.lower() == "chromedriver.exe"
            except Exception:
                return False

        chromedriver_exe = None

        # webdriver-manager sometimes returns a non-exe path (e.g., THIRD_PARTY_NOTICES.chromedriver)
        # so we must search for the actual chromedriver.exe near that path.
        if is_chromedriver_exe(resolved):
            chromedriver_exe = resolved
        else:
            search_roots = []
            if resolved.exists():
                search_roots.append(resolved.parent)
                search_roots.append(resolved)

            for root in search_roots:
                try:
                    if root.is_dir():
                        hit = next((p for p in root.rglob("chromedriver.exe") if is_chromedriver_exe(p)), None)
                        if hit is not None:
                            chromedriver_exe = hit
                            break
                except Exception:
                    continue

        if chromedriver_exe is None:
            raise RuntimeError(
                "Failed to locate a ChromeDriver executable (chromedriver.exe). "
                f"webdriver-manager returned: {driver_path}"
            ) from first_error

        service = Service(executable_path=str(chromedriver_exe), log_output=os.devnull)
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
    app_url = (os.getenv("APP_URL", "http://localhost:5173") or "").strip()
    app_url = app_url.rstrip("/")
    if app_url and not (app_url.startswith("http://") or app_url.startswith("https://")):
        # Be forgiving if the user sets APP_URL like "localhost:5173"
        app_url = f"http://{app_url}"

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
