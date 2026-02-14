import os
import re

# Folder to scan (change if needed)
ROOT_DIR = "."

# Regex pattern to find the tag
PATTERN = re.compile(r'(<div\s+class=["\']article-content["\']>)', re.IGNORECASE)

# Code to insert
INSERT_CODE = """<!-- ====== Search Bar ========  -->
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

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Skip if already inserted
    if "Search Bar Ends" in content:
        return False

    # Replace using regex
    new_content, count = PATTERN.subn(INSERT_CODE + r"\n\1", content, count=1)

    if count > 0:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True

    return False


def scan_folder(root):
    modified = 0
    total = 0

    for foldername, _, filenames in os.walk(root):
        for filename in filenames:
            if filename.lower().endswith(".html"):
                total += 1
                path = os.path.join(foldername, filename)
                if process_file(path):
                    modified += 1
                    print(f"✔ Modified: {path}")

    print(f"\nDone. Modified {modified} out of {total} HTML files.")


if __name__ == "__main__":
    scan_folder(ROOT_DIR)