
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from datetime import datetime


# ==========================================
# 1. CONFIGURATION
# ==========================================

PROJECT_DIR = Path(
    r"C:\Users\User\Documents\Quantorv-games"
)

# Backups are stored outside the project.
BACKUP_DIR = PROJECT_DIR.parent / (
    f"Quantorv-URL-backup-{datetime.now():%Y%m%d-%H%M%S}"
)

# True = preview only.
# False = execute modifications.
DRY_RUN = False

# Domains whose URLs are allowed to be modified.
ALLOWED_DOMAINS = {
    "quantorv-games.com",
    "www.quantorv-games.com"
}


# ==========================================
# 2. URL MATCHING PATTERN
# ==========================================

# Finds absolute URLs belonging to Quantorv Games.
# Works anywhere inside HTML files, not just href.

URL_PATTERN = re.compile(
    r"https?://(?:www\.)?quantorv-games\.com"
    r"(?::\d+)?"
    r"(?:/[^\s\"'<>]*)?",
    re.IGNORECASE
)


# ==========================================
# 3. URL PROCESSOR
# ==========================================

def fix_url(match):

    original_url = match.group(0)

    # Separate punctuation that may follow a URL
    # in ordinary text, for example: example.html,
    trailing_punctuation = ""

    while (
        original_url
        and original_url[-1] in ".,;:!?)]}"
    ):
        trailing_punctuation = (
            original_url[-1] + trailing_punctuation
        )

        original_url = original_url[:-1]

    try:
        parsed = urlsplit(original_url)

        # Confirm the hostname belongs to our domain.
        if parsed.hostname not in ALLOWED_DOMAINS:
            return match.group(0)

        # Only modify URLs whose PATH ends in .html.
        if not parsed.path.lower().endswith(".html"):
            return match.group(0)

        # Remove the final five characters (.html).
        corrected_path = parsed.path[:-5]

        # Reconstruct the URL while preserving
        # query parameters and fragments.
        corrected_url = urlunsplit((
            parsed.scheme,
            parsed.netloc,
            corrected_path,
            parsed.query,
            parsed.fragment
        ))

        return corrected_url + trailing_punctuation

    except ValueError:
        return match.group(0)


# ==========================================
# 4. FILE PROCESSOR
# ==========================================

def process_file(file_path):

    try:
        # Preserve original line endings.
        with file_path.open(
            "r",
            encoding="utf-8",
            newline=""
        ) as file:

            original_content = file.read()

    except (OSError, UnicodeError) as error:

        print(f"[ERROR] Reading {file_path}: {error}")
        return None

    # Replace every matching internal URL.
    updated_content = URL_PATTERN.sub(
        fix_url,
        original_content
    )

    if updated_content == original_content:
        return 0

    # Count actual URL changes.
    original_urls = URL_PATTERN.findall(original_content)
    updated_urls = URL_PATTERN.findall(updated_content)

    corrections = sum(
        old != new
        for old, new in zip(original_urls, updated_urls)
    )

    if corrections == 0:
        return 0

    if not DRY_RUN:

        try:
            # Preserve original directory structure.
            relative_path = file_path.relative_to(
                PROJECT_DIR
            )

            backup_path = BACKUP_DIR / relative_path

            backup_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            # Back up the original file first.
            shutil.copy2(file_path, backup_path)

            # Write the corrected content.
            with file_path.open(
                "w",
                encoding="utf-8",
                newline=""
            ) as file:

                file.write(updated_content)

        except OSError as error:

            print(f"[ERROR] Updating {file_path}: {error}")
            return None

    status = "DRY RUN" if DRY_RUN else "UPDATED"

    print(
        f"[{status}] {file_path.relative_to(PROJECT_DIR)}"
        f" | {corrections} URL(s) corrected"
    )

    return corrections


# ==========================================
# 5. MAIN PROGRAM
# ==========================================

def main():

    print("=" * 60)
    print("QUANTORV GAMES - INTERNAL URL CORRECTION")
    print("=" * 60)

    print(f"\nProject: {PROJECT_DIR}")
    print(f"Dry run: {DRY_RUN}")

    if not PROJECT_DIR.is_dir():

        print("\n[ERROR] Project directory does not exist.")
        return

    # Recursively discover HTML files.
    html_files = sorted(
        file
        for file in PROJECT_DIR.rglob("*")
        if file.is_file()
        and file.suffix.lower() in {".html", ".htm"}
        and BACKUP_DIR not in file.parents
    )

    total_files = len(html_files)

    scanned_files = 0
    modified_files = 0
    corrected_urls = 0
    failed_files = 0

    print(f"\nHTML files discovered: {total_files}")

    if not DRY_RUN:
        print(f"Backup location: {BACKUP_DIR}")

    print("\nStarting URL scan...\n")

    # Process each discovered HTML file.
    for file_path in html_files:

        scanned_files += 1

        result = process_file(file_path)

        if result is None:

            failed_files += 1
            continue

        if result > 0:

            modified_files += 1
            corrected_urls += result

    # ======================================
    # 6. FINAL REPORT
    # ======================================

    print("\n" + "=" * 60)
    print("URL CORRECTION REPORT")
    print("=" * 60)

    print(f"Files discovered:       {total_files}")
    print(f"Files scanned:          {scanned_files}")
    print(f"Files requiring fixes:  {modified_files}")
    print(f"URLs corrected:         {corrected_urls}")
    print(f"Failed files:           {failed_files}")

    if DRY_RUN:

        print("\nDRY RUN COMPLETE.")
        print("No files were modified.")
        print("Set DRY_RUN = False to execute.")

    else:

        print("\nEXECUTION COMPLETE.")
        print("Original files have been backed up.")
        print(f"Backup folder: {BACKUP_DIR}")

    print("=" * 60)


# ==========================================
# 7. EXECUTION ENTRY POINT
# ==========================================

if __name__ == "__main__":
    main()
