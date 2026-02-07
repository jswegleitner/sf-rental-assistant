# San Francisco Data Sources Reference

This document provides a comprehensive reference for all SF Open Data Portal datasets used in the SF Rental Assistant application, including field details and cross-referencing strategies.

---

## Table of Contents
1. [Property Information Sources](#property-information-sources)
2. [Rent Control Sources](#rent-control-sources)
3. [Tenant Protection Sources](#tenant-protection-sources)
4. [Building Activity Sources](#building-activity-sources)
5. [Address & Geocoding Sources](#address--geocoding-sources)
6. [External Sources](#external-sources)
7. [Cross-Referencing Guide](#cross-referencing-guide)

---

## Property Information Sources

### 1. SF Assessor Parcels
**API Endpoint:** `https://data.sfgov.org/resource/acdm-wktn.json`
**Dataset ID:** `acdm-wktn`
**Primary Use:** Core property information, ownership, and assessed values

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `blklot` | string | Block and Lot number (unique property ID) | "0123A001" |
| `block_num` | string | Block number | "0123" |
| `lot_num` | string | Lot number | "001" |
| `from_st` | string | Street number | "123" |
| `to_st` | string | Street number range end | "125" |
| `street` | string | Street name | "MAIN ST" |
| `st_type` | string | Street type | "ST", "AVE", "WAY" |
| `owner` | string | Property owner name | "SMITH JOHN" |
| `assessed_value` | number | Total assessed property value | 1500000 |
| `land_value` | number | Assessed land value | 500000 |
| `structure_value` | number | Assessed structure value | 1000000 |
| `year_built` | number | Year property was built | 1925 |
| `zoning` | string | Zoning code | "RH-3", "RM-2" |
| `property_class` | string | Property classification | "Residential", "Commercial" |
| `building_type` | string | Type of building | "Apartment", "Single Family" |
| `units` | number | Number of residential units | 6 |
| `bedrooms` | number | Total bedrooms in property | 12 |
| `bathrooms` | number | Total bathrooms in property | 8 |
| `rooms` | number | Total rooms in property | 36 |
| `lot_area` | number | Lot area in square feet | 5000 |
| `lot_depth` | number | Lot depth in feet | 100 |
| `lot_frontage` | number | Lot frontage in feet | 50 |
| `supervisor_district` | string | Supervisor district number | "5" |
| `neighborhood` | string | Neighborhood name | "Mission" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `blklot` (Block/Lot number)
- **Secondary:** Address (`from_st`, `street`, `st_type`)
- **Tertiary:** `location` coordinates

---

### 2. Assessor Historical Secured Property Tax Rolls
**API Endpoint:** `https://data.sfgov.org/resource/wv5m-vpq2.json`
**Dataset ID:** `wv5m-vpq2`
**Primary Use:** Historical property data, backup source for missing fields

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `block_and_lot` | string | Block and Lot number | "0123A001" |
| `closed_roll_year` | string | Tax year | "2023" |
| `property_location` | string | Full property address | "123 MAIN ST" |
| `class_code` | string | Property class code | "A" (residential), "B" (commercial) |
| `class_code_description` | string | Property class description | "Single Family Dwelling" |
| `year_property_built` | number | Year built | 1925 |
| `number_of_units` | number | Number of units | 6 |
| `number_of_rooms` | number | Number of rooms | 36 |
| `number_of_bathrooms` | number | Number of bathrooms | 8 |
| `number_of_bedrooms` | number | Number of bedrooms | 12 |
| `assessed_fixtures_value` | number | Assessed value of fixtures | 1000000 |
| `assessed_land_value` | number | Assessed value of land | 500000 |
| `assessed_improvement_value` | number | Assessed value of improvements | 950000 |
| `total_assessed_value` | number | Total assessed value | 1500000 |
| `supervisor_district` | string | Supervisor district | "5" |
| `neighborhood_code` | string | Neighborhood code | "Mission" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `block_and_lot`
- **Secondary:** `property_location` (full address string)
- **Tertiary:** `location` coordinates

---

### 3. Land Use
**API Endpoint:** `https://data.sfgov.org/resource/fdfd-xptc.json`
**Dataset ID:** `fdfd-xptc`
**Primary Use:** Zoning classification and building square footage

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `blklot` | string | Block and Lot number | "0123A001" |
| `block` | string | Block number | "0123" |
| `lot` | string | Lot number | "001" |
| `from_st` | string | Street number | "123" |
| `to_st` | string | Street number range end | "125" |
| `street` | string | Street name | "MAIN" |
| `st_type` | string | Street type | "ST" |
| `zoning` | string | Zoning designation | "RH-3" |
| `zoning_description` | string | Zoning description | "Residential House, Three-Family" |
| `resunits` | number | Number of residential units | 6 |
| `commsf` | number | Commercial square footage | 0 |
| `resarea` | number | Residential area (sq ft) | 4500 |
| `bldgsqft` | number | Total building square footage | 4500 |
| `yrbuilt` | number | Year built | 1925 |
| `bldguse` | string | Building use classification | "APARTMENT" |
| `proptype` | string | Property type | "Residential" |
| `landarea` | number | Land area (sq ft) | 5000 |
| `ownrname` | string | Owner name | "SMITH JOHN" |
| `mapblklot` | string | Mapper block/lot | "0123001" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `blklot`
- **Secondary:** Address (`from_st`, `street`, `st_type`)
- **Tertiary:** `location` coordinates

---

## Rent Control Sources

### 4. Rent Board Inventory of Units Subject to the Rent Ordinance
**API Endpoint:** `https://data.sfgov.org/resource/q4sy-bxrt.json`
**Dataset ID:** `q4sy-bxrt`
**Primary Use:** Official rent control status verification

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `property_id` | string | Unique property identifier | "RB12345" |
| `block` | string | Block number | "0123" |
| `lot` | string | Lot number | "001" |
| `blklot` | string | Combined block/lot | "0123001" |
| `property_address` | string | Full street address | "123 MAIN ST" |
| `zip_code` | string | ZIP code | "94110" |
| `neighborhood` | string | Neighborhood name | "Mission" |
| `supervisor_district` | string | Supervisor district | "9" |
| `rent_controlled_units` | number | Number of rent-controlled units | 5 |
| `total_units` | number | Total units in property | 6 |
| `certificate_of_final_completion` | date | Building completion date | "1925-01-15" |
| `date_added` | date | Date added to inventory | "2020-01-01" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `blklot` (without letter suffix)
- **Secondary:** `property_address`
- **Unique:** `property_id` (Rent Board internal ID)

#### Important Notes:
- Units built before June 13, 1979 are generally rent-controlled
- Properties with < 3 units may be exempt
- Cross-reference with Assessor Parcels to get full unit count

---

### 5. Rent Board Housing Inventory
**API Endpoint:** `https://data.sfgov.org/resource/gdc7-dmcn.json`
**Dataset ID:** `gdc7-dmcn`
**Primary Use:** Unit-level rent details, bedroom/bathroom counts, utilities included

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `property_id` | string | Rent Board property ID | "RB12345" |
| `unit_number` | string | Unit/apartment number | "2A", "Basement", "Ground Floor" |
| `street_address` | string | Property street address | "123 MAIN ST" |
| `city` | string | City | "San Francisco" |
| `zip_code` | string | ZIP code | "94110" |
| `neighborhood` | string | Neighborhood name | "Mission" |
| `supervisor_district` | string | Supervisor district | "9" |
| `block` | string | Block number | "0123" |
| `lot` | string | Lot number | "001" |
| `monthly_rent` | number | Current monthly rent | 2500 |
| `bedrooms` | number | Number of bedrooms | 2 |
| `bathrooms` | number | Number of bathrooms | 1 |
| `square_feet` | number | Unit square footage | 850 |
| `occupancy_type` | string | Occupancy classification | "Residential", "Live-Work" |
| `year_built` | number | Year property was built | 1925 |
| `water_sewer_included` | string | Water/sewer included in rent | "Yes", "No" |
| `gas_included` | string | Gas included in rent | "Yes", "No" |
| `electricity_included` | string | Electricity included in rent | "Yes", "No" |
| `trash_recycling_included` | string | Trash/recycling included | "Yes", "No" |
| `heat_included` | string | Heat included in rent | "Yes", "No" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `property_id` (links to Rent Board Inventory)
- **Secondary:** `street_address` + `unit_number`
- **Tertiary:** `block` + `lot`

#### Important Notes:
- Provides **unit-level** detail (not just property-level)
- Only includes properties in Rent Board jurisdiction
- Utilities included data is valuable for total cost comparison
- Can be aggregated by property address for building-wide analysis
- `unit_number` can be descriptive (e.g., "Garden Level", "Front")

---

## Tenant Protection Sources

### 6. Eviction Notices
**API Endpoint:** `https://data.sfgov.org/resource/5cei-gny5.json`
**Dataset ID:** `5cei-gny5`
**Primary Use:** Historical eviction filings and reasons

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `eviction_id` | string | Unique eviction notice ID | "E123456" |
| `address` | string | Property address | "123 MAIN ST" |
| `city` | string | City | "San Francisco" |
| `zip` | string | ZIP code | "94110" |
| `file_date` | date | Date eviction notice filed | "2023-05-15T00:00:00.000" |
| `non_payment` | boolean | Non-payment of rent | true/false |
| `breach` | boolean | Breach of lease | true/false |
| `nuisance` | boolean | Nuisance | true/false |
| `illegal_use` | boolean | Illegal use of unit | true/false |
| `failure_to_sign_renewal` | boolean | Failed to sign renewal | true/false |
| `access_denial` | boolean | Denied landlord access | true/false |
| `unapproved_subtenant` | boolean | Unapproved subtenant | true/false |
| `owner_move_in` | boolean | Owner move-in eviction | true/false |
| `demolition` | boolean | Demolition | true/false |
| `capital_improvement` | boolean | Capital improvement | true/false |
| `substantial_rehab` | boolean | Substantial rehabilitation | true/false |
| `ellis_act_withdrawal` | boolean | Ellis Act withdrawal | true/false |
| `condo_conversion` | boolean | Condo conversion | true/false |
| `roommate_same_unit` | boolean | Roommate in same unit | true/false |
| `other_cause` | boolean | Other cause | true/false |
| `late_payments` | boolean | Late payments | true/false |
| `lead_remediation` | boolean | Lead remediation | true/false |
| `development` | boolean | Development | true/false |
| `good_samaritan_ends` | boolean | Good Samaritan ends | true/false |
| `supervisor_district` | string | Supervisor district | "9" |
| `neighborhood` | string | Neighborhood | "Mission" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `address` (street address)
- **Secondary:** `location` coordinates
- **Note:** No block/lot in this dataset - must match by address

#### Important Notes:
- Multiple eviction reasons can be true for a single notice
- **No-fault evictions:** `owner_move_in`, `ellis_act_withdrawal`, `demolition`, `capital_improvement`, `condo_conversion`
- **At-fault evictions:** `non_payment`, `breach`, `nuisance`, `illegal_use`
- Eviction notices don't necessarily result in actual evictions
- Can aggregate by address to see eviction history

---

### 7. Housing Complaints
**API Endpoint:** `https://data.sfgov.org/resource/7d5q-jf8x.json`
**Dataset ID:** `7d5q-jf8x`
**Primary Use:** Building code violations and complaint history

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `complaint_id` | string | Unique complaint ID | "202312345" |
| `address` | string | Property address | "123 MAIN ST" |
| `street_name` | string | Street name | "MAIN" |
| `street_suffix` | string | Street suffix | "ST" |
| `street_number` | string | Street number | "123" |
| `zip_code` | string | ZIP code | "94110" |
| `date_filed` | date | Date complaint filed | "2023-08-10T00:00:00.000" |
| `complaint_origination` | string | How complaint originated | "Citizen", "Inspector" |
| `complaint_category` | string | Category of complaint | "Building", "Housing", "Sanitation" |
| `complaint_type` | string | Type of complaint | "Habitability", "Unsafe Building" |
| `complaint_description` | string | Description of issue | "Water leak from ceiling" |
| `status` | string | Current status | "Open", "Closed", "In Progress" |
| `status_date` | date | Date of status change | "2023-09-01T00:00:00.000" |
| `violation_code` | string | Violation code | "SEC104.1" |
| `violation_description` | string | Violation description | "Premises not maintained" |
| `disposition` | string | Resolution/outcome | "Corrected", "No Violation" |
| `neighborhood` | string | Neighborhood | "Mission" |
| `supervisor_district` | string | Supervisor district | "9" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `address` (full street address)
- **Secondary:** `street_number` + `street_name` + `street_suffix`
- **Tertiary:** `location` coordinates

#### Important Notes:
- Open complaints indicate ongoing issues
- High complaint volume may indicate poorly maintained property
- Common categories: Plumbing, Heating, Electrical, Structural, Sanitation
- Can filter by `status` to find unresolved issues

---

### 8. Buyout Agreements
**API Endpoint:** `https://data.sfgov.org/resource/wmam-7g8d.json`
**Dataset ID:** `wmam-7g8d`
**Primary Use:** Tenant buyout agreement filings

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `buyout_id` | string | Unique buyout agreement ID | "BA2023-001" |
| `address` | string | Property address | "123 MAIN ST" |
| `street_number` | string | Street number | "123" |
| `street_name` | string | Street name | "MAIN" |
| `street_type` | string | Street type | "ST" |
| `unit_number` | string | Unit number | "2A" |
| `zip_code` | string | ZIP code | "94110" |
| `file_date` | date | Date agreement filed | "2023-07-20T00:00:00.000" |
| `buyout_amount` | number | Buyout payment amount | 50000 |
| `tenant_accepted` | boolean | Whether tenant accepted | true/false |
| `acceptance_date` | date | Date tenant accepted | "2023-08-01T00:00:00.000" |
| `neighborhood` | string | Neighborhood | "Mission" |
| `supervisor_district` | string | Supervisor district | "9" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `address` + `unit_number`
- **Secondary:** `street_number` + `street_name` + `street_type`
- **Tertiary:** `location` coordinates

#### Important Notes:
- Buyouts often precede owner move-in or Ellis Act evictions
- Required to be filed with Rent Board as of 2015
- Amount can indicate property value and tenant vulnerability
- Multiple buyouts at same address may indicate displacement pattern

---

## Building Activity Sources

### 9. Building Permits
**API Endpoint:** `https://data.sfgov.org/resource/i98e-djp9.json`
**Dataset ID:** `i98e-djp9`
**Primary Use:** Recent construction, renovation, and repair permits

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `permit_number` | string | Unique permit number | "2023061512345" |
| `permit_type` | string | Type of permit | "Building", "Plumbing", "Electrical" |
| `permit_type_definition` | string | Detailed permit type | "Additions Alterations Repairs" |
| `permit_creation_date` | date | Date permit filed | "2023-06-15T00:00:00.000" |
| `block` | string | Block number | "0123" |
| `lot` | string | Lot number | "001" |
| `street_number` | string | Street number | "123" |
| `street_number_suffix` | string | Street number suffix | "A", "B" |
| `street_name` | string | Street name | "MAIN" |
| `street_suffix` | string | Street suffix | "ST" |
| `unit` | string | Unit number | "2A" |
| `unit_suffix` | string | Unit suffix | "A", "B" |
| `description` | string | Work description | "REPLACE WATER HEATER" |
| `status` | string | Permit status | "Filed", "Issued", "Complete", "Withdrawn" |
| `status_date` | date | Date of status | "2023-06-20T00:00:00.000" |
| `filed_date` | date | Date filed | "2023-06-15T00:00:00.000" |
| `issued_date` | date | Date issued | "2023-06-20T00:00:00.000" |
| `completed_date` | date | Date completed | "2023-07-01T00:00:00.000" |
| `estimated_cost` | number | Estimated cost of work | 5000 |
| `revised_cost` | number | Revised cost | 5500 |
| `existing_use` | string | Existing property use | "Apartments" |
| `proposed_use` | string | Proposed property use | "Apartments" |
| `existing_units` | number | Current number of units | 6 |
| `proposed_units` | number | Proposed number of units | 6 |
| `supervisor_district` | string | Supervisor district | "9" |
| `neighborhoods_analysis_boundaries` | string | Neighborhood | "Mission" |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |

#### Cross-Reference Keys:
- **Primary:** `block` + `lot`
- **Secondary:** `street_number` + `street_name` + `street_suffix`
- **Tertiary:** `location` coordinates

#### Important Notes:
- Major renovations may affect rent control status
- "Additions Alterations Repairs" type is most common
- Recent permits may indicate property improvements or issues
- `existing_units` vs `proposed_units` shows unit additions/removals
- Check `status` = "Complete" for finished work

---

## Address & Geocoding Sources

### 10. SF Property Information (Address Dataset)
**API Endpoint:** `https://data.sfgov.org/resource/wr8u-xric.json`
**Dataset ID:** `wr8u-xric`
**Primary Use:** Address autocomplete, geocoding, address validation

#### Key Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `address` | string | Full formatted address | "123 MAIN ST" |
| `address_number` | string | Street number | "123" |
| `address_number_suffix` | string | Number suffix | "A", "1/2" |
| `street_name` | string | Street name | "MAIN" |
| `street_type` | string | Street type | "ST", "AVE", "WAY" |
| `unit_number` | string | Unit/apartment number | "2A" |
| `zip_code` | string | ZIP code | "94110" |
| `latitude` | number | Latitude coordinate | 37.759893 |
| `longitude` | number | Longitude coordinate | -122.419739 |
| `location` | object | Geocoded location | `{latitude: 37.76, longitude: -122.42}` |
| `neighborhoods_analysis_boundaries` | string | Neighborhood | "Mission" |
| `supervisor_district` | string | Supervisor district | "9" |

#### Cross-Reference Keys:
- **Primary:** `address` (full address string)
- **Secondary:** `latitude` + `longitude`
- **Tertiary:** Address components

#### Important Notes:
- Used for address autocomplete in search form
- Provides accurate geocoding for map display
- Can reverse geocode from coordinates
- Includes unit-level addresses

---

## External Sources

### 11. Craigslist
**Data Source:** Web scraping of Craigslist listing pages
**URL Pattern:** `https://sfbay.craigslist.org/sfc/apa/d/[listing-id].html`
**Primary Use:** Extract listing details and amenities from URLs

#### Extracted Fields:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Listing title | "Beautiful 2BR in Mission District" |
| `price` | number | Monthly rent price | 3500 |
| `bedrooms` | number | Number of bedrooms | 2 |
| `bathrooms` | number | Number of bathrooms | 1 |
| `square_feet` | number | Square footage | 900 |
| `available_date` | date | Date available | "2023-09-01" |
| `address` | string | Listing address | "123 Main St" |
| `latitude` | number | Latitude | 37.759893 |
| `longitude` | number | Longitude | -122.419739 |
| **Amenities** | | | |
| `parking` | string | Parking type | "off-street parking", "street parking", "garage", "carport", "valet parking" |
| `laundry` | string | Laundry type | "w/d in unit", "laundry in bldg", "w/d hookups", "laundry on site", "no laundry on site" |
| `cats_ok` | boolean | Cats allowed | true/false |
| `dogs_ok` | boolean | Dogs allowed | true/false |
| `furnished` | boolean | Furnished unit | true/false |
| `no_smoking` | boolean | No smoking | true/false |
| `wheelchair_accessible` | boolean | Wheelchair accessible | true/false |
| `air_conditioning` | boolean | Air conditioning | true/false |
| `ev_charging` | boolean | EV charging available | true/false |
| `images` | array | Array of image URLs | ["url1", "url2"] |

#### Cross-Reference Keys:
- **Primary:** `address` (must geocode/normalize)
- **Secondary:** `latitude` + `longitude`

#### Important Notes:
- Scraping performed server-side with BeautifulSoup
- Address may need normalization to match SF data
- Not all fields present in every listing
- Useful for comparing asking rent vs rent-controlled rent

---

### 12. OpenStreetMap
**API Endpoint:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
**Primary Use:** Map tile display for property locations

#### Details:
- Tile-based map rendering
- Used with Leaflet.js for interactive maps
- No queryable data, just visual tiles
- Attribution required: "© OpenStreetMap contributors"

---

## Cross-Referencing Guide

### Primary Cross-Reference Keys

#### 1. Block/Lot Number (`blklot`)
**Most Reliable Property Identifier**

**Format Variations:**
- `"0123A001"` - Full block/lot with suffix (Assessor Parcels)
- `"0123001"` - Block/lot without suffix (Rent Board, Land Use)
- `"0123"` (block) + `"001"` (lot) - Separate fields

**Datasets with Block/Lot:**
- ✅ SF Assessor Parcels (`blklot`)
- ✅ Historical Tax Rolls (`block_and_lot`)
- ✅ Land Use (`blklot`, also `block` + `lot`)
- ✅ Rent Board Inventory (`block` + `lot`, sometimes `blklot`)
- ✅ Rent Board Housing Inventory (`block` + `lot`)
- ✅ Building Permits (`block` + `lot`)
- ❌ Eviction Notices (no block/lot)
- ❌ Housing Complaints (no block/lot)
- ❌ Buyout Agreements (no block/lot)

**Cross-Reference Strategy:**
```javascript
// Normalize block/lot for comparison
function normalizeBlockLot(blklot) {
  // Remove suffix letters and pad with zeros
  return blklot.replace(/[A-Z]/g, '').padStart(8, '0');
}
```

---

#### 2. Street Address
**Human-Readable but Less Reliable**

**Format Variations:**
- `"123 MAIN ST"` - Full address string
- `"123"` + `"MAIN"` + `"ST"` - Component fields
- `"123 Main Street"` - Different capitalization
- `"123-125 MAIN ST"` - Address ranges

**Datasets with Address:**
- ✅ All datasets include some form of address

**Challenges:**
- Address formatting inconsistencies
- Street vs St vs Street
- Number ranges (123-125 vs 123)
- Unit numbers may or may not be included
- Typos and data entry errors

**Cross-Reference Strategy:**
```javascript
// Normalize address for comparison
function normalizeAddress(address) {
  return address
    .toUpperCase()
    .replace(/STREET/g, 'ST')
    .replace(/AVENUE/g, 'AVE')
    .replace(/ROAD/g, 'RD')
    .replace(/\s+/g, ' ')
    .trim();
}
```

---

#### 3. Geographic Coordinates (Lat/Long)
**Useful for Proximity Matching**

**Format:**
- `location: {latitude: 37.759893, longitude: -122.419739}`
- Or separate `latitude` and `longitude` fields

**Datasets with Coordinates:**
- ✅ All datasets include geocoded `location` field

**Cross-Reference Strategy:**
```javascript
// Calculate distance between two points (Haversine formula)
function distanceBetween(lat1, lon1, lat2, lon2) {
  // Returns distance in meters
  // Properties within ~10-20 meters likely same building
}
```

---

### Common Cross-Referencing Patterns

#### Pattern 1: Property-Level Cross-Reference
**Use Case:** Get all information about a specific property

```javascript
// 1. Start with Assessor Parcels (most comprehensive)
const assessorData = query('acdm-wktn', { blklot: '0123A001' });

// 2. Get rent control status
const rentBoardData = query('q4sy-bxrt', {
  blklot: assessorData.blklot.replace(/[A-Z]/g, '')
});

// 3. Get unit-level rent details
const rentDetails = query('gdc7-dmcn', {
  block: assessorData.block_num,
  lot: assessorData.lot_num
});

// 4. Get zoning and square footage
const landUse = query('fdfd-xptc', { blklot: assessorData.blklot });

// 5. Get eviction history (by address)
const evictions = query('5cei-gny5', {
  address: normalizeAddress(assessorData.from_st + ' ' + assessorData.street)
});

// 6. Get complaints (by address)
const complaints = query('7d5q-jf8x', {
  address: normalizeAddress(assessorData.from_st + ' ' + assessorData.street)
});

// 7. Get building permits
const permits = query('i98e-djp9', {
  block: assessorData.block_num,
  lot: assessorData.lot_num
});
```

---

#### Pattern 2: Address-to-Property Resolution
**Use Case:** User enters an address, resolve to all matching properties

```javascript
// 1. Validate and geocode address
const addressData = query('wr8u-xric', { address: userInput });

// 2. Find assessor parcel
const parcel = query('acdm-wktn', {
  from_st: addressData.address_number,
  street: addressData.street_name,
  st_type: addressData.street_type
});

// 3. Continue with Pattern 1 using parcel.blklot
```

---

#### Pattern 3: Unit-Level Analysis
**Use Case:** Compare individual units within a property

```javascript
// 1. Get property-level data
const rentBoardInventory = query('q4sy-bxrt', { blklot: '0123001' });

// 2. Get all units in property
const units = query('gdc7-dmcn', {
  property_id: rentBoardInventory.property_id
});

// 3. Analyze rent distribution
const avgRent = units.reduce((sum, u) => sum + u.monthly_rent, 0) / units.length;
const rentPerBedroom = units.map(u => u.monthly_rent / u.bedrooms);
```

---

#### Pattern 4: Neighborhood Analysis
**Use Case:** Compare properties in same neighborhood

```javascript
// 1. Get all properties in neighborhood
const properties = query('acdm-wktn', {
  neighborhood: 'Mission'
});

// 2. Get rent data for all properties
const rents = properties.map(p =>
  query('gdc7-dmcn', {
    block: p.block_num,
    lot: p.lot_num
  })
).flat();

// 3. Calculate median rent by bedroom count
const medianRent2BR = calculateMedian(
  rents.filter(r => r.bedrooms === 2).map(r => r.monthly_rent)
);
```

---

### Field Mapping Reference

| Common Field | Assessor Parcels | Tax Rolls | Land Use | Rent Board | Rent Housing |
|--------------|-----------------|-----------|----------|------------|--------------|
| **Block/Lot** | `blklot` | `block_and_lot` | `blklot` | `block`+`lot` | `block`+`lot` |
| **Address** | `from_st`+`street` | `property_location` | `from_st`+`street` | `property_address` | `street_address` |
| **Year Built** | `year_built` | `year_property_built` | `yrbuilt` | `certificate_of_final_completion` | `year_built` |
| **Units** | `units` | `number_of_units` | `resunits` | `total_units` | count by `property_id` |
| **Bedrooms** | `bedrooms` | `number_of_bedrooms` | N/A | N/A | `bedrooms` (per unit) |
| **Bathrooms** | `bathrooms` | `number_of_bathrooms` | N/A | N/A | `bathrooms` (per unit) |
| **Sq Ft** | N/A | N/A | `bldgsqft` | N/A | `square_feet` (per unit) |
| **Zoning** | `zoning` | N/A | `zoning` | N/A | N/A |
| **Neighborhood** | `neighborhood` | `neighborhood_code` | N/A | `neighborhood` | `neighborhood` |

---

### Missing Data Strategy

When data is missing in one source, check these fallback sources:

| Missing Field | Primary Source | Fallback 1 | Fallback 2 |
|---------------|---------------|------------|------------|
| **Year Built** | Assessor Parcels | Tax Rolls | Land Use |
| **Units** | Assessor Parcels | Land Use | Rent Board Inventory |
| **Bedrooms** | Assessor Parcels | Tax Rolls | Aggregate Rent Housing |
| **Square Footage** | Land Use | Aggregate Rent Housing | N/A |
| **Rent** | Rent Housing Inventory | Craigslist | N/A |
| **Utilities** | Rent Housing Inventory | Craigslist | N/A |

---

## Data Quality Notes

### Known Issues

1. **Block/Lot Suffix Discrepancies**
   - Assessor Parcels: `"0123A001"` (includes suffix)
   - Other datasets: `"0123001"` (no suffix)
   - **Solution:** Strip suffix letters for matching

2. **Address Formatting Inconsistencies**
   - Different capitalization (MAIN vs Main)
   - Street type variations (ST vs Street)
   - Number ranges (123-125 vs 123)
   - **Solution:** Normalize before comparing

3. **Geocoding Accuracy**
   - Some addresses geocode to block centroid, not exact location
   - Unit-level addresses may share same coordinates
   - **Solution:** Use block/lot as primary key, coordinates as fallback

4. **Missing Data**
   - Not all properties have all fields populated
   - Rent Board data only includes rent-controlled properties
   - Building permits data may not capture all work
   - **Solution:** Use multiple sources and indicate data confidence

5. **Data Freshness**
   - Datasets update on different schedules
   - Some data may be months or years old
   - **Solution:** Display last updated date when available

6. **Unit-Level Granularity**
   - Most datasets are property-level, not unit-level
   - Only Rent Board Housing Inventory has unit-level detail
   - **Solution:** Aggregate unit data for property-level comparison

---

## API Query Examples

### Example 1: Get Property by Block/Lot
```javascript
// Assessor Parcels
fetch('https://data.sfgov.org/resource/acdm-wktn.json?blklot=0565023')
  .then(res => res.json());

// With multiple fields
fetch('https://data.sfgov.org/resource/acdm-wktn.json?blklot=0565023&$select=owner,assessed_value,year_built,units')
  .then(res => res.json());
```

### Example 2: Get Property by Address
```javascript
// Using SoQL WHERE clause
fetch('https://data.sfgov.org/resource/acdm-wktn.json?$where=from_st=\'123\' AND street=\'MAIN\' AND st_type=\'ST\'')
  .then(res => res.json());
```

### Example 3: Get Recent Evictions at Address
```javascript
// Evictions in last 5 years
const fiveYearsAgo = new Date();
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
const dateStr = fiveYearsAgo.toISOString().split('T')[0];

fetch(`https://data.sfgov.org/resource/5cei-gny5.json?address=123 MAIN ST&$where=file_date>'${dateStr}'`)
  .then(res => res.json());
```

### Example 4: Get All Units in Property
```javascript
// Rent Board Housing Inventory by property_id
fetch('https://data.sfgov.org/resource/gdc7-dmcn.json?property_id=RB12345')
  .then(res => res.json());

// Or by block/lot
fetch('https://data.sfgov.org/resource/gdc7-dmcn.json?block=0565&lot=023')
  .then(res => res.json());
```

### Example 5: Get Neighborhood Median Rent
```javascript
// All 2BR units in Mission
fetch('https://data.sfgov.org/resource/gdc7-dmcn.json?neighborhood=Mission&bedrooms=2&$select=monthly_rent&$limit=50000')
  .then(res => res.json())
  .then(data => {
    const rents = data.map(d => d.monthly_rent).sort((a, b) => a - b);
    const median = rents[Math.floor(rents.length / 2)];
    console.log('Median 2BR rent in Mission:', median);
  });
```

---

## Useful SoQL Queries

### Filtering
```javascript
// Exact match
?field_name=value

// Greater than
?$where=field_name > value

// Date range
?$where=date_field between '2023-01-01' and '2023-12-31'

// Multiple conditions
?$where=field1='value' AND field2>100
```

### Selecting Fields
```javascript
// Select specific fields
?$select=field1,field2,field3

// Aggregate functions
?$select=count(*),avg(monthly_rent),max(bedrooms)&$group=neighborhood
```

### Sorting and Limiting
```javascript
// Sort ascending
?$order=field_name ASC

// Sort descending
?$order=field_name DESC

// Limit results
?$limit=100

// Pagination
?$limit=100&$offset=200
```

---

## Application Search Strategy

### Address Search Implementation (Current)

**Problem Solved:** Address normalization inconsistencies across different SF datasets made reliable address-based searches difficult.

**Solution:** Use **SF Planning's ArcGIS Geocoder** as the authoritative address validation source.

#### How It Works:

1. **Frontend Autocomplete (SearchForm.jsx)**
   - User types address (minimum 2 characters, e.g., "2989 Jackson")
   - Frontend **normalizes query**:
     - Converts to uppercase
     - Expands directional abbreviations (N → NORTH, S → SOUTH, etc.)
     - Handles ordinal numbers (1ST, 2ND, etc.)
   - Queries **SF Planning ArcGIS Geocoder API**:
     - Endpoint: `https://sfplanninggis.org/arcgiswa/rest/services/Geocoder_V2/MapServer/0/query`
     - Returns up to 15 results with priority rankings (1-4)
   - Filters and displays results:
     - Priority 1-3 shown (Priority 4 = facilities, less relevant)
     - Sorted by priority (lower = better match)
     - Visual indicators: Blue border (P1), Green border (P2), No border (P3)
   - User selects validated address from dropdown (e.g., "2989 JACKSON ST")

2. **Address Resolution**
   - Selected address is **already validated** by SF Planning
   - Frontend sends full address to backend
   - Backend uses address to query all data sources

3. **Backend Data Retrieval (app.py)**
   - Receives validated address string
   - Queries data sources with **multiple matching strategies**:
     - **Primary:** Exact match on normalized address
     - **Fallback 1:** LIKE match with street number + name
     - **Fallback 2:** LIKE match with street number + first word
   - Data sources queried:
     - ✅ Assessor Parcels (`acdm-wktn.json`) - Property details, block/lot
     - ✅ Historical Tax Rolls (`wv5m-vpq2.json`) - Historical data
     - ✅ Land Use (`fdfd-xptc.json`) - Zoning, square footage
     - ✅ Rent Board Inventory (`q4sy-bxrt.json`) - Rent control status
     - ✅ Rent Board Housing Inventory (`gdc7-dmcn.json`) - Unit-level rent details
     - ✅ Building Permits (`i98e-djp9.json`) - Construction history
     - ✅ Eviction Notices (`5cei-gny5.json`) - Eviction history
     - ✅ Housing Complaints (`7d5q-jf8x.json`) - Violations
     - ✅ Buyout Agreements (`wmam-7g8d.json`) - Buyout filings

4. **Frontend Display (PropertyCard.jsx)**
   - **Property-level data:** Owner, year built, units, zoning, assessed value
   - **Rent Board Units:** If multiple units found, shows expand/collapse interface:
     - Each unit displays: bedrooms, bathrooms, rent, square footage
     - Expanded view: utilities included, occupancy type, year built
     - "Expand All" / "Collapse All" button
     - First unit expanded by default
   - **Tenant protections:** Evictions, complaints, buyouts
   - **Building activity:** Recent permits

#### Benefits:

- **Official validation**: Addresses validated by SF Planning's authoritative geocoder
- **Comprehensive coverage**: All SF addresses supported (not just rent-controlled)
- **Smart matching**: Priority rankings ensure best matches appear first
- **Fast and reliable**: Professional geocoding service with normalization built-in
- **User-friendly**: Works like Google Maps - just start typing
- **No pre-processing needed**: Backend receives clean, validated addresses

#### Technical Details:

**SF Planning ArcGIS Geocoder API:**
- Service: `Geocoder_V2/MapServer/0`
- Query format: `Address like 'QUERY%'` (prefix matching)
- Priority field (1-4):
  - **1**: Exact address match (best)
  - **2**: Close match / alternate format
  - **3**: Nearby or similar address
  - **4**: Facilities / special locations (filtered out)
- Returns: Address string, priority ranking, geometry (if requested)
- No authentication required (public service)

**Address Normalization (Frontend):**
- Directional: N/S/E/W → NORTH/SOUTH/EAST/WEST
- Ordinals: Preserved (1ST, 2ND, 3RD, etc.)
- Case: Uppercase for consistency
- Special chars: Handled by URL encoding

**Matching Strategy (Backend):**
1. Normalize address (remove punctuation, standardize street types)
2. Try exact match: `address = 'NORMALIZED'`
3. Try prefix match: `address LIKE 'NUMBER STREET%'`
4. Try loose match: `address LIKE 'NUMBER FIRST_WORD%'`
5. Return first successful match

#### Limitations:

- Requires internet connection to SF Planning's ArcGIS server
- Address must exist in SF Planning's geocoder database
- Some very new addresses may not be in geocoder yet
- Backend matching may still fail if data format differs significantly across datasets

---

## Update History

- **2026-02-07**: Initial creation - comprehensive reference for all SF data sources
- **2026-02-07**: Added Application Search Strategy section documenting Rent Board-based address resolution
- **2026-02-07**: Updated Application Search Strategy to document block-level address normalization and multi-unit display functionality
- **2026-02-07**: **Major update** - Replaced Rent Board autocomplete with SF Planning's ArcGIS Geocoder for professional-grade address validation and comprehensive coverage
- **Future**: Update with new datasets or field changes as API evolves

---

## Additional Resources

- [SF Open Data Portal](https://data.sfgov.org/)
- [Socrata API Documentation](https://dev.socrata.com/docs/endpoints.html)
- [SF Rent Ordinance Rules](https://sfrb.org/rent-ordinance-rules-regulations)
- [SF Planning Code](https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_planning/0-0-0-1)
