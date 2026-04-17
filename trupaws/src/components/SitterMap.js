import React, { useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';

// Hardcoded coords for known Shuswap towns — sitter_profiles store a text location field.
const TOWN_COORDS = {
  'Salmon Arm':  { lat: 50.6965, lng: -119.2869 },
  'Sicamous':    { lat: 50.8348, lng: -119.0020 },
  'Chase':       { lat: 50.8228, lng: -119.6878 },
  'Enderby':     { lat: 50.5504, lng: -119.1389 },
  'Armstrong':   { lat: 50.4486, lng: -119.1967 },
  'Sorrento':    { lat: 50.8728, lng: -119.4681 },
};

function coordsForSitter(sitter) {
  if (sitter.lat && sitter.lng) return { lat: sitter.lat, lng: sitter.lng };
  if (sitter.location && TOWN_COORDS[sitter.location]) return TOWN_COORDS[sitter.location];
  return null;
}

export default function SitterMap({ sitters }) {
  const navigate = useNavigate();
  const [popupInfo, setPopupInfo] = useState(null);

  const [viewport] = useState({
    latitude: 50.6965,
    longitude: -119.2869,
    zoom: 10,
  });

  const sittersMapped = sitters
    .map((s) => ({ ...s, coords: coordsForSitter(s) }))
    .filter((s) => s.coords !== null);

  if (sittersMapped.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 400, borderRadius: 16, overflow: 'hidden', marginBottom: 32, boxShadow: '0 2px 16px rgba(45,80,22,0.12)' }}>
      <Map
        initialViewState={viewport}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {sittersMapped.map((sitter) => (
          <Marker
            key={sitter.id}
            latitude={sitter.coords.lat}
            longitude={sitter.coords.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(sitter);
            }}
          >
            <div
              title={sitter.display_name}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#2D5016',
                border: '2.5px solid #D4A853',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              🐾
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            latitude={popupInfo.coords.lat}
            longitude={popupInfo.coords.lng}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div style={{ padding: '4px 2px', minWidth: 160 }}>
              <div style={{ fontWeight: 700, color: '#2D5016', fontSize: '0.95rem', marginBottom: 2 }}>
                {popupInfo.display_name || 'Sitter'}
              </div>
              {popupInfo.rate && (
                <div style={{ color: '#D4A853', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                  ${popupInfo.rate}/day
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate(`/sitter/${popupInfo.user_id}`)}
                style={{
                  background: '#2D5016',
                  color: '#F5F0E8',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                View Profile
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
