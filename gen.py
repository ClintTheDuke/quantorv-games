import os
import re

# ============================================================
# GAME ADVERT INJECTOR
# Inserts the Archery Game advert immediately before <main>
# in every HTML file inside the "topics" folder.
# ============================================================

# Folder containing the HTML files
ROOT_DIR = os.path.abspath("topics")


# ============================================================
# GAME ADVERT
# ============================================================

GAME_ADVERT = """<!-- GAME ADVERT BEGINS --> 

<dialog id="archery-modal">
    
    <!-- Game Image -->
    <img
        src="https://cdn.jsdelivr.net/gh/ClintTheDuke/qvg@main/qvg226/archery-game.jpg"
        alt="Archery Game by Adnan Zawad Toky"
        class="archery-modal-image"
    >

    <!-- Content -->
    <h2>Play Archery Online For Free!</h2>

    <p>
        How Good is your aim, accuracy, and shooting skills??
        Play the
        <strong>Archery Game</strong>. Hit the target,
        build your score, and see how accurate you can be.
    </p>

    <!-- User Preference -->
    <fieldset class="archery-preference">

        <legend>Game Preference</legend>

        <label>
            <input
                type="checkbox"
                id="ShowMoreGames"
                name="show-more-games"
            >
            Show More Like This?
        </label>

    </fieldset>

    <!-- Action Buttons -->
    <div class="modal-actions">

        <form method="dialog">

            <button
                value="cancel"
                type="submit"
                class="btn-secondary"
            >
                Cancel
            </button>

            <a
                href="https://quantorv-games.com/archery/archery.html"
                class="btn-primary"
            >
                To Game 🕹️
            </a>

        </form>

    </div>

</dialog>

<!-- GAME ADVERT ENDS -->
"""


# ============================================================
# PATTERN
# ============================================================

# Finds the opening <main> tag, regardless of attributes.
MAIN_PATTERN = re.compile(
    r"<main\b[^>]*>",
    re.IGNORECASE
)


# Used to determine whether this advert has already been inserted.
ADVERT_MARKER = "<!-- GAME ADVERT BEGINS -->"


# ============================================================
# PROCESS ONE HTML FILE
# ============================================================

def process_file(file_path):

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()

    except Exception as error:
        print(f"❌ Error reading: {file_path}")
        print(f"   {error}")
        return "error"


    # --------------------------------------------------------
    # Don't insert the advert twice
    # --------------------------------------------------------

    if ADVERT_MARKER in content:
        print(f"⏭️ Already implemented: {file_path}")
        return "already"


    # --------------------------------------------------------
    # Find <main>
    # --------------------------------------------------------

    match = MAIN_PATTERN.search(content)

    if not match:
        print(f"⚠️ <main> tag not found: {file_path}")
        return "no_main"


    # --------------------------------------------------------
    # Insert advert immediately BEFORE <main>
    # --------------------------------------------------------

    insertion_point = match.start()

    new_content = (
        content[:insertion_point]
        + GAME_ADVERT
        + "\n\n"
        + content[insertion_point:]
    )


    # --------------------------------------------------------
    # Write updated HTML
    # --------------------------------------------------------

    try:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(new_content)

    except Exception as error:
        print(f"❌ Error writing: {file_path}")
        print(f"   {error}")
        return "error"


    print(f"✅ Updated: {file_path}")
    return "updated"


# ============================================================
# SCAN ALL HTML FILES
# ============================================================

def scan_all_html():

    if not os.path.isdir(ROOT_DIR):
        print(f"❌ Folder not found: {ROOT_DIR}")
        return


    scanned = 0
    updated = 0
    already = 0
    no_main = 0
    errors = 0


    # Walk through topics and all its subfolders
    for root, dirs, files in os.walk(ROOT_DIR):

        for filename in files:

            if not filename.lower().endswith(".html"):
                continue


            scanned += 1

            file_path = os.path.join(root, filename)

            result = process_file(file_path)


            if result == "updated":
                updated += 1

            elif result == "already":
                already += 1

            elif result == "no_main":
                no_main += 1

            elif result == "error":
                errors += 1


    # ========================================================
    # SUMMARY
    # ========================================================

    print("\n" + "=" * 60)
    print("GAME ADVERT INJECTION COMPLETE")
    print("=" * 60)

    print(f"HTML files scanned:        {scanned}")
    print(f"Files updated:             {updated}")
    print(f"Already implemented:       {already}")
    print(f"<main> not found:          {no_main}")
    print(f"Errors:                    {errors}")

    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    scan_all_html()