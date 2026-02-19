# Selenium E2E

## Prereqs

- Start MongoDB locally
- Start backend on `http://localhost:5000`
- Start frontend on `http://localhost:5173`
- Google Chrome installed

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

Optional:

- `TEST_EMAIL` (if you want a fixed email)
- `TEST_PASSWORD` (default: `Password@123`)
