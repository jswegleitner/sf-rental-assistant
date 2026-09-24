# SF Rental Assistant

A web app for researching San Francisco rental properties by aggregating property records, rent control status, eviction history, and housing complaints from SF Open Data APIs.

## Architecture

**Frontend:** React 18 + Vite, React-Leaflet for maps, Firebase for cross-device sync  
**Backend:** Python/Flask, BeautifulSoup for Craigslist scraping, SF Open Data APIs

Data flow: User enters address or Craigslist/Zillow URL → Flask backend queries multiple SF Open Data APIs → aggregated result displayed in PropertyCard → optional save to Firebase.

## Running Locally

**Backend** (port 5000):
```bash
source venv/bin/activate   # Windows: venv\Scripts\activate
python app.py
```

**Frontend** (port 5173):
```bash
npm run dev
```

Vite proxies `/api/*` to `localhost:5000` during development.

**Production build:**
```bash
npm run build   # outputs to dist/
```

## Key Files

- [app.py](app.py) — Flask backend (~1170 lines); all API logic lives here
- [App.jsx](App.jsx) — Root React component; owns search and saved-properties state
- [SearchForm.jsx](SearchForm.jsx) — Address input with SF Planning ArcGIS Geocoder autocomplete
- [PropertyCard.jsx](PropertyCard.jsx) — Property detail display with embedded Leaflet map
- [SavedProperties.jsx](SavedProperties.jsx) — Side-by-side comparison (table/card views)
- [firebase.js](firebase.js) — Firebase init and CRUD helpers
- [config.js](config.js) — API URL switching (dev vs. production)

## Backend API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/search` | Main property lookup — queries all SF Open Data APIs |
| POST | `/api/parse-listing` | Parse Craigslist URL for amenities |
| GET/POST | `/api/properties` | List / save properties (file-based) |
| DELETE | `/api/properties/<id>` | Delete a saved property |
| GET | `/health` | Health check |

`/api/search` accepts `{ url, address, parcel, debug }` and returns owner info, rent control status, eviction history, housing complaints, buyout agreements, and listing amenities.

## Data Sources

All from SF Open Data Portal (no API keys required):
- SF Assessor-Recorder — ownership, assessed value, year built
- SF Rent Board Inventory — official rent-controlled units
- Eviction Notices dataset
- Housing Complaints dataset
- Buyout Agreements dataset
- Building Permits dataset
- SF Planning ArcGIS Geocoder — address autocomplete

Craigslist amenities are scraped via BeautifulSoup (no official API).

## Environment Variables

Frontend needs a `.env` file (see [.env.example](.env.example)):

```
VITE_API_URL=https://your-backend.com   # omit in dev; proxy handles it

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase is optional — saved properties fall back to localStorage without it.

## Deployment

- **Backend:** Render ([render.yaml](render.yaml)) — gunicorn on Python 3.11
- **Frontend:** GitHub Pages via GitHub Actions
- **Alternate backend:** Azure App Service ([startup.txt](startup.txt), [staticwebapp.config.json](staticwebapp.config.json))

## Scope Constraints

- SF addresses only — all APIs are SF-specific
- Rent control heuristic is year-built < 1979 (Rent Board data is authoritative when available)
- Backend saved-properties storage is file-based (`saved_properties.json`) and resets on restart — use Firebase for persistence
- Craigslist scraping is fragile to HTML layout changes
