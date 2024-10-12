import cv2
import pytesseract

def extract_text_from_image(image_path):
    # Read the image using OpenCV
    image = cv2.imread(image_path)

    # Convert image to grayscale (optional, but improves OCR results)
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply some preprocessing (optional)
    # You can use GaussianBlur, thresholding, etc. to improve text recognition
    gray_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

    # Extract text from image using Tesseract
    text = pytesseract.image_to_string(gray_image)

    return text

# Example usage:
image_path = './testimg2.png'  # Replace with your image path
text = extract_text_from_image(image_path)
print("Extracted Text:\n", text)
