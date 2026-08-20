import os
import re

# =====================================================
# Add bookmarkNav ID to the complete bookmark banner item
#
# Scans ALL HTML files recursively.
#
# Finds the entire bookmark block:
#
# <div class="banner-item">
#
#     <span class="banner-icon">
#
#         <svg id="bookmarkIcon">
#             <use href="../assets/banner.svg#bookmark"></use>
#         </svg>
#
#     </span>
#
#     <span class="banner-text">
#         Bookmarks
#     </span>
#
# </div>
#
# And replaces it with:
#
# <div class="banner-item" id="bookmarkNav">
#
#     <span class="banner-icon">
#
#         <svg id="bookmarkIcon">
#             <use href="../assets/banner.svg#bookmark"></use>
#         </svg>
#
#     </span>
#
#     <span class="banner-text">
#         Bookmarks
#     </span>
#
# </div>
#
# Skips:
# - Pages where bookmarkNav is already implemented
# - Pages where the complete bookmark block does not exist
# =====================================================


# Root folder to scan
ROOT_DIR = os.path.abspath(".")


# =====================================================
# Regex: Find the COMPLETE bookmark banner block
# =====================================================

BOOKMARK_PATTERN = re.compile(
    r'<div\s+class=["\']banner-item["\']\s*>\s*'
    
    r'<span\s+class=["\']banner-icon["\']\s*>\s*'
    
    r'<svg\s+id=["\']bookmarkIcon["\']\s*>\s*'
    
    r'<use\s+href=["\']\.\./assets/banner\.svg#bookmark["\']\s*>\s*</use>\s*'
    
    r'</svg>\s*'
    
    r'</span>\s*'
    
    r'<span\s+class=["\']banner-text["\']\s*>\s*'
    
    r'Bookmarks\s*'
    
    r'</span>\s*'
    
    r'</div>',
    
    re.IGNORECASE
)


# =====================================================
# Replacement HTML
# =====================================================

REPLACEMENT = """<div class="banner-item" id="bookmarkNav">

    <span class="banner-icon">

        <svg id="bookmarkIcon">
            <use href="../assets/banner.svg#bookmark"></use>
        </svg>

    </span>
            
    <span class="banner-text">
        Bookmarks
    </span>

</div>"""


def already_implemented(content):
    """
    Check whether bookmarkNav has already been added.
    """

    return re.search(
        r'<div[^>]*\bid=["\']bookmarkNav["\']',
        content,
        re.IGNORECASE
    ) is not None


def process_file(filepath):
    """
    Process one HTML file.
    """

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

    except FileNotFoundError:
        print(f"✖ File not found: {filepath}")
        return "error"

    except PermissionError:
        print(f"✖ Permission denied: {filepath}")
        return "error"

    except UnicodeDecodeError:
        print(f"✖ Encoding error: {filepath}")
        return "error"

    except Exception as e:
        print(f"✖ Error reading {filepath}: {e}")
        return "error"


    # =================================================
    # Skip if already implemented
    # =================================================

    if already_implemented(content):
        print(f"⏭ Already implemented, skipping: {filepath}")
        return "already"


    # =================================================
    # Check whether complete bookmark block exists
    # =================================================

    if not BOOKMARK_PATTERN.search(content):
        print(
            f"⚪ Complete bookmark block not found, "
            f"leaving unchanged: {filepath}"
        )
        return "not_found"


    # =================================================
    # Replace COMPLETE bookmark block
    # =================================================

    new_content, count = BOOKMARK_PATTERN.subn(
        REPLACEMENT,
        content,
        count=1
    )


    if count == 0:
        print(f"⚠ Replacement failed: {filepath}")
        return "error"


    # =================================================
    # Write updated file
    # =================================================

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"✔ Added bookmarkNav: {filepath}")
        return "updated"

    except PermissionError:
        print(f"✖ Permission denied while writing: {filepath}")

    except Exception as e:
        print(f"✖ Error writing {filepath}: {e}")

    return "error"


def scan_all_html(root):
    """
    Recursively scan ALL HTML files from the root directory.
    """

    updated = 0
    already = 0
    not_found = 0
    errors = 0
    scanned = 0


    print("\n==============================================")
    print("   BOOKMARK NAV UPDATE SCRIPT")
    print("==============================================")
    print(f"Root folder: {root}")
    print("Scanning all HTML files recursively...\n")


    # =================================================
    # Walk through entire website
    # =================================================

    for foldername, _, filenames in os.walk(root):

        for filename in filenames:

            if not filename.lower().endswith(".html"):
                continue

            scanned += 1

            filepath = os.path.join(foldername, filename)

            result = process_file(filepath)


            # =================================================
            # Count result
            # =================================================

            if result == "updated":
                updated += 1

            elif result == "already":
                already += 1

            elif result == "not_found":
                not_found += 1

            elif result == "error":
                errors += 1


    # =====================================================
    # Final Report
    # =====================================================

    print("\n")
    print("==============================================")
    print("              WORKFLOW COMPLETE")
    print("==============================================")
    print(f"HTML files scanned       : {scanned}")
    print(f"Pages updated            : {updated}")
    print(f"Already implemented      : {already}")
    print(f"Bookmark block absent    : {not_found}")
    print(f"Errors                   : {errors}")
    print("==============================================")
    print("Done.")
    print("==============================================")


if __name__ == "__main__":
    scan_all_html(ROOT_DIR)