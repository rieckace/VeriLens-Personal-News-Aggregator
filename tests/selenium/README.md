# Selenium E2E

## Prereqs

- Start MongoDB locally
- Start backend on `http://localhost:5000`
- Start frontend on `http://localhost:5173`
- Google Chrome installed

Note: The test runner uses Selenium Manager by default (built into Selenium 4+) to locate/download a compatible ChromeDriver.

## Setup

```powershell
cd tests\selenium
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
$env:APP_URL="http://localhost:5173"
$env:HEADLESS="true"
python run_e2e.py
```

### Run specific modules

Auth only:

```powershell
$env:HEADLESS="true"
python run_register.py
python run_login.py
```

Preferences only:

```powershell
$env:HEADLESS="true"
python run_preferences.py
```

Bookmarks only:

```powershell
$env:HEADLESS="true"
python run_bookmarks.py
```

History only:

```powershell
$env:HEADLESS="true"
python run_history.py
```

Analytics only:

```powershell
$env:HEADLESS="true"
python run_analytics.py
```

Notifications only:

```powershell
$env:HEADLESS="true"
python run_notifications.py
```

Article page only:

```powershell
$env:HEADLESS="true"
python run_article.py
```

### Run everything

Run all module smoke tests:

```powershell
$env:HEADLESS="true"
python run_all.py
```

Include the longer full end-to-end flow too:

```powershell
$env:HEADLESS="true"
python run_all.py --include-full
```

If the run fails, the script writes debugging artifacts (screenshot + page HTML) into `tests/selenium/artifacts/` by default.

You can override the output folder:

```powershell
$env:ARTIFACTS_DIR="D:\temp\verilens-selenium-artifacts"
python run_e2e.py
```

Optional:

- `TEST_EMAIL` (if you want a fixed email)
- `TEST_PASSWORD` (default: `Password@123`)

## Troubleshooting

### WinError 193: %1 is not a valid Win32 application

This usually means an incompatible ChromeDriver binary was downloaded (wrong OS/CPU arch).

Fixes to try:

- Ensure you are on the latest Selenium in the venv:

```powershell
pip install -U selenium
```

- If you previously used `webdriver-manager`, clear its cache and rerun:

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.wdm" -ErrorAction SilentlyContinue
python run_e2e.py
```
