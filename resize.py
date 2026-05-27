from PIL import Image
import os

INPUT_FOLDER = "/storage/emulated/0/asg/"
OUTPUT_FOLDER = "/storage/emulated/0/asg/resized/"

MIN_WIDTH = 1200

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

SUPPORTED_FORMATS = (".jpg", ".jpeg", ".png", ".webp")

for filename in os.listdir(INPUT_FOLDER):

    if not filename.lower().endswith(SUPPORTED_FORMATS):
        continue

    input_path = os.path.join(INPUT_FOLDER, filename)
    output_path = os.path.join(OUTPUT_FOLDER, filename)

    try:
        img = Image.open(input_path)

        # Keep aspect ratio
        width_percent = MIN_WIDTH / float(img.size[0])
        new_height = int(float(img.size[1]) * width_percent)

        resized_img = img.resize((MIN_WIDTH, new_height))

        resized_img.save(output_path, quality=95)

        print(f"Resized: {filename}")

    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Done!")