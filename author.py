import os
import re

# ==========================================
# CONFIGURATION
# ==========================================

ROOT_DIR = os.path.abspath(".")

FOOTER_OPEN_PATTERN = re.compile(
    r"<footer\b[^>]*>",
    re.IGNORECASE
)

FOOTER_CLOSE_PATTERN = re.compile(
    r"</footer>",
    re.IGNORECASE
)

START_MARKER = "<!-- NEW_FOOTER_START -->"
END_MARKER = "<!-- NEW_FOOTER_END -->"


# ==========================================
# FILE PROCESSING
# ==========================================

def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        original_content = content

        # Insert marker before opening footer tag
        if START_MARKER not in content:
            content, _ = FOOTER_OPEN_PATTERN.subn(
                lambda m: START_MARKER + "\n" + m.group(0),
                content,
                count=1
            )

        # Insert marker after closing footer tag
        if END_MARKER not in content:
            content, _ = FOOTER_CLOSE_PATTERN.subn(
                lambda m: m.group(0) + "\n" + END_MARKER,
                content,
                count=1
            )

        if content != original_content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

            return True

        return False

    except Exception as e:
        print(f"✖ Error processing {filepath}: {e}")
        return False


# ==========================================
# FOLDER SCANNER
# ==========================================

def scan_folder(root):
    modified = 0
    scanned = 0

    for foldername, _, filenames in os.walk(root):
        for filename in filenames:

            if not filename.lower().endswith(".html"):
                continue

            scanned += 1
            filepath = os.path.join(foldername, filename)

            if process_file(filepath):
                modified += 1
                print(f"✔ Modified: {filepath}")

    print("\n========== DONE ==========")
    print(f"Modified: {modified}")
    print(f"Scanned:  {scanned}")


# ==========================================
# SCRIPT ENTRY POINT
# ==========================================

if __name__ == "__main__":
    scan_folder(ROOT_DIR)