import os
import re

# Root folder
ROOT_DIR = os.path.abspath(".")

# Pattern to match </main> (case insensitive, allows spacing)
MAIN_CLOSE_PATTERN = re.compile(r'(</main\s*>)', re.IGNORECASE)

# Code to insert
RELATED_SECTION = """</main>
<section class="related-section">
    <h3>Related Articles</h3>
    <div id="related-posts"></div>
</section>
"""

def already_inserted(content):
    """Prevent duplicate insertion"""
    return 'id="related-posts"' in content


def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if already_inserted(content):
            return False

        # Replace </main> with </main> + section
        new_content, count = MAIN_CLOSE_PATTERN.subn(
            RELATED_SECTION,
            content,
            count=1
        )

        if count > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)

            return True

        return False

    except Exception as e:
        print(f"✖ Error: {filepath} -> {e}")
        return False


def scan_folder(root):
    modified = 0
    total = 0

    for foldername, _, filenames in os.walk(root):

        for filename in filenames:

            if not filename.lower().endswith(".html"):
                continue

            total += 1
            filepath = os.path.join(foldername, filename)

            if process_file(filepath):
                modified += 1
                print(f"✔ Modified: {filepath}")

    print("\n====== DONE ======")
    print(f"Modified: {modified}")
    print(f"Scanned:  {total}")


if __name__ == "__main__":
    scan_folder(ROOT_DIR)