import os
import csv
import easyocr
from pdf2image import convert_from_path
import PyPDF2
from PIL import Image
import io

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])  # For English. Add more languages if needed.

POPPLER_PATH = r"C:\Users\hp\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin"  # Change this to your Poppler path

def extract_text_from_image(image):
    """Extract text from an image using EasyOCR."""
    try:
        results = reader.readtext(image)
        return ' '.join([result[1] for result in results])
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return None

def process_pdf(pdf_path):
    """Process a PDF file and extract text from each page."""
    try:
        # First, try to extract text directly using PyPDF2
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n\n"
            if text.strip():
                return text.strip()
        except Exception as e:
            print(f"PyPDF2 failed: {e}. Trying OCR...")

        # If PyPDF2 fails or extracts no text, use OCR
        images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
        text = ""
        for i, image in enumerate(images):
            # Convert PIL Image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()

            page_text = extract_text_from_image(img_byte_arr)
            if page_text:
                text += f"Page {i+1}: {page_text}\n\n"
        
        return text.strip() if text.strip() else "No text could be extracted from this PDF."
    except Exception as e:
        print(f"Error processing PDF {pdf_path}: {e}")
        return f"Failed to process due to error: {str(e)}"

def process_folder(folder_path, output_csv):
    """Process all PDFs in a folder and save results to a CSV file."""
    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['PDF Name', 'Extracted Text'])
        
        for filename in os.listdir(folder_path):
            if filename.lower().endswith('.pdf'):
                pdf_path = os.path.join(folder_path, filename)
                extracted_text = process_pdf(pdf_path)
                csv_writer.writerow([filename, extracted_text])
                print(f"Processed: {filename}")

if __name__ == "__main__":
    pdf_folder = r'C:\Users\hp\Downloads\Aurangabad'  # Your PDF folder path
    output_csv = 'pdf_data.csv'
    
    process_folder(pdf_folder, output_csv)
    print(f"Processing complete. Results saved to {output_csv}")