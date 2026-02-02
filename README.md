# SF Apartment Finder

🌐 **[Live App](https://jswegleitner.github.io/sf-rental-assistant/)**

A web app to help you research San Francisco apartments by looking up property records, ownership, and building information.

## Features

- Add apartment listings from Craigslist, Zillow, or any site
- **NEW: Craigslist Integration** - Automatically extracts parking, laundry, pet policies, and more from Craigslist listings
- Automatically fetch property information from SF Open Data
- View property owner, year built, type, and more
- **NEW: SF Rent Board Data** - Official rent control verification from the SF Rent Board
- **NEW: Eviction History** - View eviction filings for the property
- **NEW: Housing Complaints** - See building complaints and violations
- **NEW: Buyout Agreements** - Track buyout agreement filings
- Check rent control status
- See building permits and violations
- Compare multiple properties side-by-side

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Python Flask
- **APIs**: SF Open Data Portal (DataSF)

## Data Sources

This app uses multiple San Francisco open data APIs:
- **SF Assessor-Recorder** - Property ownership, year built, assessed values
- **SF Rent Board Inventory** - Official rent-controlled unit registry
- **Eviction Notices Dataset** - Historical eviction filings
- **Housing Complaints** - Building violations and complaints
- **Buyout Agreements** - Tenant buyout filings
- **Building Permits** - Construction and renovation permits
- **Craigslist** - Listing amenities (parking, laundry, pets, etc.)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- pip

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Mac/Linux: `source venv/bin/activate`
   - On Windows: `venv\Scripts\activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Paste a listing URL or enter an address
4. Click "Search" to fetch property information
5. View detailed property records and save properties to compare

## API Endpoints

- `POST /api/search` - Search for property by address (includes rent board, eviction, and complaint data)
- `POST /api/parse-listing` - Parse a Craigslist listing URL for amenities
- `GET /api/properties` - Get all saved properties
- `DELETE /api/properties/:id` - Delete a saved property

## Data Sources

This app uses San Francisco's open data APIs:
- SF Property Information Map
- SF Assessor-Recorder
- DataSF Portal
- SF Rent Board Inventory
- Eviction Notices Dataset
- Housing Complaints Dataset
- Buyout Agreements Dataset

## Notes

- Currently limited to San Francisco addresses
- Some properties may have incomplete data depending on public records availability
- Rent control information is based on year built (pre-1979 buildings)
