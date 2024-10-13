import os
import csv
import PyPDF2

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using PyPDF2."""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF {pdf_path}: {e}")
        return None

def process_folder(folder_path, output_csv):
    """Process all PDFs in a folder and save results to a CSV file."""
    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['PDF Name', 'Extracted Text'])
        
        for filename in os.listdir(folder_path):
            if filename.lower().endswith('.pdf'):
                pdf_path = os.path.join(folder_path, filename)
                extracted_text = extract_text_from_pdf(pdf_path)
                if extracted_text:
                    csv_writer.writerow([filename, extracted_text])
                    print(f"Processed: {filename}")
                else:
                    print(f"Failed to process: {filename}")

if __name__ == "__main__":
    pdf_folder = r'C:\Users\hp\Downloads\Ambala\Ambala'  # Your PDF folder path
    output_csv = 'pdf_data.csv'
    
    process_folder(pdf_folder, output_csv)
    print(f"Processing complete. Results saved to {output_csv}")