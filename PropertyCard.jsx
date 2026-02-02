import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import './PropertyCard.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function PropertyCard({ property, onSave, onDelete, showSaveButton = false }) {
  const handleSave = () => {
    if (onSave) {
      onSave(property);
    }
  };

  const handleDelete = () => {
    if (onDelete && property.id) {
      onDelete(property.id);
    }
  };

  const InfoRow = ({ label, value, highlight = false, warning = false }) => (
    <div className={`info-row ${highlight ? 'highlight' : ''} ${warning ? 'warning' : ''}`}>
      <span className="info-label">{label}</span>
      <span className="info-value">{value || 'Not available'}</span>
    </div>
  );

  // Helper to render rent control badge
  const RentControlBadge = () => {
    const isVerified = property.rent_controlled?.includes('Verified');
    const isControlled = property.rent_controlled?.toLowerCase().includes('yes');
    
    return (
      <div className={`rent-control-badge ${isControlled ? 'controlled' : 'not-controlled'} ${isVerified ? 'verified' : ''}`}>
        <span className="badge-icon">{isControlled ? '🏠' : '🏢'}</span>
        <span className="badge-text">
          {isControlled ? 'Rent Controlled' : 'Not Rent Controlled'}
          {isVerified && <span className="verified-tag">✓ Verified</span>}
        </span>
      </div>
    );
  };

  // Helper to render amenities from Craigslist listing
  const AmenitiesSection = () => {
    const amenities = property.listing_amenities;
    if (!amenities) return null;

    const hasAmenities = amenities.parking || amenities.laundry || amenities.pets_allowed || 
                         amenities.furnished || amenities.air_conditioning || amenities.ev_charging;
    
    if (!hasAmenities) return null;

    return (
      <section className="property-section amenities-section">
        <h3 className="section-title">
          <span className="title-icon">🏡</span>
          Listing Amenities
        </h3>
        <div className="amenities-grid">
          {amenities.parking && (
            <div className="amenity-item">
              <span className="amenity-icon">🚗</span>
              <span className="amenity-label">Parking</span>
              <span className="amenity-value">{amenities.parking}</span>
            </div>
          )}
          {amenities.laundry && (
            <div className="amenity-item">
              <span className="amenity-icon">🧺</span>
              <span className="amenity-label">Laundry</span>
              <span className="amenity-value">{amenities.laundry}</span>
            </div>
          )}
          {amenities.pets_allowed && (
            <div className="amenity-item">
              <span className="amenity-icon">🐾</span>
              <span className="amenity-label">Pets</span>
              <span className="amenity-value">{amenities.pets_allowed}</span>
            </div>
          )}
          {amenities.furnished && (
            <div className="amenity-item">
              <span className="amenity-icon">🛋️</span>
              <span className="amenity-label">Furnished</span>
              <span className="amenity-value">{amenities.furnished}</span>
            </div>
          )}
          {amenities.air_conditioning && (
            <div className="amenity-item">
              <span className="amenity-icon">❄️</span>
              <span className="amenity-label">A/C</span>
              <span className="amenity-value">{amenities.air_conditioning}</span>
            </div>
          )}
          {amenities.ev_charging && (
            <div className="amenity-item">
              <span className="amenity-icon">⚡</span>
              <span className="amenity-label">EV Charging</span>
              <span className="amenity-value">{amenities.ev_charging}</span>
            </div>
          )}
          {amenities.wheelchair_accessible && (
            <div className="amenity-item">
              <span className="amenity-icon">♿</span>
              <span className="amenity-label">Accessible</span>
              <span className="amenity-value">{amenities.wheelchair_accessible}</span>
            </div>
          )}
          {amenities.smoking && (
            <div className="amenity-item">
              <span className="amenity-icon">🚭</span>
              <span className="amenity-label">Smoking</span>
              <span className="amenity-value">{amenities.smoking}</span>
            </div>
          )}
        </div>
        {amenities.listing_price && (
          <div className="listing-price">
            <span className="price-label">Listed at:</span>
            <span className="price-value">{amenities.listing_price}/month</span>
          </div>
        )}
      </section>
    );
  };

  // Helper to render Rent Board Unit Details
  const RentBoardInventorySection = () => {
    if (!property.rent_board_inventory || !property.rent_board_inventory.units || property.rent_board_inventory.units.length === 0) return null;

    const mostRecent = property.rent_board_inventory.units[0];
    const utilities = property.rent_board_utilities;

    return (
      <section className="property-section" style={{ gridColumn: '1 / -1' }}>
        <h3 className="section-title">
          <span className="title-icon">🏛️</span>
          Rent Board Unit Details
          <span className="count-badge">{property.rent_board_inventory.units_found} units</span>
        </h3>
        <div className="section-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
          {property.rent_board_monthly_rent && (
            <InfoRow label="Reported Rent" value={property.rent_board_monthly_rent} highlight />
          )}
          {property.rent_board_bedroom_count && (
            <InfoRow label="Bedrooms" value={property.rent_board_bedroom_count} />
          )}
          {property.rent_board_bathroom_count && (
            <InfoRow label="Bathrooms" value={property.rent_board_bathroom_count} />
          )}
          {property.rent_board_square_footage && (
            <InfoRow label="Square Footage" value={property.rent_board_square_footage} />
          )}
          {property.rent_board_occupancy_type && (
            <InfoRow label="Occupancy" value={property.rent_board_occupancy_type} />
          )}
          {property.rent_board_neighborhood && (
            <InfoRow label="Neighborhood" value={property.rent_board_neighborhood} />
          )}
        </div>
        {utilities && (
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: '#f0f8ff', borderRadius: '4px' }}>
            <strong style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Utilities Included in Rent:</strong>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <span>{utilities.water_sewer ? '✅' : '❌'} Water/Sewer</span>
              <span>{utilities.natural_gas ? '✅' : '❌'} Gas</span>
              <span>{utilities.electricity ? '✅' : '❌'} Electricity</span>
              <span>{utilities.refuse_recycling ? '✅' : '❌'} Trash/Recycling</span>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Helper to render eviction history
  const EvictionHistorySection = () => {
    const evictions = property.eviction_history;
    if (!evictions || evictions.length === 0) return null;

    return (
      <section className="property-section eviction-section">
        <h3 className="section-title warning-title">
          <span className="title-icon">⚠️</span>
          Eviction History
          <span className="count-badge">{evictions.length}</span>
        </h3>
        <div className="eviction-list">
          {evictions.map((eviction, index) => (
            <div key={index} className="eviction-item">
              <div className="eviction-header">
                <span className="eviction-date">{eviction.file_date}</span>
                <span className="eviction-neighborhood">{eviction.neighborhood}</span>
              </div>
              <div className="eviction-reasons">
                {eviction.eviction_reason.map((reason, i) => (
                  <span key={i} className="reason-tag">{reason}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Helper to render housing complaints
  const HousingComplaintsSection = () => {
    const complaints = property.housing_complaints;
    if (!complaints || complaints.length === 0) return null;

    return (
      <section className="property-section complaints-section">
        <h3 className="section-title warning-title">
          <span className="title-icon">📋</span>
          Housing Complaints
          <span className="count-badge">{complaints.length}</span>
        </h3>
        <div className="complaints-list">
          {complaints.map((complaint, index) => (
            <div key={index} className="complaint-item">
              <div className="complaint-header">
                <span className="complaint-date">{complaint.date_filed}</span>
                <span className={`complaint-status status-${complaint.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {complaint.status}
                </span>
              </div>
              <div className="complaint-details">
                <span className="complaint-category">{complaint.category}</span>
                <span className="complaint-type">{complaint.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Helper to render buyout agreements
  const BuyoutAgreementsSection = () => {
    const buyouts = property.buyout_agreements;
    if (!buyouts || buyouts.length === 0) return null;

    return (
      <section className="property-section buyout-section">
        <h3 className="section-title warning-title">
          <span className="title-icon">💰</span>
          Buyout Agreements
          <span className="count-badge">{buyouts.length}</span>
        </h3>
        <div className="buyout-list">
          {buyouts.map((buyout, index) => (
            <div key={index} className="buyout-item">
              <span className="buyout-date">{buyout.filing_date}</span>
              <span className="buyout-amount">{buyout.buyout_amount}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="property-card">
      {property.lat && property.lon && (
        <div style={{ height: '250px', width: '100%', marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer center={[property.lat, property.lon]} zoom={17} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[property.lat, property.lon]}>
              <Popup>{property.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
      
      <div className="property-header">
        <div>
          <h2 className="property-address">
            {property.address}{property.unit_number ? ` ${property.unit_number}` : ''}
          </h2>
          {property.listing_amenities?.listing_title && (
            <p className="listing-title">{property.listing_amenities.listing_title}</p>
          )}
          {property.saved_date && (
            <p className="saved-date">
              Saved on {new Date(property.saved_date).toLocaleDateString()}
            </p>
          )}
        </div>
        {showSaveButton ? (
          <button className="save-button" onClick={handleSave}>
            Save Property
          </button>
        ) : (
          <button className="delete-button" onClick={handleDelete}>
            Remove
          </button>
        )}
      </div>

      {/* Rent Control Status Badge */}
      {property.rent_controlled && property.rent_controlled !== 'Unknown' && (
        <RentControlBadge />
      )}

      {/* Listing Amenities from Craigslist */}
      <AmenitiesSection />

      {/* Rent Board Unit Details */}
      <RentBoardInventorySection />

      <div className="property-grid">
        <section className="property-section">
          <h3 className="section-title">Building Details</h3>
          <div className="section-content">
            <InfoRow label="Street Address" value={property.address} />
            {property.unit_number && <InfoRow label="Unit Number" value={property.unit_number} highlight />}
            <InfoRow label="Parcel/Lot Number" value={property.assessor_parcel_number || property.parcel || 'Not available'} />
            <InfoRow label="Year Built" value={property.year_built} />
            <InfoRow label="Lot Size" value={property.assessor_property_area || property.lot_size} />
            <InfoRow label="Zoning" value={property.zoning} />
            <InfoRow label="Classification" value={property.classification} />
          </div>
        </section>

        <section className="property-section">
          <h3 className="section-title">Building Specifics</h3>
          <div className="section-content">
            <InfoRow label="Number of Units" value={property.num_units} />
            <InfoRow label="Bedrooms" value={property.number_of_bedrooms} />
            <InfoRow label="Bathrooms" value={property.number_of_bathrooms} />
            <InfoRow label="Rooms" value={property.number_of_rooms} />
            <InfoRow 
              label="Rent" 
              value={
                property.rent_price ? `$${property.rent_price}/month` : 
                property.manual_rent ? 
                  ((property.manual_rent.startsWith('$') ? property.manual_rent : `$${property.manual_rent}`) + '/month') : 
                  'Not available'
              }
              highlight={!!property.rent_price || !!property.manual_rent}
            />
            <InfoRow 
              label="W/D" 
              value={property.listing_amenities?.laundry || property.manual_laundry || 'Not available'} 
            />
            <InfoRow 
              label="Parking" 
              value={property.listing_amenities?.parking || property.manual_parking || 'Not available'} 
            />
          </div>
        </section>

        <section className="property-section">
          <h3 className="section-title">Tenant Protections</h3>
          <div className="section-content">
            <InfoRow label="Property Type" value={property.property_type} />
            <InfoRow 
              label="Rent Control" 
              value={property.rent_controlled} 
              highlight={property.rent_controlled?.toLowerCase().includes('yes')}
            />
            <InfoRow 
              label="Eviction Filings" 
              value={property.eviction_count > 0 ? `${property.eviction_count} on record` : 'None on record'}
              warning={property.eviction_count > 0}
            />
            <InfoRow 
              label="Housing Complaints" 
              value={property.complaint_count > 0 ? `${property.complaint_count} on record` : 'None on record'}
              warning={property.complaint_count > 0}
            />
            <InfoRow 
              label="Buyout Agreements" 
              value={property.buyout_count > 0 ? `${property.buyout_count} on record` : 'None on record'}
              warning={property.buyout_count > 0}
            />
          </div>
        </section>
      </div>

      {/* Rent Board Unit Details */}
      <RentBoardInventorySection />

      {/* Eviction History Details */}
      <EvictionHistorySection />

      {/* Housing Complaints Details */}
      <HousingComplaintsSection />

      {/* Buyout Agreements Details */}
      <BuyoutAgreementsSection />

      {/* Permits Section */}
      {property.permits && property.permits.length > 0 && (
        <section className="property-section permits-section">
          <h3 className="section-title">Recent Permits</h3>
          <div className="permits-list">
            {property.permits.map((permit, index) => (
              <div key={index} className="permit-item">
                <div className="permit-header">
                  <span className="permit-type">{permit.permit_type}</span>
                  <span className="permit-status">{permit.status}</span>
                </div>
                <p className="permit-description">{permit.description}</p>
                <span className="permit-date">Filed: {permit.filed_date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default PropertyCard;
