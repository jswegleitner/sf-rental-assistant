import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import PropertyCard from './PropertyCard';
import SavedProperties from './SavedProperties';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [currentProperty, setCurrentProperty] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/properties`);
      const data = await response.json();
      setSavedProperties(data);
    } catch (err) {
      console.error('Failed to fetch saved properties:', err);
    }
  };

  const handleSearch = async (url, address, parcel) => {
    setLoading(true);
    setError(null);
    setCurrentProperty(null);
    setDebugInfo(null);
    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, address, parcel, debug: true }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch property data');
      }
      if (data.warning) {
        setError(data.warning);
      }
      // Extract lat/lon for map if available
      let property = data.data || data;
      if (property && property.debug && property.debug.parcel_raw && Array.isArray(property.debug.parcel_raw) && property.debug.parcel_raw[0]) {
        const raw = property.debug.parcel_raw[0];
        if (raw.centroid_latitude && raw.centroid_longitude) {
          property.lat = parseFloat(raw.centroid_latitude);
          property.lon = parseFloat(raw.centroid_longitude);
        }
      }
      setCurrentProperty(property);
      // Show debug info if present
      if ((data.data && data.data.debug) || data.debug) {
        setDebugInfo((data.data && data.data.debug) || data.debug);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async (property) => {
    try {
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      const savedProperty = await response.json();
      setSavedProperties([...savedProperties, savedProperty]);
      alert('Property saved successfully!');
    } catch (err) {
      alert('Failed to save property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await fetch(`${API_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      setSavedProperties(savedProperties.filter(p => p.id !== propertyId));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  return (
    <div className="app">
      <div style={{
        background: '#fffbe6',
        borderBottom: '2px solid #c14d28',
        padding: '1em',
        textAlign: 'center',
        fontSize: '1.1em',
        fontWeight: 500,
        letterSpacing: '0.01em',
        marginBottom: 0
      }}>
        <span>
          Click this link to search by address and get the property parcel and lot number:{' '}
          <a href="https://sfplanninggis.org/pim/" target="_blank" rel="noopener noreferrer" style={{ color: '#c14d28', textDecoration: 'underline', fontWeight: 700 }}>
            https://sfplanninggis.org/pim/
          </a>
          <br />
          For a statewide property map, visit{' '}
          <a href="https://www.sfchronicle.com/projects/2025/ca-property-map/" target="_blank" rel="noopener noreferrer" style={{ color: '#c14d28', textDecoration: 'underline', fontWeight: 700 }}>
            https://www.sfchronicle.com/projects/2025/ca-property-map/
          </a>
          <br />
          <span style={{ color: '#b42318', fontWeight: 600 }}>Open in Mozilla Firefox for the best viewing experience.</span>
        </span>
      </div>

      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            SF Apartment<br />
            <span className="title-accent">Finder</span>
          </h1>
          <p className="app-subtitle">
            Research San Francisco rentals with public property records
          </p>
        </div>
        <div className="header-ornament"></div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button 
          className={`nav-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Properties
          {savedProperties.length > 0 && (
            <span className="nav-badge">{savedProperties.length}</span>
          )}
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'search' ? (
          <div className="search-view">
            <SearchForm onSearch={handleSearch} loading={loading} />

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Searching property records...</p>
              </div>
            )}

            {currentProperty && !loading && (
              <>
                <PropertyCard 
                  property={currentProperty} 
                  onSave={handleSaveProperty}
                  showSaveButton={true}
                />
                {debugInfo && (
                  <div style={{ margin: '2em 0', background: '#f9f9f9', border: '1px solid #ccc', padding: '1em', borderRadius: 8 }}>
                    <h4>Debug Info (Raw DataSF API Response)</h4>
                    <pre style={{ fontSize: 12, overflowX: 'auto' }}>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <SavedProperties 
            properties={savedProperties} 
            onDelete={handleDeleteProperty}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Data from San Francisco Open Data Portal</p>
      </footer>
    </div>
  );
}

export default App;
