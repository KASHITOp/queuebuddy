'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Office } from '@/types';
import 'maplibre-gl/dist/maplibre-gl.css';

interface OfficeMapProps {
  offices: Office[];
  selectedOffice?: Office | null;
  onSelectOffice: (office: Office) => void;
  provider?: 'osm' | 'maptiler' | 'mapbox';
}

export const OfficeMap: React.FC<OfficeMapProps> = ({
  offices,
  selectedOffice = null,
  onSelectOffice,
  provider = (process.env.NEXT_PUBLIC_MAP_PROVIDER as any) || 'osm',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import maplibre-gl to avoid SSR issues
    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      if (!mapContainer.current || mapRef.current) return;

      // Swappable style definition
      let style: any;
      if (provider === 'maptiler' && process.env.NEXT_PUBLIC_MAP_KEY) {
        style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAP_KEY}`;
      } else {
        // Default Free OpenStreetMap style (no API key required)
        style = {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        };
      }

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style,
        center: [77.5946, 12.9716], // Bengaluru center (Vidhana Soudha / MG Road)
        zoom: 11.5,
        attributionControl: false,
      });

      // Add navigation controls (+ / -)
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

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

  // Update markers when offices or selectedOffice change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const renderMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      offices.forEach((office) => {
        const isSelected = selectedOffice?.id === office.id;
        const isComingSoon = office.status === 'coming_soon';

        // Marker color by office type
        let colorClass = 'bg-amber-500 text-slate-950 border-amber-300';
        if (office.office_type === 'rto') colorClass = 'bg-indigo-600 text-white border-indigo-300';
        if (office.office_type === 'psk') colorClass = 'bg-emerald-600 text-white border-emerald-300';
        if (office.office_type === 'sub_registrar') colorClass = 'bg-amber-600 text-white border-amber-300';
        if (office.office_type === 'utility') colorClass = 'bg-cyan-600 text-white border-cyan-300';

        const el = document.createElement('div');
        el.className = `cursor-pointer transition-transform duration-200 transform hover:scale-110`;
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? `<div class="absolute -inset-2 bg-amber-400 rounded-full animate-ping opacity-75"></div>`
                : ''
            }
            <div class="relative px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 flex items-center gap-1.5 ${colorClass} ${
          isComingSoon ? 'opacity-80 border-dashed' : ''
        }">
              <span>${
                office.office_type === 'rto'
                  ? '🚗'
                  : office.office_type === 'sub_registrar'
                  ? '📜'
                  : office.office_type === 'psk'
                  ? '🛂'
                  : office.office_type === 'utility'
                  ? '⚡'
                  : '🏛️'
              }</span>
              <span class="truncate max-w-[110px]">${office.name.split(' ')[0]}</span>
            </div>
            <div class="w-2 h-2 rotate-45 mt-[-4px] bg-slate-900 border-r border-b border-white"></div>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectOffice(office);
          mapRef.current.flyTo({
            center: [office.lng, office.lat],
            zoom: 13.5,
            duration: 800,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([office.lng, office.lat])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    };

    renderMarkers();
  }, [offices, selectedOffice, mapLoaded, onSelectOffice]);

  // Center on selected office if changed externally
  useEffect(() => {
    if (mapLoaded && mapRef.current && selectedOffice) {
      mapRef.current.flyTo({
        center: [selectedOffice.lng, selectedOffice.lat],
        zoom: 13.5,
        duration: 900,
      });
    }
  }, [selectedOffice, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainer} className="w-full h-full min-h-[320px]" />

      {/* Swappable Provider Badge */}
      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 z-10 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Map: {provider.toUpperCase()} (OpenStreetMap tiles)</span>
      </div>
    </div>
  );
};
