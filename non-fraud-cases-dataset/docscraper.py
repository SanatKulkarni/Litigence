import pandas as pd
import requests
import csv
import time
from typing import Dict, Optional
import json
from bs4 import BeautifulSoup

def fetch_document_details(tid: int, api_key: str) -> Optional[Dict]:
    """Fetch detailed document information for a given TID."""
    url = f"https://api.indiankanoon.org/doc/{tid}/"
    headers = {"Authorization": api_key}
    
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching document {tid}: {str(e)}")
        return None

def clean_text(text: str) -> str:
    """Clean HTML and normalize text content."""
    # Remove HTML tags
    soup = BeautifulSoup(text, 'html.parser')
    cleaned_text = soup.get_text(separator=' ')
    # Normalize whitespace
    cleaned_text = ' '.join(cleaned_text.split())
    return cleaned_text

def extract_doc_details(doc_data: Dict) -> Dict:
    """Extract and clean relevant fields from document data."""
    return {
        'tid': doc_data.get('tid', ''),
        'title': clean_text(doc_data.get('title', '')),
        'doc': clean_text(doc_data.get('doc', '')),
        'citation': doc_data.get('citation', ''),
        'court': doc_data.get('court', ''),
        'doc_author': doc_data.get('doc_author', ''),
        'doc_type': doc_data.get('doc_type', ''),
        'judgment_date': doc_data.get('judgment_date', '')
    }

def save_to_csv(data: list, filename: str):
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
    INPUT_FILE = "indian_kanoon_data.csv"
    OUTPUT_FILE = "indian_kanoon_detailed_docs.csv"
    DELAY_BETWEEN_REQUESTS = 1  # seconds
    
    # Read TIDs from input CSV
    try:
        df = pd.read_csv(INPUT_FILE)
        tids = df['tid'].tolist()
    except Exception as e:
        print(f"Error reading input file: {str(e)}")
        return
    
    print(f"Found {len(tids)} documents to process")
    
    all_docs = []
    success_count = 0
    error_count = 0
    
    # Process each TID
    for i, tid in enumerate(tids, 1):
        print(f"Processing document {i} of {len(tids)} (TID: {tid})...")
        
        # Fetch detailed document data
        doc_data = fetch_document_details(tid, API_KEY)
        
        if doc_data:
            try:
                # Extract and clean document details
                doc_details = extract_doc_details(doc_data)
                all_docs.append(doc_details)
                success_count += 1
                print(f"Successfully processed document {tid}")
            except Exception as e:
                print(f"Error processing document {tid}: {str(e)}")
                error_count += 1
        else:
            error_count += 1
        
        # Add delay between requests
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save all collected data to CSV
    if all_docs:
        print(f"\nSaving {len(all_docs)} documents to {OUTPUT_FILE}")
        save_to_csv(all_docs, OUTPUT_FILE)
        print("\nProcessing complete!")
        print(f"Successfully processed: {success_count}")
        print(f"Errors: {error_count}")
    else:
        print("No documents were successfully processed")

if __name__ == "__main__":
    main()