import os
import re

# Root folder to scan
ROOT_DIR = os.path.abspath(".")

# Regex to match: <div id="cta"> with flexible spacing and quotes
CTA_PATTERN = re.compile(
    r'(<div\s+id\s*=\s*["\']cta["\']\s*>)',
    re.IGNORECASE
)

# Root folder insert code
ROOT_INSERT = """<!-- ====== Search Bar ========  -->
<form action="search.html" method="GET" class="input__container">
  <div class="shadow__input"></div>

  <button type="submit" class="input__button__shadow">
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20px" width="20px">
      <path d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z" fill-rule="evenodd" fill="#17202A"></path>
    </svg>
  </button>

  <input 
    type="text" 
    name="q" 
    class="input__search" 
    placeholder="What do you want to search?"
    required
  >
</form>
<!-- ====== Search Bar Ends =======  -->
"""

# Subfolder insert code
SUB_INSERT = ROOT_INSERT.replace('action="search.html"', 'action="../search.html"')


def is_root_file(filepath):
    """Check if file is in root folder"""
    parent = os.path.dirname(os.path.abspath(filepath))
    return parent == ROOT_DIR


def already_inserted(content):
    """Prevent duplicate insertion"""
    return "Search Bar Ends" in content


def process_file(filepath):
    """Insert search bar above <div id="cta">"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if already_inserted(content):
            return False

        # Choose correct insert code
        insert_code = ROOT_INSERT if is_root_file(filepath) else SUB_INSERT

        # Insert above CTA div
        new_content, count = CTA_PATTERN.subn(
            insert_code + r"\n\1",
            content,
            count=1
        )

        if count > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True

        return False

    except Exception as e:
        print(f"✖ Error processing {filepath}: {e}")
        return False


def scan_folder(root):
    """Recursively scan all HTML files"""
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

    print("\n========== DONE ==========")
    print(f"Modified: {modified}")
    print(f"Scanned:  {total}")


if __name__ == "__main__":
    scan_folder(ROOT_DIR)