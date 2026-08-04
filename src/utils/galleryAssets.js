const galleryOptimizedModules = import.meta.glob(
  '../assets/gallery-optimized/*.webp',
  { eager: true, import: 'default' }
);

export const GALLERY_IMAGE_URLS = Object.entries(galleryOptimizedModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, {
    numeric: true,
    sensitivity: 'base'
  }))
  .map(([, imageUrl]) => imageUrl);

function getImageCategory(aspectRatio) {
  if (aspectRatio < 0.86) return 'portrait';
  if (aspectRatio > 1.18) return 'landscape';
  return 'square';
}

function loadGalleryImageMetadata(imageUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      resolve({ imageUrl, image, aspectRatio, category: getImageCategory(aspectRatio) });
    };
    image.onerror = () => resolve({ imageUrl, image: null, aspectRatio: 1, category: 'square' });
    image.src = imageUrl;
  });
}

let galleryMetadataPromise = null;

export function preparePlaygroundGallery() {
  if (!galleryMetadataPromise) {
    galleryMetadataPromise = Promise.all(GALLERY_IMAGE_URLS.map(loadGalleryImageMetadata));
  }

  return galleryMetadataPromise;
}
