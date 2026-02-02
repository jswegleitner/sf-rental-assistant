# Quick Start Guide - SF Apartment Finder

## What You've Got

A complete web application with:
- **Backend**: Python Flask API that queries SF Open Data
- **Frontend**: React app with a distinctive editorial design
- **Features**: Property search, rent control check, permit history, saved properties

## Getting Started (5 minutes)

### Step 1: Backend Setup

1. Open Terminal and navigate to the backend folder:
   ```bash
   cd sf-apartment-finder/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   
   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```
   
   You should see: `Running on http://127.0.0.1:5000`

### Step 2: Frontend Setup (New Terminal Window)

1. Open a NEW terminal and navigate to the frontend folder:
   ```bash
   cd sf-apartment-finder/frontend
   ```

2. Install dependencies (one time only):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   You should see: `Local: http://localhost:5173/`

### Step 3: Use the App!

1. Open your browser to: **http://localhost:5173**

2. Try searching for a SF address like:
   - `555 California St, San Francisco`
   - `1 Market St, San Francisco`
   - `2000 Van Ness Ave, San Francisco`

## What the App Does

### Search Features
- Paste Craigslist/Zillow URLs (address extraction is basic, so confirm the address)
- Enter any SF address directly
- Gets data from SF's public records APIs

### Property Information Displayed
- **Owner name** (from SF Assessor records)
- **Property type** (apartment, condo, single-family)
- **Year built** (used to determine rent control status)
- **Assessed value**
- **Rent control status** (automatic for pre-1979 buildings)
- **Recent building permits**
- **Zoning information**

### Additional Features
- Save properties to compare
- View all saved properties in one place
- Delete properties you're not interested in

## Troubleshooting

**Backend won't start?**
- Make sure you activated the virtual environment
- Check Python version: `python --version` (need 3.8+)

**Frontend won't start?**
- Make sure you ran `npm install`
- Check Node version: `node --version` (need 16+)

**No property data showing?**
- Double-check the address is in San Francisco
- Try a different address
- Some properties may have incomplete public records

**Port already in use?**
- Backend: Change port in `backend/app.py` (line 226)
- Frontend: Change port in `frontend/vite.config.js`

## Design Philosophy

The app features an editorial-inspired design with:
- Crimson Pro serif font for headers (newspaper-style)
- DM Sans for body text (clean, readable)
- Warm, paper-like color palette
- Clean information hierarchy
- Distinctive from typical "SaaS blue" designs

## Next Steps / Enhancements

Want to improve it? Here are ideas:

1. **Better address extraction** from URLs
2. **Map integration** to show property locations
3. **Database** instead of in-memory storage (SQLite/PostgreSQL)
4. **Export** saved properties to CSV/PDF
5. **Neighborhood data** (crime stats, schools, transit)
6. **Price history** graphs
7. **Violations/complaints** from SF 311 data
8. **Email notifications** for new listings at saved addresses

## Data Sources

All data comes from San Francisco's Open Data Portal:
- https://data.sfgov.org

The app uses these datasets:
- SF Assessor Parcels (ownership, value)
- Building Permits (permit history)
- Property Information (zoning, units)

## Notes

- This is a development version (not production-ready)
- Property data depends on public record availability
- Some fields may show "Not available"
- Saved properties are lost when you restart the backend
- No authentication/user accounts (single-user app)

Happy apartment hunting! 🏠
