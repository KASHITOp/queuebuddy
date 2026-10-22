'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Office } from '@/types';
import { OFFICE_TYPE_META } from '@/lib/officeMeta';
import 'maplibre-gl/dist/maplibre-gl.css';

interface OfficeMapProps {
  offices: Office[];
  selectedOffice?: Office | null;
  onSelectOffice: (office: Office) => void;
  provider?: 'osm' | 'maptiler' | 'mapbox';
}

// Free OpenStreetMap raster tiles (no API key); the .night-map CSS filter turns them dark to match the app.
const OSM_TILES = ['a', 'b', 'c'].map((s) => `https://${s}.tile.openstreetmap.org/{z}/{x}/{y}.png`);

export const OfficeMap: React.FC<OfficeMapProps> = ({
  offices,
  selectedOffice = null,
  onSelectOffice,
  provider = (process.env.NEXT_PUBLIC_MAP_PROVIDER as OfficeMapProps['provider']) || 'osm',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const onSelectRef = useRef(onSelectOffice);
  onSelectRef.current = onSelectOffice;
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (!mapContainer.current || mapRef.current) return;

      const style =
        provider === 'maptiler' && process.env.NEXT_PUBLIC_MAP_KEY
          ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAP_KEY}`
          : {
              version: 8 as const,
              sources: {
                basemap: {
                  type: 'raster' as const,
                  tiles: OSM_TILES,
                  tileSize: 256,
                  attribution: '© OpenStreetMap contributors',
                },
              },
              layers: [{ id: 'basemap', type: 'raster' as const, source: 'basemap' }],
            };

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style,
        center: [77.6146, 12.9616],
        zoom: 11.3,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
      });
      map.touchZoomRotate.disableRotation();

      map.on('load', () => {
        if (!isMounted) return;
        mapRef.current = map;
        setMapLoaded(true);
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [provider]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const renderMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      offices.forEach((office) => {
        const meta = OFFICE_TYPE_META[office.office_type];
        const isSelected = selectedOffice?.id === office.id;
        const soon = office.status === 'coming_soon';

        const el = document.createElement('button');
        el.setAttribute('aria-label', office.name);
        el.style.cssText = 'background:none;border:0;padding:0;cursor:pointer;';
        el.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;opacity:${soon ? 0.55 : 1};transform:scale(${isSelected ? 1.15 : 1});transition:transform .2s">
            <div style="display:flex;align-items:center;gap:6px;padding:6px 10px 6px 6px;border-radius:999px;background:#18181C;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 8px 20px rgba(0,0,0,.6);font:700 12px/1 var(--font-onest),system-ui;color:#FAFAF7;white-space:nowrap">
              <span style="width:18px;height:18px;border-radius:999px;background:linear-gradient(140deg,${meta.tint[0]},${meta.tint[1]});display:inline-block"></span>
              ${office.area}
            </div>
            <div style="width:2px;height:8px;background:${meta.tint[0]}"></div>
            <div style="width:8px;height:8px;border-radius:999px;background:${meta.tint[0]};box-shadow:0 0 12px ${meta.tint[0]}"></div>
          </div>`;

        el.addEventListener('click', () => {
          onSelectRef.current(office);
          mapRef.current?.flyTo({ center: [office.lng, office.lat], zoom: 13.5, duration: 800 });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([office.lng, office.lat])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    };

    renderMarkers();
  }, [offices, selectedOffice, mapLoaded]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && selectedOffice) {
      mapRef.current.flyTo({ center: [selectedOffice.lng, selectedOffice.lat], zoom: 13.5, duration: 900 });
    }
  }, [selectedOffice, mapLoaded]);

  return (
    <div className={`relative w-full h-full min-h-[320px] bg-night-700 ${provider === 'maptiler' && process.env.NEXT_PUBLIC_MAP_KEY ? '' : 'night-map'}`}>
      {/* Inline position: maplibre-gl.css sets .maplibregl-map to relative, which would collapse it to 0px. */}
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};
