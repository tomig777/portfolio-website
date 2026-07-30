"""Create lightweight WebP display copies for the WebGL gallery.

The source artwork in src/assets/gallery remains untouched. The gallery prefers
matching files from src/assets/gallery-optimized and falls back to the source
file when a newly added image has not been optimized yet.
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "src" / "assets" / "gallery"
OUTPUT_DIR = ROOT / "src" / "assets" / "gallery-optimized"
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"}
MAX_EDGE = 2048
WEBP_QUALITY = 82


def optimize_image(source_path: Path) -> None:
    output_path = OUTPUT_DIR / f"{source_path.stem}.webp"

    with Image.open(source_path) as source_image:
        image = ImageOps.exif_transpose(source_image)
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)

        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")

        save_options = {
            "format": "WEBP",
            "quality": WEBP_QUALITY,
            "method": 6,
        }
        icc_profile = source_image.info.get("icc_profile")
        if icc_profile:
            save_options["icc_profile"] = icc_profile

        image.save(output_path, **save_options)

    source_mb = source_path.stat().st_size / (1024 * 1024)
    output_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"{source_path.name}: {source_mb:.2f} MB -> {output_mb:.2f} MB")


def main() -> None:
    Image.MAX_IMAGE_PIXELS = None
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sources = sorted(
        path
        for path in SOURCE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )

    for source_path in sources:
        optimize_image(source_path)


if __name__ == "__main__":
    main()
