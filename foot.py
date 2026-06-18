import os
import re

# ==========================================
# CONFIGURATION
# ==========================================

ROOT_DIR = os.path.abspath(".")

NEW_FOOTER = r"""
<footer>
  <section>
   <div class='footer-brief'>
    <h2> Quantorv Games</h2>
    <p>
     Quantorv Games is a web-based gaming platform featuring smart puzzle games alongside the latest news, updates, and insights from the world of gaming. Discover new challenges, sharpen your skills, and stay informed,all in one place.
    </p>
    <br>
   <div class="share-card">

    <div class="share-header">
        <svg class="share-icon">
            <use href="../assets/sprite.svg#share"></use>
        </svg>
        <span>Follow Us On:</span>
    </div>

    <div class="social-icons">

        <a href="https://www.facebook.com/profile.php?id=61587709617403" class="social-btn">
            <svg><use href="../assets/sprite.svg#facebook"></use></svg>
        </a>

        <a href="https://www.instagram.com/quantorv_games/" class="social-btn">
            <svg><use href="../assets/sprite.svg#instagram"></use></svg>
        </a>

        <a href="https://x.com/quantorvgames" class="social-btn">
            <svg><use href="../assets/sprite.svg#x"></use></svg>
        </a>

        <a href="https://www.tiktok.com/@quantorv.games" class="social-btn">
            <svg><use href="../assets/sprite.svg#tiktok"></use></svg>
        </a>

        <a href="https://www.pinterest.com/QuantorvGames2" class="social-btn">
            <svg><use href="../assets/sprite.svg#pinterest"></use></svg>
        </a>

    </div>

</div>

   </div>

   <p class="flex-center">
   <span>© Copyright</span>
   <span id='current-year' style="margin:5px;"></span>
   <strong>Quantorv Games. All Rights Reserved</strong>
   </p>

   <div class='footer-links flex-center'>
    <a href='../about.html'> About Us </a>
    <a href="../terms.html">Terms</a>
    <a href='../privacy-policy.html'> Privacy Policy</a>
   </div>
  </section>
 </footer>
"""

# Match everything from START marker to END marker
FOOTER_BLOCK_PATTERN = re.compile(
    r'<!--\s*NEW_FOOTER_START\s*-->.*?<!--\s*NEW_FOOTER_END\s*-->',
    re.DOTALL | re.IGNORECASE
)

# ==========================================
# FILE PROCESSING
# ==========================================

def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        new_content, count = FOOTER_BLOCK_PATTERN.subn(
            NEW_FOOTER,
            content
        )

        if count > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)

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

            filepath = os.path.join(
                foldername,
                filename
            )

            if process_file(filepath):
                modified += 1
                print(f"✔ Modified: {filepath}")

    print("\n========== DONE ==========")
    print(f"Modified: {modified}")
    print(f"Scanned:  {scanned}")


# ==========================================
# ENTRY POINT
# ==========================================

if __name__ == "__main__":
    scan_folder(ROOT_DIR)