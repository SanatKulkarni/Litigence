import pytesseract
from PIL import Image

# Specify the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Change this to your Tesseract path

def extract_text_from_image(image_path):
    """Extract text from an image using Tesseract OCR."""
    try:
        # Open the image file
        img = Image.open(image_path)
        
        # Use Tesseract to do OCR on the image
        extracted_text = pytesseract.image_to_string(img, config='--psm 6')  # You can adjust the config based on your needs
        
        return extracted_text.strip()  # Return the extracted text, stripped of extra whitespace
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return None

if __name__ == "__main__":
    image_path = 'captcha.png'  # Path to your captcha image
    text = extract_text_from_image(image_path)
    
    if text:
        print("Extracted Text:", text)
    else:
        print("No text extracted.")
