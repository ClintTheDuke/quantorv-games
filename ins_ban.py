import os
import re

# =====================================================
# Add Supabase JavaScript files to HTML pages
# Inserts the Supabase scripts immediately BEFORE
# <script src="../assets/js/article.js"></script>
# =====================================================

# Root folder to scan
ROOT_DIR = os.path.abspath(".")

# Match the article.js script tag (case-insensitive)
SCRIPT_PATTERN = re.compile(
    r'(<script\s+src=["\']\.\./assets/js/article\.js["\']\s*></script>)',
    re.IGNORECASE
)

# Code to insert
SUPABASE_SCRIPTS = """<!-- ======== Supabase JavaScript Files ========= -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../supa.js"></script>
<script src="../auth.js"></script>
<!-- ======== Supabase JavaScript Files End========= -->"""


def already_inserted(content):
    """
    Prevent duplicate insertion.
    """
    return "../supa.js" in content or "../auth.js" in content


def process_file(filepath):
    """
    Insert Supabase JavaScript files before article.js.
    """

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

    except FileNotFoundError:
        print(f"✖ File not found: {filepath}")
        return False

    except PermissionError:
        print(f"✖ Permission denied: {filepath}")
        return False

    except UnicodeDecodeError:
        print(f"✖ Encoding error: {filepath}")
        return False

    except Exception as e:
        print(f"✖ Error reading {filepath}: {e}")
        return False

    # Skip if already added
    if already_inserted(content):
        print(f"⏭ Already added, skipping: {filepath}")
        return False

    # Insert immediately before article.js
    new_content, count = SCRIPT_PATTERN.subn(
        SUPABASE_SCRIPTS + "\n\n" + r"\1",
        content,
        count=1
    )

    if count == 0:
        print(f"⚠ article.js script not found: {filepath}")
        return False

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"✔ Added Supabase scripts to: {filepath}")
        return True

    except PermissionError:
        print(f"✖ Permission denied while writing: {filepath}")

    except Exception as e:
        print(f"✖ Error writing {filepath}: {e}")

    return False


def scan_topics_folder(root):
    """
    Recursively scan every HTML file inside the topics folder.
    """

    topics_dir = os.path.join(root, "topics")

    if not os.path.isdir(topics_dir):
        print(f"✖ Topics folder not found: {topics_dir}")
        return

    modified = 0
    skipped = 0
    scanned = 0

    for foldername, _, filenames in os.walk(topics_dir):

        for filename in filenames:

            if not filename.lower().endswith(".html"):
                continue

            scanned += 1

            filepath = os.path.join(foldername, filename)

            if process_file(filepath):
                modified += 1
            else:
                skipped += 1

    print("\n========== DONE ==========")
    print(f"Scanned : {scanned}")
    print(f"Added   : {modified}")
    print(f"Skipped : {skipped}")


if __name__ == "__main__":
    scan_topics_folder(ROOT_DIR)