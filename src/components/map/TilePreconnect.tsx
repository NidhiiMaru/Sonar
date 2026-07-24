/**
 * Preconnect to the CARTO basemap CDN so map tiles start downloading sooner
 * (Lighthouse: ~420 ms LCP saving on the map). Next hoists these <link>s to <head>.
 */
export function TilePreconnect() {
  return (
    <>
      <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://d.basemaps.cartocdn.com" crossOrigin="anonymous" />
    </>
  );
}
