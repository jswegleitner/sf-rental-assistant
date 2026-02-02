import React from 'react';
import PropertyCard from './PropertyCard';
import './SavedProperties.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SavedProperties({ properties, onDelete }) {
  const [viewMode, setViewMode] = React.useState('table'); // 'table' or 'cards'
  const [selectedProperty, setSelectedProperty] = React.useState(null);
  const [listingStatus, setListingStatus] = React.useState({});

  // Check if Craigslist listings are still live
  React.useEffect(() => {
    properties.forEach(async (property) => {
      if (property.listing_url && property.listing_url.includes('craigslist.org')) {
        try {
          const response = await fetch(property.listing_url, { method: 'HEAD', mode: 'no-cors' });
          // no-cors doesn't give us status, so we assume it's live if no error
          setListingStatus(prev => ({ ...prev, [property.id]: 'live' }));
        } catch (error) {
          setListingStatus(prev => ({ ...prev, [property.id]: 'unknown' }));
        }
      }
    });
  }, [properties]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <p className="saved-count">{properties.length} {properties.length === 1 ? 'property' : 'properties'} saved</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setViewMode('table')} 
              style={{ 
                padding: '8px 16px', 
                background: viewMode === 'table' ? '#c14d28' : '#ddd', 
                color: viewMode === 'table' ? 'white' : '#333',
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              📊 Table View
            </button>
            <button 
              onClick={() => setViewMode('cards')} 
              style={{ 
                padding: '8px 16px', 
                background: viewMode === 'cards' ? '#c14d28' : '#ddd', 
                color: viewMode === 'cards' ? 'white' : '#333',
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              📋 Card View
            </button>
          </div>
        </div>
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

      {viewMode === 'table' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f5f0e8', borderBottom: '2px solid #c14d28' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', minWidth: '180px' }}>Address</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Parcel</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Rent</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Year</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>W/D</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Parking</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>RC</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Evict</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Listing</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const amenities = property.listing_amenities || {};
                return (
                  <tr 
                    key={property.id} 
                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <td style={{ padding: '12px', minWidth: '180px' }}>
                      {property.address || property.assessor_location || 'Address not available'}
                    </td>
                    <td style={{ padding: '12px' }}>{property.assessor_parcel_number || property.parcel || 'N/A'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
                      {property.rent_price ? `$${property.rent_price}` : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>{property.year_built || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {amenities.laundry ? (
                        <span title={amenities.laundry}>
                          {amenities.laundry === 'W/D in unit' ? '✅ In Unit' :
                           amenities.laundry === 'Laundry on site' ? '🔵 On Site' :
                           amenities.laundry === 'Laundry in building' ? '🔵 In Bldg' :
                           amenities.laundry === 'No laundry on site' ? '❌ None' :
                           amenities.laundry}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {amenities.parking ? (
                        <span title={amenities.parking}>
                          {amenities.parking === 'Off-street parking' ? '✅ Off-St' :
                           amenities.parking === 'Street parking' ? '🅿️ Street' :
                           amenities.parking === 'Attached garage' ? '✅ Garage' :
                           amenities.parking === 'Detached garage' ? '🚗 Det. Gar' :
                           amenities.parking === 'Carport' ? '🚗 Carport' :
                           amenities.parking === 'No parking' ? '❌ None' :
                           amenities.parking}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: property.rent_controlled?.toLowerCase().includes('yes') ? '#d4edda' : '#f8d7da', 
                        color: property.rent_controlled?.toLowerCase().includes('yes') ? '#155724' : '#721c24',
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.85em' 
                      }}>
                        {property.rent_controlled?.toLowerCase().includes('yes') ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {property.eviction_count > 0 ? (
                        <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{property.eviction_count}</span>
                      ) : (
                        <span style={{ color: '#666' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {property.listing_url ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <a 
                            href={property.listing_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#c14d28', textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            🔗 View
                          </a>
                          {listingStatus[property.id] === 'live' && (
                            <span style={{ color: '#28a745', fontSize: '0.85em' }}>● Live</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(property.id);
                        }}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer' 
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="properties-list">
          {properties.map((property) => (
            <div key={property.id} className="collapsible-property" style={{ marginBottom: '16px' }}>
              <PropertyCard
                property={property}
                onDelete={onDelete}
                showSaveButton={false}
              />
            </div>
          ))}
        </div>
      )}

      {selectedProperty && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedProperty(null)}
        >
          <div 
            style={{ 
              background: 'white', 
              borderRadius: '8px', 
              maxWidth: '900px', 
              maxHeight: '90vh', 
              overflow: 'auto', 
              position: 'relative' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProperty(null)}
              style={{
                position: 'sticky',
                top: '10px',
                right: '10px',
                float: 'right',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <PropertyCard
              property={selectedProperty}
              onDelete={(id) => {
                onDelete(id);
                setSelectedProperty(null);
              }}
              showSaveButton={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedProperties;
