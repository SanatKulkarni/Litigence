import io
import pandas as pd
import numpy as np
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from PyPDF2 import PdfReader
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import re
import json

app = FastAPI()

# Load Qwen 2.5 1.5B model and tokenizer
model_name = "Qwen/Qwen2.5-1.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, low_cpu_mem_usage=True)

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load the existing classified data
classified_data = pd.read_csv('combined_classified_qwen_detailed_optimized.csv')

# Prepare the KNN model
features = ['ClaimAmount', 'VehicleType', 'ClaimStatus', 'InsurerInvestigationOutcome', 'RelationshipToOwner']

# Function to convert categorical variables to numerical
def encode_categorical(df):
    for column in df.columns:
        if df[column].dtype == 'object':
            df[column] = pd.Categorical(df[column]).codes
    return df

# Prepare the existing data for KNN
X = classified_data[features]
X = encode_categorical(X)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train the KNN model
n_neighbors = 5  # You can adjust this
knn = NearestNeighbors(n_neighbors=n_neighbors, metric='euclidean')
knn.fit(X_scaled)

def extract_text_from_pdf(pdf_file):
    pdf_reader = PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def classify_text(text):
    labels = ['ClaimAmount', 'VehicleType', 'ClaimStatus', 'InsurerInvestigationOutcome', 'RelationshipToOwner']
    prompt = f"""Analyze the following text and provide detailed classifications for these categories: {', '.join(labels)}. 
    For each category, provide the most specific and accurate information found in the text. If a category is not mentioned or cannot be determined from the text, state "Not specified" for that category.
    Provide the classification as a JSON object where keys are the categories and values are the detailed classifications.
    Text: {text[:1500]}  # Truncate text to first 1500 characters to avoid token limit
    Detailed Classification:"""
    
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(inputs, max_new_tokens=200, num_return_sequences=1, temperature=0.2)
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    try:
        json_str = re.search(r'\{.*\}', response, re.DOTALL).group()
        classification_dict = json.loads(json_str)
        return {label: classification_dict.get(label, "Not specified") for label in labels}
    except:
        print(f"Error parsing response: {response}")
        return {label: "Error in classification" for label in labels}

def detect_fraud(new_case):
    # Prepare the new case data
    new_case_df = pd.DataFrame([new_case])
    new_case_encoded = encode_categorical(new_case_df)
    new_case_scaled = scaler.transform(new_case_encoded)
    
    # Find the nearest neighbors
    distances, indices = knn.kneighbors(new_case_scaled)
    
    # Calculate the average fraud score of the neighbors
    neighbor_fraud_scores = classified_data.iloc[indices[0]]['FraudRiskScore']
    avg_fraud_score = neighbor_fraud_scores.mean()
    
    # You can adjust this threshold based on your needs
    fraud_threshold = 0.7
    
    is_fraudulent = avg_fraud_score > fraud_threshold
    
    return {
        "is_fraudulent": bool(is_fraudulent),
        "fraud_score": float(avg_fraud_score),
        "nearest_neighbors": indices[0].tolist()
    }

class FraudDetectionResponse(BaseModel):
    classification: dict
    fraud_analysis: dict

@app.post("/detect_fraud", response_model=FraudDetectionResponse)
async def detect_fraud_endpoint(file: UploadFile = File(...)):
    # Read and extract text from the PDF
    pdf_content = await file.read()
    text = extract_text_from_pdf(io.BytesIO(pdf_content))
    
    # Classify the text
    classification = classify_text(text)
    
    # Detect fraud
    fraud_analysis = detect_fraud(classification)
    
    return FraudDetectionResponse(
        classification=classification,
        fraud_analysis=fraud_analysis
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)