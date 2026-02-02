import React from 'react';
import PropertyCard from './PropertyCard';
import './SavedProperties.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SavedProperties({ properties, onDelete }) {
  const [expanded, setExpanded] = React.useState({});

  const handleToggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (properties.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h2>No Saved Properties</h2>
        <p>Search for properties and save them here to compare later</p>
      </div>
    );
  }

  // Compute map center (average of all lat/lon)
  const validProps = properties.filter(p => p.lat && p.lon);
  const mapCenter = validProps.length
    ? [
        validProps.reduce((sum, p) => sum + p.lat, 0) / validProps.length,
        validProps.reduce((sum, p) => sum + p.lon, 0) / validProps.length
      ]
    : [37.7749, -122.4194]; // Default SF

  return (
    <div className="saved-properties">
      <div className="saved-header">
        <h2>Your Saved Properties</h2>
        <p className="saved-count">{properties.length} {properties.length === 1 ? 'property' : 'properties'} saved</p>
      </div>

      {validProps.length > 0 && (
        <div style={{ height: 350, width: '100%', marginBottom: 32, borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validProps.map((p, i) => (
              <Marker key={p.id || i} position={[p.lat, p.lon]}>
                <Popup>
                  <div>
                    <strong>{p.address}</strong><br />
                    Parcel: {p.assessor_parcel_number || p.parcel || 'N/A'}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="properties-list">
        {properties.map((property) => {
          const isOpen = !!expanded[property.id];
          return (
            <div key={property.id} className="collapsible-property">
              <div className="collapsible-header" onClick={() => handleToggle(property.id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f0e8', padding: '1em', borderRadius: 8, border: '1px solid #ccc', marginBottom: 8}}>
                <div>
                  <strong>Parcel/Lot:</strong> {property.assessor_parcel_number || property.parcel || 'N/A'}<br />
                  <strong>Address:</strong> {property.address}
                </div>
                <span style={{fontSize: 24}}>{isOpen ? '▼' : '►'}</span>
              </div>
              {isOpen && (
                <PropertyCard
                  property={property}
                  onDelete={onDelete}
                  showSaveButton={false}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SavedProperties;
