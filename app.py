def get_historical_taxroll(parcel=None, address=None):
    """Get info from Assessor Historical Secured Property Tax Rolls dataset by parcel/lot"""
    try:
        url = "https://data.sfgov.org/resource/wv5m-vpq2.json"
        params = {}
        if parcel:
            block, lot = parcel.split('/') if '/' in parcel else (parcel, None)
            block = block.zfill(4)
            lot = lot.zfill(3) if lot else ''
            parcel_number = f"{block}{lot}"
            params['parcel_number'] = parcel_number
        params['$limit'] = 5
        response = requests.get(url, params=params, timeout=10)
        try:
            data = response.json() if response.status_code == 200 else []
        except Exception as e:
            print(f"Historical Tax Roll JSON decode error: {e}")
            data = []
        if isinstance(data, list) and len(data) > 0:
            return data
        return []
    except Exception as e:
        print(f"Historical Tax Roll error: {e}")
    return []
def get_landuse_info(parcel=None, address=None):
    """Get info from Land Use dataset (for YRBUILT, building_sqft)"""
    try:
        url = "https://data.sfgov.org/resource/fdfd-xptc.json"
        params = {}
        if parcel:
            block, lot = parcel.split('/') if '/' in parcel else (parcel, None)
            block = block.zfill(4)
            lot = lot.zfill(3) if lot else ''
            mapblklot = f"{block}{lot}"
            params['mapblklot'] = mapblklot
            params['$limit'] = 1
        elif address:
            # Try multiple matching strategies
            norm_addr = normalize_address(address.split(',')[0])
            
            # Strategy 1: Try with $where and LIKE for flexible matching
            addr_parts = norm_addr.split()
            if len(addr_parts) >= 2:
                street_number = addr_parts[0]
                street_name = ' '.join(addr_parts[1:])
                params['$where'] = f"UPPER(address) LIKE UPPER('{street_number} {street_name}%')"
                params['$limit'] = 1
            else:
                return None
        else:
            return None
            
        response = requests.get(url, params=params, timeout=10)
        data = response.json() if response.status_code == 200 else []
        if isinstance(data, list) and len(data) > 0:
            return data[0]
    except Exception as e:
        print(f"Land Use info error: {e}")
    return None
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
from datetime import datetime
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app, origins=["https://jswegleitner.github.io", "http://localhost:5173"])
# CRAIGSLIST PARSING FUNCTIONS
# ============================================================

def parse_craigslist_listing(url):
    """
    Scrape Craigslist listing for amenities like parking, laundry, pets, etc.
    Returns a dictionary of parsed amenities.
    """
    amenities = {
        'parking': None,
        'laundry': None,
        'pets_allowed': None,
        'furnished': None,
        'smoking': None,
        'wheelchair_accessible': None,
        'air_conditioning': None,
        'ev_charging': None,
        'listing_title': None,
        'listing_price': None,
        'listing_sqft': None,
        'listing_bedrooms': None,
        'listing_bathrooms': None,
        'listing_available_date': None,
        'listing_images': []
    }
    
    if not url or 'craigslist' not in url.lower():
        return amenities
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            print(f"Craigslist fetch failed: {response.status_code}")
            return amenities
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Get listing title
        title_elem = soup.find('span', id='titletextonly')
        if title_elem:
            amenities['listing_title'] = title_elem.get_text(strip=True)
        
        # Get price
        price_elem = soup.find('span', class_='price')
        if price_elem:
            amenities['listing_price'] = price_elem.get_text(strip=True)
        
        # Get housing info (bedrooms, sqft)
        housing_elem = soup.find('span', class_='housing')
        if housing_elem:
            housing_text = housing_elem.get_text(strip=True)
            # Parse bedrooms (e.g., "2br")
            br_match = re.search(r'(\d+)\s*br', housing_text, re.I)
            if br_match:
                amenities['listing_bedrooms'] = br_match.group(1)
            # Parse bathrooms (e.g., "1ba")
            ba_match = re.search(r'(\d+(?:\.\d+)?)\s*ba', housing_text, re.I)
            if ba_match:
                amenities['listing_bathrooms'] = ba_match.group(1)
            # Parse sqft
            sqft_match = re.search(r'(\d+)\s*ft', housing_text, re.I)
            if sqft_match:
                amenities['listing_sqft'] = sqft_match.group(1)
        
        # Get attribute groups (parking, laundry, etc.) - handle newer Craigslist markup
        attr_groups = soup.select('.attrgroup, .mapAndAttrs, .attr')
        attr_texts = []
        for group in attr_groups:
            # Collect text from spans and links inside each group
            for node in group.find_all(['span', 'a', 'div']):
                text = node.get_text(strip=True)
                if text:
                    attr_texts.append(text)
        # Fallback to generic attrgroup spans if nothing found
        if not attr_texts:
            for span in soup.find_all('span'):
                text = span.get_text(strip=True)
                if text:
                    attr_texts.append(text)

        for raw_text in attr_texts:
            text = raw_text.lower()
            
            # Parking detection
            if 'carport' in text:
                amenities['parking'] = 'Carport'
            elif 'attached garage' in text:
                amenities['parking'] = 'Attached Garage'
            elif 'detached garage' in text:
                amenities['parking'] = 'Detached Garage'
            elif 'off-street parking' in text:
                amenities['parking'] = 'Off-street Parking'
            elif 'street parking' in text:
                amenities['parking'] = 'Street Parking'
            elif 'valet parking' in text:
                amenities['parking'] = 'Valet Parking'
            elif 'no parking' in text:
                amenities['parking'] = 'No Parking'
            
            # Laundry detection
            if 'w/d in unit' in text or 'washer/dryer in unit' in text or 'wd in unit' in text:
                amenities['laundry'] = 'In-unit W/D'
            elif 'w/d hookups' in text or 'washer/dryer hookups' in text:
                amenities['laundry'] = 'W/D Hookups'
            elif 'laundry in bldg' in text or 'laundry on site' in text:
                amenities['laundry'] = 'Shared Laundry'
            elif 'no laundry' in text:
                amenities['laundry'] = 'No Laundry'
            
            # Pets
            if 'cats are ok' in text and 'dogs are ok' in text:
                amenities['pets_allowed'] = 'Cats & Dogs OK'
            elif 'cats are ok' in text:
                amenities['pets_allowed'] = 'Cats OK'
            elif 'dogs are ok' in text:
                amenities['pets_allowed'] = 'Dogs OK'
            elif 'no pets' in text:
                amenities['pets_allowed'] = 'No Pets'
            
            # Furnished
            if 'furnished' in text and 'unfurnished' not in text:
                amenities['furnished'] = 'Yes'
            elif 'unfurnished' in text:
                amenities['furnished'] = 'No'
            
            # Smoking
            if 'no smoking' in text:
                amenities['smoking'] = 'No Smoking'
            
            # Wheelchair accessible
            if 'wheelchair accessible' in text:
                amenities['wheelchair_accessible'] = 'Yes'
            
            # Air conditioning
            if 'air conditioning' in text or 'a/c' in text:
                amenities['air_conditioning'] = 'Yes'
            
            # EV charging
            if 'ev charging' in text:
                amenities['ev_charging'] = 'Yes'
        
        # Get available date
        avail_elem = soup.find('span', class_='property_date')
        if avail_elem:
            amenities['listing_available_date'] = avail_elem.get('data-date', avail_elem.get_text(strip=True))
        
        # Get images
        thumbs = soup.find_all('a', class_='thumb')
        for thumb in thumbs[:5]:  # Limit to 5 images
            href = thumb.get('href')
            if href:
                amenities['listing_images'].append(href)
        
    except Exception as e:
        print(f"Craigslist parsing error: {e}")
    
    return amenities

# ============================================================
# SF RENT BOARD DATA FUNCTIONS
# ============================================================

def get_rent_board_info(address=None, parcel=None):
    """
    Query SF Rent Board Inventory dataset for official rent control status.
    Dataset: Rent Board Inventory of Units Subject to the Rent Ordinance
    API: https://data.sfgov.org/resource/q4sy-bxrt.json
    """
    try:
        url = "https://data.sfgov.org/resource/q4sy-bxrt.json"
        params = {'$limit': 5}
        
        if address:
            # Normalize address for matching
            norm_addr = normalize_address(address.split(',')[0])
            addr_parts = norm_addr.split()
            
            if len(addr_parts) >= 2:
                street_number = addr_parts[0]
                street_name = ' '.join(addr_parts[1:])
                # Use LIKE for flexible matching
                params['$where'] = f"UPPER(location) LIKE UPPER('{street_number} {street_name}%')"
            else:
                params['$where'] = f"UPPER(location) LIKE UPPER('%{norm_addr}%')"
        elif parcel:
            # Try to match by block/lot
            block, lot = parcel.split('/') if '/' in parcel else (parcel, None)
            block = block.zfill(4)
            if lot:
                lot = lot.zfill(3)
                params['$where'] = f"block = '{block}' AND lot = '{lot}'"
            else:
                params['$where'] = f"block = '{block}'"
        else:
            return None
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                return {
                    'is_rent_controlled': True,
                    'rent_board_data': data[0],
                    'total_units_found': len(data)
                }
        
        return {'is_rent_controlled': False, 'rent_board_data': None}
        
    except Exception as e:
        print(f"Rent Board info error: {e}")
        return None

def get_rent_board_housing_inventory(address=None, parcel=None):
    """
    Query SF Rent Board Housing Inventory for unit-level details.
    Dataset: Rent Board Housing Inventory
    API: https://data.sfgov.org/resource/gdc7-dmcn.json
    Returns: Unit details including rent, bedrooms, bathrooms, square footage, utilities
    """
    try:
        url = "https://data.sfgov.org/resource/gdc7-dmcn.json"
        params = {'$limit': 10, '$order': 'submission_year DESC'}
        
        if parcel:
            # Try to match by block number (first 4 digits of parcel)
            block = parcel.split('/')[0] if '/' in parcel else parcel[:4]
            block = block.zfill(4)
            params['block_num'] = block
            print(f"Querying Rent Board Inventory for block: {block}")
        elif address:
            # Try to match by address - extract street name
            norm_addr = normalize_address(address.split(',')[0])
            addr_parts = norm_addr.split()
            if len(addr_parts) >= 2:
                street_name = ' '.join(addr_parts[1:])
                params['$where'] = f"UPPER(block_address) LIKE UPPER('%{street_name}%')"
                print(f"Querying Rent Board Inventory for street: {street_name}")
        else:
            return None
        
        response = requests.get(url, params=params, timeout=10)
        print(f"Rent Board Inventory API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Rent Board Inventory found {len(data)} records")
            if data and len(data) > 0:
                return {
                    'units_found': len(data),
                    'units': data,
                    'total_units': data[0].get('unit_count') if data else None
                }
        
        return None
        
    except Exception as e:
        print(f"Rent Board Housing Inventory error: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_eviction_history(address=None, parcel=None):
    """
    Get eviction notices/filings for a property.
    Dataset: Eviction Notices
    API: https://data.sfgov.org/resource/5cei-gny5.json
    """
    try:
        url = "https://data.sfgov.org/resource/5cei-gny5.json"
        params = {
            '$limit': 20,
            '$order': 'file_date DESC'
        }
        
        if address:
            # Extract street number and name
            street_match = re.match(r'(\d+)\s+(.+?)(?:,|$)', address)
            if street_match:
                street_addr = f"{street_match.group(1)} {street_match.group(2).strip()}"
                params['$where'] = f"UPPER(address) LIKE UPPER('%{street_addr}%')"
            else:
                return []
        else:
            return []
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            evictions = []
            for record in data[:10]:  # Limit to 10 most recent
                eviction = {
                    'file_date': record.get('file_date', 'Unknown')[:10] if record.get('file_date') else 'Unknown',
                    'eviction_reason': [],
                    'neighborhood': record.get('neighborhood', 'Unknown'),
                    'supervisor_district': record.get('supervisor_district', 'Unknown')
                }
                
                # Collect all eviction reasons (they are boolean fields)
                reason_fields = [
                    ('non_payment', 'Non-Payment of Rent'),
                    ('breach', 'Breach of Lease'),
                    ('nuisance', 'Nuisance'),
                    ('illegal_use', 'Illegal Use'),
                    ('failure_to_sign_renewal', 'Failure to Sign Renewal'),
                    ('access_denial', 'Access Denial'),
                    ('unapproved_subtenant', 'Unapproved Subtenant'),
                    ('owner_move_in', 'Owner Move-In'),
                    ('demolition', 'Demolition'),
                    ('capital_improvement', 'Capital Improvement'),
                    ('substantial_rehab', 'Substantial Rehab'),
                    ('ellis_act_withdrawal', 'Ellis Act Withdrawal'),
                    ('condo_conversion', 'Condo Conversion'),
                    ('roommate_same_unit', 'Roommate Same Unit'),
                    ('other_cause', 'Other Cause'),
                    ('late_payments', 'Late Payments'),
                    ('lead_remediation', 'Lead Remediation'),
                    ('development', 'Development Agreement'),
                    ('good_samaritan_ends', 'Good Samaritan Ends')
                ]
                
                for field, label in reason_fields:
                    if record.get(field) == 'true' or record.get(field) is True:
                        eviction['eviction_reason'].append(label)
                
                if not eviction['eviction_reason']:
                    eviction['eviction_reason'] = ['Reason not specified']
                
                evictions.append(eviction)
            
            return evictions
        
        return []
        
    except Exception as e:
        print(f"Eviction history error: {e}")
        return []

def get_housing_complaints(address=None, parcel=None):
    """
    Get housing complaints/violations for a property.
    Dataset: Housing Complaints
    API: https://data.sfgov.org/resource/7d5q-jf8x.json
    """
    try:
        url = "https://data.sfgov.org/resource/7d5q-jf8x.json"
        params = {
            '$limit': 20,
            '$order': 'date_filed DESC'
        }
        
        if address:
            # Extract street number and name
            street_match = re.match(r'(\d+)\s+(.+?)(?:,|$)', address)
            if street_match:
                street_num = street_match.group(1)
                street_name = street_match.group(2).strip().upper()
                # Remove common suffixes for better matching
                street_name = re.sub(r'\s+(ST|AVE|BLVD|DR|RD|CT|PL|LN|WAY|TER)$', '', street_name)
                params['$where'] = f"block_address LIKE '%{street_num}%' AND UPPER(block_address) LIKE UPPER('%{street_name}%')"
            else:
                return []
        else:
            return []
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            complaints = []
            for record in data[:10]:  # Limit to 10 most recent
                complaint = {
                    'date_filed': record.get('date_filed', 'Unknown')[:10] if record.get('date_filed') else 'Unknown',
                    'category': record.get('category', 'Unknown'),
                    'type': record.get('type', 'Unknown'),
                    'status': record.get('status', 'Unknown'),
                    'resolution': record.get('resolution', 'Pending')
                }
                complaints.append(complaint)
            
            return complaints
        
        return []
        
    except Exception as e:
        print(f"Housing complaints error: {e}")
        return []

def get_buyout_agreements(address=None, parcel=None):
    """
    Get buyout agreement filings for a property.
    Dataset: Buyout Agreements
    API: https://data.sfgov.org/resource/wmam-7g8d.json
    """
    try:
        url = "https://data.sfgov.org/resource/wmam-7g8d.json"
        params = {
            '$limit': 10,
            '$order': 'filing_date DESC'
        }
        
        if address:
            street_match = re.match(r'(\d+)\s+(.+?)(?:,|$)', address)
            if street_match:
                street_addr = f"{street_match.group(1)} {street_match.group(2).strip()}"
                params['$where'] = f"UPPER(address) LIKE UPPER('%{street_addr}%')"
            else:
                return []
        else:
            return []
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            buyouts = []
            for record in data[:5]:
                buyout = {
                    'filing_date': record.get('filing_date', 'Unknown')[:10] if record.get('filing_date') else 'Unknown',
                    'buyout_amount': record.get('buyout_amount', 'Not disclosed'),
                    'neighborhood': record.get('neighborhood', 'Unknown')
                }
                buyouts.append(buyout)
            
            return buyouts
        
        return []
        
    except Exception as e:
        print(f"Buyout agreements error: {e}")
        return []
CORS(app)

# File-based storage for saved properties
import json
import os

PROPERTIES_FILE = 'saved_properties.json'

def load_properties():
    """Load saved properties from JSON file"""
    if os.path.exists(PROPERTIES_FILE):
        try:
            with open(PROPERTIES_FILE, 'r') as f:
                data = json.load(f)
                return data.get('properties', []), data.get('counter', 1)
        except Exception as e:
            print(f"Error loading properties: {e}")
    return [], 1

def save_properties_to_file():
    """Save properties to JSON file"""
    try:
        with open(PROPERTIES_FILE, 'w') as f:
            json.dump({
                'properties': saved_properties,
                'counter': property_counter
            }, f, indent=2)
    except Exception as e:
        print(f"Error saving properties: {e}")

# Load saved properties on startup
saved_properties, property_counter = load_properties()

def extract_address_from_url(url):
    """Attempt to extract address from listing URL"""
    # This is a basic implementation - you may want to enhance it
    address_patterns = [
        r'(\d+[^,\n]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|way|lane|ln|court|ct|place|pl)[^,\n]*,?\s*(?:san\s+francisco|sf)?)',
    ]
    
    for pattern in address_patterns:
        match = re.search(pattern, url.lower())
        if match:
            return match.group(1).strip()
    
    return None

def geocode_address(address):
    """Convert address to coordinates using SF's geocoding API"""
    try:
        # Add San Francisco if not present
        if 'san francisco' not in address.lower() and 'sf' not in address.lower():
            address = f"{address}, San Francisco, CA"
        
        # Use SF's geocoding service
        url = "https://data.sfgov.org/resource/wr8u-xric.json"
        params = {
            "$where": f"address LIKE '%{address.split(',')[0]}%'",
            "$limit": 1
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200 and response.json():
            data = response.json()[0]
            return {
                'lat': float(data.get('latitude', 0)),
                'lon': float(data.get('longitude', 0)),
                'formatted_address': data.get('address', address)
            }
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return None

def normalize_address(address):
    """Normalize and standardize address for better DataSF matching"""
    if not address:
        return address
    
    # Remove trailing punctuation
    address = address.rstrip('.,;')
    
    # Common street type variations and their standardized forms
    street_types = {
        'STREET': 'ST', 'ST': 'ST',
        'AVENUE': 'AVE', 'AVE': 'AVE', 'AV': 'AVE',
        'ROAD': 'RD', 'RD': 'RD',
        'BOULEVARD': 'BLVD', 'BLVD': 'BLVD',
        'DRIVE': 'DR', 'DR': 'DR',
        'WAY': 'WAY',
        'LANE': 'LN', 'LN': 'LN',
        'COURT': 'CT', 'CT': 'CT',
        'PLACE': 'PL', 'PL': 'PL',
        'TERRACE': 'TER', 'TER': 'TER',
        'CIRCLE': 'CIR', 'CIR': 'CIR',
        'ALLEY': 'ALY', 'ALY': 'ALY',
        'PLAZA': 'PLZ', 'PLZ': 'PLZ',
        'SQUARE': 'SQ', 'SQ': 'SQ',
        'PARKWAY': 'PKWY', 'PKWY': 'PKWY',
        'HIGHWAY': 'HWY', 'HWY': 'HWY',
        'CENTER': 'CTR', 'CTR': 'CTR',
        'CRESCENT': 'CRES', 'CRES': 'CRES',
        'LOOP': 'LOOP',
        'TRAIL': 'TRL', 'TRL': 'TRL',
        'PIER': 'PIER',
        'HILL': 'HL', 'HL': 'HL',
        'VIEW': 'VW', 'VW': 'VW'
    }
    
    # Split address into parts
    parts = address.upper().split()
    
    # Normalize the street type if present
    if len(parts) >= 2:
        # Check last word for street type
        last_word = parts[-1].rstrip('.,;')
        if last_word in street_types:
            parts[-1] = street_types[last_word]
    
    return ' '.join(parts)

def extract_unit_number(property_location):
    """Extract unit number from property_location field.
    Format: '0000 2989 JACKSON             ST0001'
    Returns: '1' or None
    """
    if not property_location or not isinstance(property_location, str):
        return None
    
    # Match pattern: street type (2 letters) followed by digits
    match = re.search(r'\b([A-Z]{2})(\d{4})$', property_location.strip())
    if match:
        unit_num = match.group(2).lstrip('0')  # Remove leading zeros
        return unit_num if unit_num else None
    return None

def get_parcel_info(address=None, parcel=None, debug=False):
    """Get parcel information from SF Assessor data by address or parcel/lot"""
    try:
        url = "https://data.sfgov.org/resource/acdm-wktn.json"
        if parcel:
            # parcel format: BLOCK/LOT (e.g., 1234/567)
            block, lot = parcel.split('/') if '/' in parcel else (parcel, None)
            block = block.zfill(4)
            lot = lot.zfill(3) if lot else ''
            blklot = f"{block}{lot}"
            where = f"blklot = '{blklot}'"
        elif address:
            # Try multiple strategies for address matching
            norm_addr = normalize_address(address.split(',')[0])
            
            # Strategy 1: Exact match
            where = f"UPPER(address) = UPPER('{norm_addr}')"
            params = {"$where": where, "$limit": 5}
            response = requests.get(url, params=params, timeout=10)
            data = response.json() if response.status_code == 200 else []
            
            # Strategy 2: If no exact match, try LIKE with street number
            if not data or len(data) == 0:
                # Extract street number and name
                addr_parts = norm_addr.split()
                if len(addr_parts) >= 2:
                    street_number = addr_parts[0]
                    street_name = ' '.join(addr_parts[1:])
                    
                    # Try with LIKE for more flexible matching
                    where = f"UPPER(address) LIKE UPPER('{street_number} {street_name}%')"
                    params = {"$where": where, "$limit": 5}
                    response = requests.get(url, params=params, timeout=10)
                    data = response.json() if response.status_code == 200 else []
                    
                    # Strategy 3: If still no match, try just street number and first word of street
                    if not data or len(data) == 0:
                        first_word = street_name.split()[0] if street_name else ''
                        if first_word:
                            where = f"UPPER(address) LIKE UPPER('{street_number} {first_word}%')"
                            params = {"$where": where, "$limit": 5}
                            response = requests.get(url, params=params, timeout=10)
                            data = response.json() if response.status_code == 200 else []
            
            if debug:
                return data, params
                
            # Return the first match if we found any
            if isinstance(data, list) and len(data) > 0:
                return data[0]
        else:
            return None
            
        params = {"$where": where, "$limit": 1}
        response = requests.get(url, params=params, timeout=10)
        data = response.json() if response.status_code == 200 else []
        if debug:
            return data, params
        # DataSF returns a list; return the first item if present
        if isinstance(data, list) and len(data) > 0:
            return data[0]
    except Exception as e:
        print(f"Parcel info error: {e}")
    return None

def get_building_permits(address):
    """Get building permits for the address"""
    try:
        url = "https://data.sfgov.org/resource/i98e-djp9.json"
        
        # Extract street number and name
        street_match = re.match(r'(\d+)\s+(.+?)(?:,|$)', address)
        if not street_match:
            return []
        
        street_number = street_match.group(1)
        street_name = street_match.group(2).strip()
        
        params = {
            "$where": f"street_number = '{street_number}' AND UPPER(street_name) LIKE UPPER('%{street_name}%')",
            "$order": "filed_date DESC",
            "$limit": 5
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Building permits error: {e}")
    
    return []

def get_property_details(address=None, parcel=None, debug=False):
    # Query Historical Tax Roll dataset (TEMP: comment out for debugging)
    historical_taxroll = get_historical_taxroll(parcel=parcel, address=address)
    """Aggregate all property information"""
    debug_info = {}
    # Pre-check for available data
    if parcel:
        parcel_info = get_parcel_info(parcel=parcel)
    elif address:
        parcel_info = get_parcel_info(address=address)
    else:
        parcel_info = None
    if not parcel_info:
        # For debugging, return the attempted query if debug is enabled
        if debug:
            return {'error': 'No data available for this address or parcel/lot.', 'debug': {'address': address, 'parcel': parcel}}
        return {'error': 'No data available for this address or parcel/lot.'}
    # If debug, get raw info
    if debug:
        if parcel:
            parcel_info_raw, query_params = get_parcel_info(parcel=parcel, debug=True)
        else:
            parcel_info_raw, query_params = get_parcel_info(address=address, debug=True)
        debug_info['parcel_query'] = query_params
        debug_info['parcel_raw'] = parcel_info_raw
        if isinstance(parcel_info_raw, list) and parcel_info_raw:
            parcel_info = parcel_info_raw[0]
        else:
            parcel_info = None
    # Get building permits
    permits = get_building_permits(address or parcel_info.get('address', ''))
    # Query Land Use dataset for aggregation
    landuse_info = get_landuse_info(parcel=parcel, address=address)
    # Aggregate most recent historical tax roll record if available
    assessor_data = None
    if historical_taxroll and isinstance(historical_taxroll, list):
        # Sort by closed_roll_year descending (most recent first)
        try:
            assessor_data = sorted(historical_taxroll, key=lambda x: int(x.get('closed_roll_year', 0)), reverse=True)[0]
        except Exception:
            assessor_data = historical_taxroll[0]
    # Owner: prefer parcel_info, then assessor_data, then landuse_info
    owner = parcel_info.get('owner') or (assessor_data.get('owner') if assessor_data else None) or (landuse_info.get('owner') if landuse_info else None) or 'Not available'
    if isinstance(owner, list):
        owner = ', '.join(owner)
    # Assessed value: prefer fixtures, fallback to land value (Assessor, then assessor_data)
    assessed_value = parcel_info.get('closed_roll_assessed_fixtures_value')
    if not assessed_value:
        assessed_value = parcel_info.get('closed_roll_assessed_land_value')
    if not assessed_value and assessor_data:
        assessed_value = assessor_data.get('assessed_fixtures_value')
        if not assessed_value:
            assessed_value = assessor_data.get('assessed_land_value')
    if assessed_value:
        try:
            assessed_value = f"${int(float(assessed_value)):,}"
        except Exception:
            assessed_value = str(assessed_value)
    else:
        assessed_value = 'Not available'
    # Year built: prefer parcel_info, then assessor_data, then Land Use
    year_built = parcel_info.get('year_property_built') or (assessor_data.get('year_property_built') if assessor_data else None) or (landuse_info.get('yrbuilt') if landuse_info else None) or 'Not available'
    # Property type: prefer parcel_info, then assessor_data, then Land Use
    property_type = parcel_info.get('property_class_description') or (assessor_data.get('property_class_code_definition') if assessor_data else None) or (landuse_info.get('landuse') if landuse_info else None) or 'Not available'
    # Units: prefer parcel_info, then assessor_data, then Land Use
    num_units = parcel_info.get('number_of_units') or (assessor_data.get('number_of_units') if assessor_data else None) or (landuse_info.get('resunits') if landuse_info else None) or 'Not available'
    # Building size: prefer parcel_info, then assessor_data, then Land Use
    building_sqft = parcel_info.get('building_sqft') or (assessor_data.get('property_area') if assessor_data else None) or (landuse_info.get('bldgsqft') if landuse_info else None) or 'Not available'
    # Add more assessor fields as needed
    assessor_fields = {}
    if assessor_data:
        assessor_fields = {
            'assessor_closed_roll_year': assessor_data.get('closed_roll_year'),
            'assessor_property_class_code': assessor_data.get('property_class_code'),
            'assessor_property_class_code_definition': assessor_data.get('property_class_code_definition'),
            'assessor_use_code': assessor_data.get('use_code'),
            'assessor_use_definition': assessor_data.get('use_definition'),
            'assessor_supervisor_district': assessor_data.get('supervisor_district'),
            'assessor_zoning_code': assessor_data.get('zoning_code'),
            'assessor_year_property_built': assessor_data.get('year_property_built'),
            'assessor_number_of_units': assessor_data.get('number_of_units'),
            'assessor_number_of_rooms': assessor_data.get('number_of_rooms'),
            'assessor_number_of_bathrooms': assessor_data.get('number_of_bathrooms'),
            'assessor_number_of_bedrooms': assessor_data.get('number_of_bedrooms'),
            'assessor_property_area': assessor_data.get('property_area'),
            'assessor_location': assessor_data.get('property_location'),
            'assessor_parcel_number': assessor_data.get('parcel_number'),
        }
    # Aggregate all Land Use fields if available
    landuse_fields = {}
    if landuse_info:
        landuse_fields = {
            'landuse_mapblklot': landuse_info.get('mapblklot'),
            'landuse_restype': landuse_info.get('restype'),
            'landuse_resunits': landuse_info.get('resunits'),
            'landuse_res': landuse_info.get('res'),
            'landuse_totalcomm': landuse_info.get('totalcomm'),
            'landuse_cie': landuse_info.get('cie'),
            'landuse_med': landuse_info.get('med'),
            'landuse_mips': landuse_info.get('mips'),
            'landuse_retail': landuse_info.get('retail'),
            'landuse_pdr': landuse_info.get('pdr'),
            'landuse_visitor': landuse_info.get('visitor'),
            'landuse_from_st': landuse_info.get('from_st'),
            'landuse_to_st': landuse_info.get('to_st'),
            'landuse_street': landuse_info.get('street'),
            'landuse_st_type': landuse_info.get('st_type'),
            'landuse_the_geom': landuse_info.get('the_geom'),
        }
    property_data = {
        'address': address or (
            f"{parcel_info.get('from_address_num', '')} {parcel_info.get('street_name', '')} {parcel_info.get('street_type', '')}".strip() 
            if parcel_info.get('from_address_num') 
            else parcel_info.get('address', '')
        ),
        'owner': owner,
        'property_type': property_type,
        'year_built': year_built,
        'assessed_value': assessed_value,
        'lot_size': parcel_info.get('lot_area', landuse_info.get('lotsqft') if landuse_info else 'Not available'),
        'zoning': parcel_info.get('zoning_district', landuse_info.get('zoning') if landuse_info else 'Not available'),
        'rent_controlled': 'Unknown',
        'num_units': num_units,
        'number_of_bedrooms': (assessor_data.get('number_of_bedrooms') if assessor_data else None) or parcel_info.get('number_of_bedrooms') or 'Not available',
        'number_of_bathrooms': (assessor_data.get('number_of_bathrooms') if assessor_data else None) or parcel_info.get('number_of_bathrooms') or 'Not available',
        'number_of_rooms': (assessor_data.get('number_of_rooms') if assessor_data else None) or parcel_info.get('number_of_rooms') or 'Not available',
        'last_sale_date': 'Not available',
        'last_sale_price': 'Not available',
        'building_sqft': building_sqft,
        'permits': []
    }
    property_data.update(landuse_fields)
    property_data.update(assessor_fields)
    
    # Extract unit number from assessor_location if available
    if assessor_data and assessor_data.get('property_location'):
        unit_num = extract_unit_number(assessor_data.get('property_location'))
        property_data['unit_number'] = f"Unit {unit_num}" if unit_num else None
    else:
        property_data['unit_number'] = None
    
    # Add Classification field from Land Use restype
    if landuse_info and landuse_info.get('restype'):
        property_data['classification'] = landuse_info.get('restype')
    # Determine rent control status (buildings built before 1979 are rent controlled in SF)
    if year_built and str(year_built).isdigit():
        property_data['rent_controlled'] = 'Yes' if int(year_built) < 1979 else 'No'
    # Add permit information
    if permits:
        property_data['permits'] = [{
            'description': p.get('description', 'N/A'),
            'status': p.get('status', 'N/A'),
            'filed_date': p.get('filed_date', 'N/A')[:10] if p.get('filed_date') else 'N/A',
            'permit_type': p.get('permit_type', 'N/A')
        } for p in permits[:5]]
    if not property_data['building_sqft']:
        property_data['building_sqft'] = 'Not available'
    
    # Add permit information
    if permits:
        property_data['permits'] = [{
            'description': p.get('description', 'N/A'),
            'status': p.get('status', 'N/A'),
            'filed_date': p.get('filed_date', 'N/A')[:10] if p.get('filed_date') else 'N/A',
            'permit_type': p.get('permit_type', 'N/A')
        } for p in permits[:5]]
    
    # ============================================================
    # Query SF Rent Board for official rent control status
    # ============================================================
    rent_board_info = get_rent_board_info(address=address, parcel=parcel)
    
    # ============================================================
    # Query SF Rent Board Housing Inventory for unit details
    # ============================================================
    rent_board_inventory = get_rent_board_housing_inventory(address=address, parcel=parcel)
    
    # Cross-reference and merge inventory data
    if rent_board_inventory and rent_board_inventory.get('units'):
        property_data['rent_board_inventory'] = rent_board_inventory
        units = rent_board_inventory['units']
        
        # Aggregate unit-level data
        if units:
            # Get most recent submission
            most_recent = units[0]
            
            # Extract useful data that we don't already have
            property_data['rent_board_bedroom_count'] = most_recent.get('bedroom_count')
            property_data['rent_board_bathroom_count'] = most_recent.get('bathroom_count')
            property_data['rent_board_square_footage'] = most_recent.get('square_footage')
            property_data['rent_board_monthly_rent'] = most_recent.get('monthly_rent')
            property_data['rent_board_occupancy_type'] = most_recent.get('occupancy_type')
            property_data['rent_board_utilities'] = {
                'water_sewer': most_recent.get('base_rent_includes_water_sewer') == 'Y',
                'natural_gas': most_recent.get('base_rent_includes_natural_gas') == 'Y',
                'electricity': most_recent.get('base_rent_includes_electricity') == 'Y',
                'refuse_recycling': most_recent.get('base_rent_includes_refuse_recycling') == 'Y'
            }
            property_data['rent_board_year_built'] = most_recent.get('year_property_built')
            property_data['rent_board_neighborhood'] = most_recent.get('analysis_neighborhood')
            property_data['rent_board_supervisor_district'] = most_recent.get('supervisor_district')
            
            # Cross-reference with existing data
            # If we don't have bedrooms/bathrooms, use rent board data
            if property_data.get('number_of_bedrooms') == 'Not available' and most_recent.get('bedroom_count'):
                property_data['number_of_bedrooms'] = most_recent.get('bedroom_count')
            
            if property_data.get('number_of_bathrooms') == 'Not available' and most_recent.get('bathroom_count'):
                property_data['number_of_bathrooms'] = most_recent.get('bathroom_count')
            
            # If we don't have year built, use rent board data
            if (not year_built or year_built == 'Not available') and most_recent.get('year_property_built'):
                property_data['year_built'] = most_recent.get('year_property_built')
    
    # Determine rent control status with priority:
    # 1. Official Rent Board data (most authoritative)
    # 2. Year built < 1979 (likely rent controlled)
    # 3. Unknown
    if rent_board_info:
        property_data['rent_board_verified'] = rent_board_info.get('is_rent_controlled', False)
        property_data['rent_board_data'] = rent_board_info.get('rent_board_data')
        property_data['rent_board_units_count'] = rent_board_info.get('total_units_found', 0)
        
        if rent_board_info.get('is_rent_controlled'):
            # Property is verified in the Rent Board registry
            property_data['rent_controlled'] = 'Yes (Verified by Rent Board)'
        else:
            # Not in rent board registry - use year built heuristic
            year_built_val = parcel_info.get('year_property_built')
            if year_built_val and str(year_built_val).isdigit():
                if int(year_built_val) < 1979:
                    property_data['rent_controlled'] = 'Likely Yes (Built before 1979)'
                else:
                    property_data['rent_controlled'] = 'Likely No (Built after 1979)'
            else:
                property_data['rent_controlled'] = 'Unknown'
    else:
        # Rent board query failed - fallback to year built
        year_built_val = parcel_info.get('year_property_built')
        if year_built_val and str(year_built_val).isdigit():
            if int(year_built_val) < 1979:
                property_data['rent_controlled'] = 'Likely Yes (Built before 1979)'
            else:
                property_data['rent_controlled'] = 'Likely No (Built after 1979)'
        else:
            property_data['rent_controlled'] = 'Unknown'
    
    # ============================================================
    # NEW: Query eviction history
    # ============================================================
    eviction_history = get_eviction_history(address=address, parcel=parcel)
    property_data['eviction_history'] = eviction_history
    property_data['eviction_count'] = len(eviction_history)
    
    # ============================================================
    # NEW: Query housing complaints
    # ============================================================
    housing_complaints = get_housing_complaints(address=address, parcel=parcel)
    property_data['housing_complaints'] = housing_complaints
    property_data['complaint_count'] = len(housing_complaints)
    
    # ============================================================
    # NEW: Query buyout agreements
    # ============================================================
    buyout_agreements = get_buyout_agreements(address=address, parcel=parcel)
    property_data['buyout_agreements'] = buyout_agreements
    property_data['buyout_count'] = len(buyout_agreements)
    
    if debug:
        debug_info['landuse_raw'] = landuse_info if landuse_info is not None else 'No Land Use data returned'
        debug_info['historical_taxroll_raw'] = historical_taxroll if historical_taxroll else 'No Historical Tax Roll data returned'
        debug_info['rent_board_raw'] = rent_board_info if rent_board_info else 'No Rent Board data returned'
        debug_info['eviction_raw'] = eviction_history if eviction_history else 'No eviction data returned'
        debug_info['complaints_raw'] = housing_complaints if housing_complaints else 'No complaint data returned'
        debug_info['_spacer'] = '\n\n=== RENT BOARD HOUSING INVENTORY ===\n'
        debug_info['rent_board_inventory_raw'] = rent_board_inventory if rent_board_inventory else 'No Rent Board Housing Inventory data returned'
        property_data['debug'] = debug_info
    return property_data

@app.route('/api/search', methods=['POST'])
def search_property():
    """Search for property information by address or parcel/lot"""
    try:
        data = request.json
        url = data.get('url', '')
        address = data.get('address', '')
        parcel = data.get('parcel', '')
        debug = bool(data.get('debug'))
        
        # Initialize listing amenities
        listing_amenities = {}
        
        # If URL provided, try to extract address and parse listing
        if url:
            # Parse Craigslist listing for amenities
            if 'craigslist' in url.lower():
                listing_amenities = parse_craigslist_listing(url)
            
            # Try to extract address from URL
            if not address and not parcel:
                extracted_address = extract_address_from_url(url)
                if extracted_address:
                    address = extracted_address
        
        if not address and not parcel:
            if listing_amenities:
                return jsonify({
                    'warning': 'No address or parcel/lot provided. Showing listing amenities only.',
                    'data': {'listing_amenities': listing_amenities}
                }), 200
            return jsonify({'error': 'Please provide an address or parcel/lot'}), 400
        
        # Get property details
        property_details = get_property_details(address=address, parcel=parcel, debug=debug)
        
        if 'error' in property_details:
            if listing_amenities:
                return jsonify({
                    'warning': property_details['error'],
                    'data': {'listing_amenities': listing_amenities}
                }), 200
            return jsonify({'warning': property_details['error'], 'data': {}}), 200
        
        # Merge listing amenities into property details
        if listing_amenities:
            property_details['listing_amenities'] = listing_amenities
            # Use listing data to supplement missing property data
            if listing_amenities.get('listing_bedrooms') and property_details.get('number_of_bedrooms') == 'Not available':
                property_details['number_of_bedrooms'] = listing_amenities['listing_bedrooms']
            if listing_amenities.get('listing_bathrooms') and property_details.get('number_of_bathrooms') == 'Not available':
                property_details['number_of_bathrooms'] = listing_amenities['listing_bathrooms']
        
        return jsonify(property_details), 200
    except Exception as e:
        print(f"/api/search error: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/parse-listing', methods=['POST'])
def parse_listing():
    """Parse a Craigslist listing URL for amenities"""
    try:
        data = request.json
        url = data.get('url', '')
        
        if not url:
            return jsonify({'error': 'Please provide a listing URL'}), 400
        
        if 'craigslist' not in url.lower():
            return jsonify({'error': 'Currently only Craigslist URLs are supported'}), 400
        
        amenities = parse_craigslist_listing(url)
        return jsonify(amenities), 200
    except Exception as e:
        print(f"/api/parse-listing error: {e}")
        return jsonify({'error': 'Failed to parse listing', 'details': str(e)}), 500

@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Get all saved properties"""
    return jsonify(saved_properties), 200

@app.route('/api/properties', methods=['POST'])
def save_property():
    """Save a property to the list"""
    global property_counter
    data = request.json
    data['id'] = property_counter
    data['saved_date'] = datetime.now().isoformat()
    saved_properties.append(data)
    property_counter += 1
    save_properties_to_file()
    return jsonify(data), 201

@app.route('/api/properties/<int:property_id>', methods=['DELETE'])
def delete_property(property_id):
    """Delete a saved property"""
    global saved_properties
    
    saved_properties = [p for p in saved_properties if p.get('id') != property_id]
    save_properties_to_file()
    
    return jsonify({'message': 'Property deleted'}), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API info"""
    return jsonify({
        'name': 'SF Rental Assistant API',
        'version': '1.0',
        'status': 'running',
        'endpoints': {
            'search': '/api/search',
            'properties': '/api/properties',
            'parse_listing': '/api/parse-listing',
            'health': '/health'
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
