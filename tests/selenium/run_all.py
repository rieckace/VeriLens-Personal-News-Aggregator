import argparse
import os
import subprocess
import sys
from typing import List, Tuple


def env_bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    if v is None:
        return default
    return v.strip().lower() in {"1", "true", "yes", "y"}


def run_one(script: str) -> Tuple[str, int]:
    cmd = [sys.executable, script]
    p = subprocess.run(cmd)
    return script, int(p.returncode)


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Run all VeriLens Selenium module tests")
    parser.add_argument(
        "--include-full",
        action="store_true",
        help="Also run the longer full end-to-end flow (run_e2e.py)",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop on the first failing test",
    )
    args = parser.parse_args(argv)

    scripts = [
        "run_register.py",
        "run_login.py",
        "run_preferences.py",
        "run_bookmarks.py",
        "run_article.py",
        "run_history.py",
        "run_analytics.py",
        "run_notifications.py",
    ]

    if args.include_full or env_bool("INCLUDE_FULL_E2E", False):
        scripts.append("run_e2e.py")

    results: List[Tuple[str, int]] = []

    print(f"Running {len(scripts)} selenium scripts…")
    for s in scripts:
        print(f"\n=== {s} ===")
        script, code = run_one(s)
        results.append((script, code))
        if code != 0 and args.fail_fast:
            break

    failed = [r for r in results if r[1] != 0]
    print("\n=== Summary ===")
    for script, code in results:
        status = "PASS" if code == 0 else f"FAIL({code})"
        print(f"{status:9} {script}")

    if failed:
        print(f"\nFailed: {len(failed)}/{len(results)}")
        return 1

    print(f"\nAll passed: {len(results)}/{len(results)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
