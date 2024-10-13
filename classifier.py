import pandas as pd
import re

# Load your dataset (replace 'sonipat-pdf-data.csv' with your actual file path if needed)
data = pd.read_csv('./combined_dataset.csv')

# Print the column names to check the structure
print("Column Names:", data.columns)

# Cleaning function to remove newlines and extra spaces
def clean_text(text):
    text = re.sub(r'\n+', ' ', text)  # Remove newline characters
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    return text.strip()  # Remove leading and trailing spaces

# Apply the cleaning function to the 'Extracted Text' column
data['cleaned_doc'] = data['Extracted Text'].apply(lambda x: clean_text(x) if isinstance(x, str) else '')

# Define function to extract Claim Amount (monetary values in Rs.)
def extract_claim_amount(text):
    amounts = re.findall(r'Rs\.?\s?\d+(?:,\d{3})*(?:\.\d{2})?', text)  # Pattern for "Rs. 10,000.00"
    return amounts[0] if amounts else "Unknown"

# Define function to extract Vehicle Type
def extract_vehicle_type(text):
    vehicle_types = ['car', 'truck', 'bike', 'motorcycle', 'bus', 'scooter', 'auto-rickshaw']
    for vehicle in vehicle_types:
        if vehicle in text.lower():
            return vehicle
    return "Unknown"

# Define function to extract Claim Status (approved, denied, pending)
def extract_claim_status(text):
    if "approved" in text.lower():
        return "Approved"
    elif "denied" in text.lower() or "rejected" in text.lower():
        return "Denied"
    elif "pending" in text.lower():
        return "Pending"
    return "Unknown"

# Define function to extract Insurer Investigation Outcome (valid, fraudulent)
def extract_insurer_investigation_outcome(text):
    if "fraudulent" in text.lower():
        return "Fraudulent"
    elif "valid" in text.lower():
        return "Valid"
    return "Unknown"

# Define function to extract Relationship to Vehicle Owner
def extract_relationship_to_owner(text):
    if "self" in text.lower():
        return "Self"
    elif "spouse" in text.lower():
        return "Spouse"
    elif "friend" in text.lower():
        return "Friend"
    return "Unknown"

# Define function to extract Similar Claims Count
def extract_similar_claims_count(text):
    match = re.search(r'similar claims:?\s?(\d+)', text, re.IGNORECASE)
    return int(match.group(1)) if match else "Unknown"

# Apply the extraction functions to the cleaned document text
data['ClaimAmount'] = data['cleaned_doc'].apply(extract_claim_amount)
data['VehicleType'] = data['cleaned_doc'].apply(extract_vehicle_type)
data['ClaimStatus'] = data['cleaned_doc'].apply(extract_claim_status)
data['InsurerInvestigationOutcome'] = data['cleaned_doc'].apply(extract_insurer_investigation_outcome)
data['RelationshipToOwner'] = data['cleaned_doc'].apply(extract_relationship_to_owner)
data['SimilarClaimsCount'] = data['cleaned_doc'].apply(extract_similar_claims_count)

# Display the extracted results
print(data[['ClaimAmount', 'VehicleType', 'ClaimStatus', 
           'InsurerInvestigationOutcome', 'RelationshipToOwner', 
           'SimilarClaimsCount']].head())

# Save the results to a new CSV file
data.to_csv('combined-classified.csv', index=False)
