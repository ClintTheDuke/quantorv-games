
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from datetime import datetime


# ==========================================
# 1. CONFIGURATION
# ==========================================

# Change this to your actual project directory.
PROJECT_DIR = Path(
    r"C:\Users\User\Documents\Quantorv-games"
)

# Backup directory.
BACKUP_DIR = PROJECT_DIR.parent / (
    f"Quantorv-backup-{datetime.now():%Y%m%d-%H%M%S}"
)

# Set to True to inspect changes without modifying files.
DRY_RUN = False

# Accepted canonical domains.
ALLOWED_DOMAINS = {
    "quantorv-games.com",
    "www.quantorv-games.com"
}


# ==========================================
# 2. CANONICAL TAG PATTERN
# ==========================================

# Matches canonical link elements, including
# different attribute orders and quote styles.

CANONICAL_PATTERN = re.compile(
    r"<link\b(?=[^>]*\brel\s*=\s*(['\"]?)canonical\1)"
    r"[^>]*>",
    re.IGNORECASE
)

# Finds the href attribute inside a canonical tag.
HREF_PATTERN = re.compile(
    r"\bhref\s*=\s*(['\"])(.*?)\1",
    re.IGNORECASE | re.DOTALL
)


# ==========================================
# 3. CANONICAL URL PROCESSOR
# ==========================================

def fix_canonical(tag):

    href_match = HREF_PATTERN.search(tag)

    if not href_match:
        return tag, False

    original_url = href_match.group(2)

    try:
        parsed = urlsplit(original_url)

        # Only process absolute HTTPS URLs.
        if parsed.scheme.lower() != "https":
            return tag, False

        # Only process Quantorv Games domains.
        if parsed.hostname not in ALLOWED_DOMAINS:
            return tag, False

        # Check the actual URL path, not its query or fragment.
        if not parsed.path.lower().endswith(".html"):
            return tag, False

        # Remove the .html extension.
        corrected_path = parsed.path[:-5]

        corrected_url = urlunsplit((
            parsed.scheme,
            parsed.netloc,
            corrected_path,
            parsed.query,
            parsed.fragment
        ))

        # Replace only the href value.
        start, end = href_match.span(2)

        updated_tag = (
            tag[:start]
            + corrected_url
            + tag[end:]
        )

        return updated_tag, True

    except ValueError:
        return tag, False


# ==========================================
# 4. FILE PROCESSOR
# ==========================================

def process_file(file_path):

    try:
        original_content = file_path.read_text(
            encoding="utf-8"
        )

    except (OSError, UnicodeError) as error:
        print(f"[ERROR] Cannot read {file_path}: {error}")
        return None

    corrections = 0

    def replace_tag(match):

        nonlocal corrections

        updated_tag, changed = fix_canonical(
            match.group(0)
        )

        if changed:
            corrections += 1

        return updated_tag

    updated_content = CANONICAL_PATTERN.sub(
        replace_tag,
        original_content
    )

    if corrections == 0:
        return 0

    if not DRY_RUN:

        try:
            # Preserve directory structure in backup.
            relative_path = file_path.relative_to(
                PROJECT_DIR
            )

            backup_path = BACKUP_DIR / relative_path

            backup_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            # Back up original file.
            shutil.copy2(file_path, backup_path)

            # Write corrected content.
            file_path.write_text(
                updated_content,
                encoding="utf-8",
                newline=""
            )

        except OSError as error:
            print(f"[ERROR] Cannot update {file_path}: {error}")
            return None

    print(
        f"[{'DRY RUN' if DRY_RUN else 'UPDATED'}] "
        f"{file_path.relative_to(PROJECT_DIR)} "
        f"({corrections} canonical correction(s))"
    )

    return corrections


# ==========================================
# 5. MAIN PROGRAM
# ==========================================

def main():

    print("=" * 55)
    print("QUANTORV GAMES CANONICAL URL CORRECTION")
    print("=" * 55)

    print(f"\nProject directory: {PROJECT_DIR}")
    print(f"Dry run enabled: {DRY_RUN}")

    if not PROJECT_DIR.is_dir():
        print("\n[ERROR] Project directory does not exist.")
        return

    # Recursively collect HTML files.
    html_files = sorted(
        file for file in PROJECT_DIR.rglob("*")
        if file.is_file()
        and file.suffix.lower() in {".html", ".htm"}
        and BACKUP_DIR not in file.parents
    )

    total_files = len(html_files)
    scanned_files = 0
    modified_files = 0
    corrected_tags = 0
    failed_files = 0

    print(f"\nHTML files discovered: {total_files}")

    if not DRY_RUN:
        print(f"Backup location: {BACKUP_DIR}")

    print("\nStarting scan...\n")

    for file_path in html_files:

        scanned_files += 1

        result = process_file(file_path)

        if result is None:
            failed_files += 1
            continue

        if result > 0:
            modified_files += 1
            corrected_tags += result

    # ======================================
    # 6. FINAL REPORT
    # ======================================

    print("\n" + "=" * 55)
    print("PROCESS COMPLETED")
    print("=" * 55)

    print(f"Files scanned:          {scanned_files}")
    print(f"Files requiring fixes:  {modified_files}")
    print(f"Canonical tags fixed:   {corrected_tags}")
    print(f"Failed files:           {failed_files}")

    if DRY_RUN:
        print("\nDRY RUN: No files were modified.")
        print("Set DRY_RUN = False to execute the changes.")

    else:
        print("\nChanges have been applied.")
        print(f"Original files backed up at:\n{BACKUP_DIR}")

    print("=" * 55)


# ==========================================
# 7. EXECUTE
# ==========================================

if __name__ == "__main__":
    main()
