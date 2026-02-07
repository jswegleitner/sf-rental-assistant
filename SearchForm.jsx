import React, { useState, useRef } from 'react';
import './SearchForm.css';


function SearchForm({ onSearch, loading }) {
  const [url, setUrl] = useState('');
  const [address, setAddress] = useState('');
  const [parcel, setParcel] = useState('');
  const [manualRent, setManualRent] = useState('');
  const [manualLaundry, setManualLaundry] = useState('');
  const [manualParking, setManualParking] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [urlType, setUrlType] = useState(null); // 'craigslist', 'zillow', or null
  const [selectedBlockLot, setSelectedBlockLot] = useState(null); // Store block/lot from Rent Board
  const inputRef = useRef(null);

  // Detect URL type for user feedback
  const detectUrlType = (inputUrl) => {
    if (inputUrl.toLowerCase().includes('craigslist')) {
      return 'craigslist';
    } else if (inputUrl.toLowerCase().includes('zillow')) {
      return 'zillow';
    } else if (inputUrl.toLowerCase().includes('apartments.com')) {
      return 'apartments';
    }
    return null;
  };

  // Normalize address query for better matching (based on SF Planning GIS approach)
  const normalizeAddressQuery = (query) => {
    let normalized = query.toUpperCase().trim();

    // Handle common ordinal abbreviations
    normalized = normalized.replace(/\b(\d+)(ST|ND|RD|TH)\b/gi, '$1$2');

    // Expand common directional abbreviations
    normalized = normalized.replace(/\bN\b/g, 'NORTH')
                           .replace(/\bS\b/g, 'SOUTH')
                           .replace(/\bE\b/g, 'EAST')
                           .replace(/\bW\b/g, 'WEST');

    return normalized;
  };

  // Fetch address suggestions from SF Planning's Geocoder (ArcGIS)
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      // Normalize query for better matching
      const normalizedQuery = normalizeAddressQuery(query);

      // Query SF Planning's ArcGIS Geocoder
      const encodedQuery = encodeURIComponent(normalizedQuery);
      const resp = await fetch(
        `https://sfplanninggis.org/arcgiswa/rest/services/Geocoder_V2/MapServer/0/query?where=Address+like+'${encodedQuery}%25'&outFields=Address,Priority&returnGeometry=false&resultRecordCount=15&f=json`
      );
      const data = await resp.json();

      // Filter by priority (1-2 are best matches, 3-4 are facilities/less relevant)
      const features = data.features || [];
      const prioritizedResults = features
        .filter(f => f.attributes && f.attributes.Priority <= 3) // Include priority 1, 2, 3
        .sort((a, b) => a.attributes.Priority - b.attributes.Priority) // Sort by priority
        .slice(0, 10); // Limit to 10 results

      const suggestions = prioritizedResults.map((item) => ({
        address: item.attributes.Address,
        priority: item.attributes.Priority
      }));

      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (e) {
      console.error('Error fetching suggestions:', e);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    setUrlType(detectUrlType(val));
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    setActiveSuggestion(-1);
    setSelectedBlockLot(null); // Clear block/lot when user types
    fetchSuggestions(val);
    setAddressValid(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion.address);
    setSelectedBlockLot(null); // Clear block/lot since we're using full address now
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveSuggestion(-1);
    setAddressValid(true);
    setTimeout(() => inputRef.current && inputRef.current.blur(), 100);
  };

  const handleAddressBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 200);
  };

  const handleAddressFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      const selected = suggestions[activeSuggestion];
      setAddress(selected.address);
      setSelectedBlockLot(null); // Clear block/lot since we're using full address now
      setShowSuggestions(false);
      setSuggestions([]);
      setActiveSuggestion(-1);
      setAddressValid(true);
      e.preventDefault();
    }
  };

  const handleParcelChange = (e) => {
    setParcel(e.target.value);
    // If user enters parcel, clear address and suggestions
    if (e.target.value) {
      setAddress('');
      setSelectedBlockLot(null);
      setSuggestions([]);
      setShowSuggestions(false);
      setAddressValid(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const manualAmenities = {
      manual_rent: manualRent,
      manual_laundry: manualLaundry,
      manual_parking: manualParking
    };

    if (url) {
      onSearch(url, address, parcel, manualAmenities);
    } else if (parcel) {
      onSearch(url, '', parcel, manualAmenities);
    } else if (address && addressValid) {
      onSearch(url, address, '', manualAmenities);
    }
  };

  return (
    <div className="search-form-container">
      <div className="search-form-header">
        <h2>Find Property Information</h2>
        <p>Search by street address or parcel/lot number</p>
      </div>

      <div className="search-tips" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: 'var(--space-md)' }}>
        <h3>Tips for best results:</h3>
        <ul>
          <li><strong>Address autocomplete uses SF Planning's geocoder</strong> - all SF addresses supported</li>
          <li>Start typing an address (min 2 characters) and select from dropdown</li>
          <li>Addresses are validated against SF's official database</li>
          <li>Blue/green border = best match, no border = alternative match</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="address" className="form-label">
            Street Address
            <span className="label-hint">all San Francisco addresses</span>
          </label>
          <input
            type="text"
            id="address"
            className="form-input"
            placeholder="123 Market St, San Francisco"
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            onFocus={handleAddressFocus}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            autoComplete="off"
            disabled={loading}
          />
          {showSuggestions && (
            <ul className="autocomplete-suggestions" style={{
              position: 'absolute',
              zIndex: 10,
              background: 'white',
              border: '1px solid #ccc',
              width: '100%',
              maxHeight: '160px',
              overflowY: 'auto',
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}>
              {loadingSuggestions && (
                <li style={{ padding: '8px', color: '#888' }}>Loading...</li>
              )}
              {!loadingSuggestions && suggestions.length === 0 && (
                <li style={{ padding: '8px', color: '#888' }}>No matches found</li>
              )}
              {!loadingSuggestions && suggestions.map((s, i) => (
                <li
                  key={`${s.address}-${i}`}
                  style={{
                    padding: '8px',
                    background: i === activeSuggestion ? '#f5f5f5' : 'white',
                    cursor: 'pointer',
                    borderLeft: s.priority === 1 ? '3px solid #2563eb' : s.priority === 2 ? '3px solid #10b981' : 'none'
                  }}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s.address}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-divider">
          <span>or</span>
        </div>

        <div className="form-group">
          <label htmlFor="parcel" className="form-label">
            Parcel/Lot Number
            <span className="label-hint">Format: BLOCK/LOT (e.g. 1234/567)</span>
          </label>
          <input
            type="text"
            id="parcel"
            className="form-input"
            placeholder="1234/567"
            value={parcel}
            onChange={handleParcelChange}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="form-divider">
          <span>Optional: Add listing for amenities data</span>
        </div>

        <div className="form-group">
          <label htmlFor="url" className="form-label">
            Listing URL
            <span className="label-hint">from Craigslist, Zillow, etc.</span>
          </label>
          <input
            type="text"
            id="url"
            className={`form-input ${urlType ? `url-type-${urlType}` : ''}`}
            placeholder="https://sfbay.craigslist.org/..."
            value={url}
            onChange={handleUrlChange}
            disabled={loading}
          />
          {urlType === 'craigslist' && (
            <div className="url-type-indicator craigslist">
              <span className="indicator-icon">✓</span>
              <span>Craigslist detected - will extract parking, laundry & pet info</span>
            </div>
          )}
          {urlType === 'zillow' && (
            <div className="url-type-indicator zillow">
              <span className="indicator-icon">ℹ</span>
              <span>Zillow detected - we can't extract data from Zillow, but you can enter the address above</span>
            </div>
          )}
        </div>

        <div className="form-divider">
          <span>Optional: Manual Amenities</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label htmlFor="manualRent" className="form-label">
              Rent
            </label>
            <input
              type="text"
              id="manualRent"
              className="form-input"
              placeholder="e.g. $2500"
              value={manualRent}
              onChange={(e) => setManualRent(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="manualLaundry" className="form-label">
              W/D
            </label>
            <select
              id="manualLaundry"
              className="form-input"
              value={manualLaundry}
              onChange={(e) => setManualLaundry(e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="W/D in unit">W/D in unit</option>
              <option value="Laundry on site">Laundry on site</option>
              <option value="Laundry in building">Laundry in building</option>
              <option value="No laundry on site">No laundry</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="manualParking" className="form-label">
              Parking
            </label>
            <select
              id="manualParking"
              className="form-input"
              value={manualParking}
              onChange={(e) => setManualParking(e.target.value)}
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="Off-street parking">Off-street</option>
              <option value="Attached garage">Garage</option>
              <option value="Street parking">Street parking</option>
              <option value="No parking">No parking</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="search-button"
          disabled={loading || (!url && !parcel && (!address || !addressValid))}
        >
          {loading ? 'Searching...' : 'Search Property'}
        </button>
      </form>

      <div className="search-tips">
        <h3 className="tips-section-header">Data Sources:</h3>
        <ul className="data-sources-list">
          <li><strong>SF Rent Board:</strong> Official rent control & eviction data</li>
          <li><strong>Craigslist:</strong> Parking, laundry, pet policies (only when Craigslist URL provided)</li>
          <li><strong>SF Assessor:</strong> Property type, year built, units</li>
          <li><strong>Housing Complaints:</strong> Building violations history</li>
        </ul>
      </div>
    </div>
  );
}

export default SearchForm;
