import React, { useState, useRef } from 'react';
import './SearchForm.css';


function SearchForm({ onSearch, loading }) {
  const [url, setUrl] = useState('');
  const [address, setAddress] = useState('');
  const [parcel, setParcel] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [urlType, setUrlType] = useState(null); // 'craigslist', 'zillow', or null
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

  // Fetch address suggestions from DataSF
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const resp = await fetch(
        `https://data.sfgov.org/resource/wr8u-xric.json?$select=address&$where=address like '%25${encodeURIComponent(query)}%25'&$limit=5`
      );
      const data = await resp.json();
      const addrs = data.map((item) => item.address).filter(Boolean);
      setSuggestions(addrs);
      setShowSuggestions(addrs.length > 0);
    } catch (e) {
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
    fetchSuggestions(val);
    setAddressValid(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
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
      setAddress(suggestions[activeSuggestion]);
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
      setSuggestions([]);
      setShowSuggestions(false);
      setAddressValid(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onSearch(url, address, parcel);
    } else if (parcel) {
      onSearch(url, '', parcel);
    } else if (address && addressValid) {
      onSearch(url, address, '');
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
          <li><strong>Searching by parcel/lot number is much more reliable</strong> - use SF Planning GIS link above to find it</li>
          <li>Include full street number and name when searching by address</li>
          <li>Double-check address spelling</li>
          <li>Only San Francisco addresses are supported</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="address" className="form-label">
            Street Address
            <span className="label-hint">in San Francisco</span>
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
                  key={s}
                  style={{
                    padding: '8px',
                    background: i === activeSuggestion ? '#f5f5f5' : 'white',
                    cursor: 'pointer',
                  }}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s}
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
