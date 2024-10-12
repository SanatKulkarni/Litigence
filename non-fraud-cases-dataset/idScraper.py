import requests
import csv
import time
from typing import Dict, List
import json

def fetch_page_data(page_num: int, api_key: str) -> Dict:
    """Fetch data from Indian Kanoon API for a specific page."""
    url = f"https://api.indiankanoon.org/search/?formInput=motor+accident+general+insurance+claim+section+279+section+304a&pagenum={page_num}"
    headers = {"Authorization": api_key}
    
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page {page_num}: {str(e)}")
        return None

def extract_doc_data(doc: Dict) -> Dict:
    """Extract relevant fields from a document."""
    return {
        'tid': doc.get('tid', ''),
        'title': doc.get('title', ''),
        'doctype': doc.get('doctype', ''),
        'publishdate': doc.get('publishdate', ''),
        'author': doc.get('author', ''),
        'docsource': doc.get('docsource', ''),
        'headline': doc.get('headline', ''),
        'docsize': doc.get('docsize', ''),
        'numcites': doc.get('numcites', ''),
        'numcitedby': doc.get('numcitedby', '')
    }

def save_to_csv(data: List[Dict], filename: str):
    """Save the extracted data to a CSV file."""
    if not data:
        print("No data to save")
        return
    
    fieldnames = data[0].keys()
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def main():
    # Configuration
    API_KEY = "Token 902fe226662557a2adc7ad1988ecdcbff1c40ae0"
    OUTPUT_FILE = "indian_kanoon_data.csv"
    START_PAGE = 1
    END_PAGE = 40
    DELAY_BETWEEN_REQUESTS = 1  # seconds
    
    all_docs = []
    
    print(f"Starting data collection from page {START_PAGE} to {END_PAGE}")
    
    for page in range(START_PAGE, END_PAGE + 1):
        print(f"Fetching page {page}...")
        
        # Fetch data for current page
        response_data = fetch_page_data(page, API_KEY)
        
        if response_data and 'docs' in response_data:
            # Extract and store document data
            page_docs = [extract_doc_data(doc) for doc in response_data['docs']]
            all_docs.extend(page_docs)
            print(f"Successfully processed {len(page_docs)} documents from page {page}")
        else:
            print(f"No valid data found for page {page}")
        
        # Add delay between requests to be respectful to the API
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save all collected data to CSV
    print(f"\nSaving {len(all_docs)} documents to {OUTPUT_FILE}")
    save_to_csv(all_docs, OUTPUT_FILE)
    print("Data collection complete!")

if __name__ == "__main__":
    main()
