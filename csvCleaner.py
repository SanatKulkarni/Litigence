import csv
import re

def clean_text(text):
    # Remove newlines and extra spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def process_csv(input_file, output_file):
    with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
         open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        current_pdf = ""
        current_text = ""
        
        for row in reader:
            if len(row) == 2:
                if current_pdf:
                    writer.writerow([current_pdf, clean_text(current_text)])
                current_pdf = row[0]
                current_text = row[1]
            else:
                current_text += " " + " ".join(row)
        
        # Write the last row
        if current_pdf:
            writer.writerow([current_pdf, clean_text(current_text)])

# Usage
input_file = './pune-pdf-data.csv'
output_file = 'output.csv'
process_csv(input_file, output_file)