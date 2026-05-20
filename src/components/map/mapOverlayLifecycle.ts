import type maplibregl from 'maplibre-gl';

export function runWhenStyleReady(map: maplibregl.Map, syncOverlay: () => void): () => void {
  let disposed = false;
  const syncIfActive = () => {
    if (!disposed) {
      syncOverlay();
    }
  };

  if (map.isStyleLoaded()) {
    syncIfActive();
  } else {
    map.once('load', syncIfActive);
  }

  map.on('style.load', syncIfActive);

  return () => {
    disposed = true;
    map.off('load', syncIfActive);
    map.off('style.load', syncIfActive);
  };
}
