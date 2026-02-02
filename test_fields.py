print("\n" + "=" * 70)
print("Now testing the Assessor Historical Secured Property Tax Rolls dataset...")
print("=" * 70)

url3 = "https://data.sfgov.org/resource/wv5m-vpq2.json"

try:
    response3 = requests.get(url3, params=params, timeout=10)
    print(f"Status: {response3.status_code}")
    if response3.status_code == 200:
        data3 = response3.json()
        if data3:
            print("\nSample Record (ALL FIELDS):")
            print(json.dumps(data3[0], indent=2))
            print("\n" + "=" * 70)
            print("FIELD NAMES:")
            print("=" * 70)
            for key in sorted(data3[0].keys()):
                value = data3[0][key]
                if isinstance(value, str) and len(value) > 50:
                    value = value[:50] + "..."
                print(f"{key:30} = {value}")
        else:
            print("No data returned")
except Exception as e:
    print(f"Error: {e}")

#!/usr/bin/env python3
"""
Discover the actual field names in SF datasets
"""

import requests
import json

params = {"$limit": 1}

def print_fields(url, label):
    print("\n" + "=" * 70)
    print(f"Now testing the {label} dataset...")
    print("=" * 70)
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\nSample Record (ALL FIELDS):")
                print(json.dumps(data[0], indent=2))
                print("\n" + "=" * 70)
                print("FIELD NAMES:")
                print("=" * 70)
                for key in sorted(data[0].keys()):
                    value = data[0][key]
                    if isinstance(value, str) and len(value) > 50:
                        value = value[:50] + "..."
                    print(f"{key:30} = {value}")
            else:
                print("No data returned")
    except Exception as e:
        print(f"Error: {e}")

print_fields("https://data.sfgov.org/resource/us3s-fp9q.json", "Land Use (old)")
print_fields("https://data.sfgov.org/resource/fdfd-xptc.json", "Land Use 2023")
print_fields("https://data.sfgov.org/resource/wv5m-vpq2.json", "Assessor Historical Secured Property Tax Rolls")
