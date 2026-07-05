import os
import re

# Root folder to scan
ROOT_DIR = os.path.abspath(".")

# Regex to match the closing </head> tag (case-insensitive)
HEAD_PATTERN = re.compile(r"(</head\s*>)", re.IGNORECASE)

# Marker used to detect existing insertion
MARKER = "======= AdSense Code ======"

# AdSense code to insert
ADSENSE_CODE = """<!-- ======= AdSense Code ====== -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3615083464844723"
     crossorigin="anonymous"></script>
<!-- ======= AdSense Code Ends ====== -->
"""


def already_inserted(content):
    """Check if AdSense code already exists."""
    return MARKER in content


def process_file(filepath):
    """Insert AdSense code above </head>."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        filename = os.path.relpath(filepath, ROOT_DIR)

        if already_inserted(content):
            print(f"⏭ Skipping already inserted: {filename}")
            return "skipped"

        new_content, count = HEAD_PATTERN.subn(
            ADSENSE_CODE + "\n\\1",
            content,
            count=1
        )

        if count == 0:
            print(f"⚠ No </head> tag found: {filename}")
            return "nohead"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"✔ AdSense code inserted: {filename}")
        return "inserted"

    except Exception as e:
        print(f"✖ Error processing {filepath}: {e}")
        return "error"


def scan_folder(root):
    """Recursively scan all HTML files."""
    scanned = 0
    inserted = 0
    skipped = 0
    nohead = 0
    errors = 0

    for foldername, _, filenames in os.walk(root):
        for filename in filenames:

            if not filename.lower().endswith(".html"):
                continue

            scanned += 1
            filepath = os.path.join(foldername, filename)

            result = process_file(filepath)

            if result == "inserted":
                inserted += 1
            elif result == "skipped":
                skipped += 1
            elif result == "nohead":
                nohead += 1
            else:
                errors += 1

    print("\n========== DONE ==========")
    print(f"HTML files scanned : {scanned}")
    print(f"AdSense inserted   : {inserted}")
    print(f"Already inserted   : {skipped}")
    print(f"No </head> found   : {nohead}")
    print(f"Errors             : {errors}")


if __name__ == "__main__":
    scan_folder(ROOT_DIR)