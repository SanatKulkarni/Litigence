import time
import csv
import re
import pytesseract
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException, TimeoutException, StaleElementReferenceException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize CSV file
csv_file = open('cases_details.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)

# Write CSV headers
headers = [
    'State Code', 'District Code', 'Case Type', 'Filing Number', 'Filing Date',
    'Registration Number', 'Registration Date', 'CNR Number', 'First Hearing Date',
    'Decision Date', 'Case Status', 'Nature of Disposal', 'Court Number and Judge',
    'Petitioners', 'Petitioner Advocates', 'Respondents', 'Respondent Advocates',
    'Acts', 'Sections', 'PDF Downloaded'
]
csv_writer.writerow(headers)

# Initialize WebDriver
service = Service()
driver = webdriver.Chrome(service=service)

def extract_table_data(table_element):
    """Extract data from a table and return as a dictionary"""
    data = {}
    try:
        rows = table_element.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 2:
                key = cells[0].text.strip(':').strip()
                value = cells[1].text.strip()
                data[key] = value
    except Exception as e:
        print(f"Error extracting table: {e}")
    return data

def extract_party_details(table_element):
    """Extract petitioner/respondent details from table"""
    parties = []
    advocates = []
    try:
        content = table_element.find_element(By.TAG_NAME, "td").text
        entries = re.split(r'\d+\)', content)
        for entry in entries[1:]:  # Skip the first empty split
            lines = entry.strip().split('\n')
            party = lines[0].strip()
            advocate = ''
            for line in lines[1:]:
                if line.strip().startswith('Advocate-'):
                    advocate = line.strip().replace('Advocate-', '').strip()
                    break
            parties.append(party)
            advocates.append(advocate)
    except Exception as e:
        print(f"Error extracting party details: {e}")
    return parties, advocates

def extract_acts_sections(table_element):
    """Extract acts and sections from the acts table"""
    acts = []
    sections = []
    try:
        rows = table_element.find_elements(By.TAG_NAME, "tr")
        for row in rows[1:]:  # Skip header row
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 2:
                acts.append(cells[0].text.strip())
                sections.append(cells[1].text.strip())
    except Exception as e:
        print(f"Error extracting acts and sections: {e}")
    return acts, sections

def close_popup():
    """Close any popup if it appears"""
    try:
        WebDriverWait(driver, 1).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[onclick*='closeModel']"))
        )
        close_button = driver.find_element(By.CSS_SELECTOR, "button[onclick*='closeModel']")
        close_button.click()
        print("Closed the error popup.")
    except (NoSuchElementException, TimeoutException):
        print("No popup to close. Continuing...")

def close_ok_popup():
    """Close the OK popup if it appears"""
    try:
        ok_button = WebDriverWait(driver, 1).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-bs-dismiss='modal']"))
        )
        ok_button.click()
        print("Closed the OK popup.")
    except (NoSuchElementException, TimeoutException):
        print("No OK popup to close. Continuing...")

def handle_captcha():
    """Handle captcha and submit the form"""
    try:
        captcha_image = driver.find_element(By.ID, "captcha_image")
        captcha_image.screenshot('captcha.png')
        
        captcha_text = pytesseract.image_to_string(Image.open('captcha.png'), config='--psm 6').strip()
        
        captcha_field = driver.find_element(By.ID, "ct_captcha_code")
        captcha_field.clear()
        captcha_field.send_keys(captcha_text)
        
        submit_button = driver.find_element(By.XPATH, "//button[@class='btn btn-primary' and @onclick='submitCaseType();']")
        submit_button.click()
        return True
    except Exception as e:
        print(f"Error handling captcha: {e}")
        return False

def scrape_case_details():
    """Scrape all case details from the current page and download the judgment PDF if available"""
    try:
        # Wait for elements to be present
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#CScaseType > table.table.case_details_table.table-bordered"))
        )
        
        # Extract case details
        case_details_table = driver.find_element(By.CSS_SELECTOR, "#CScaseType > table.table.case_details_table.table-bordered")
        case_details = extract_table_data(case_details_table)

        # Extract case status
        case_status_table = driver.find_element(By.CSS_SELECTOR, "#CScaseType > table.table.case_status_table.table-bordered")
        case_status = extract_table_data(case_status_table)

        # Extract petitioner details
        petitioners, petitioner_advocates = [], []
        try:
            petitioner_table = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#CScaseType > table.table.table-bordered.Petitioner_Advocate_table"))
            )
            petitioners, petitioner_advocates = extract_party_details(petitioner_table)
        except TimeoutException:
            print("Petitioner table not found")

        # Extract respondent details
        respondents, respondent_advocates = [], []
        try:
            respondent_table = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#CScaseType > table.table.table-bordered.Respondent_Advocate_table"))
            )
            respondents, respondent_advocates = extract_party_details(respondent_table)
        except TimeoutException:
            print("Respondent table not found")

        # Extract acts and sections
        acts, sections = [], []
        try:
            acts_table = driver.find_element(By.CSS_SELECTOR, "#act_table")
            acts, sections = extract_acts_sections(acts_table)
        except NoSuchElementException:
            print("Acts table not found")

        # Extract judgment PDF if available
        pdf_downloaded = False
        try:
            judgment_link = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Copy of Judgment') and contains(@onclick, 'displayPdf')]"))
            )
            driver.execute_script("arguments[0].click();", judgment_link)
            print("Clicked on 'Copy of Judgment' link")

            # Wait for the PDF viewer to open
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.TAG_NAME, "embed"))
            )

            # Switch to PDF viewer iframe if necessary
            try:
                iframe = driver.find_element(By.TAG_NAME, 'iframe')
                driver.switch_to.frame(iframe)
            except NoSuchElementException:
                print("No iframe found, proceeding with main content")

            # Find and click the download button
            download_button = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "cr-icon-button#download[iron-icon='cr:file-download']"))
            )
            
            # Try different methods to click the download button
            try:
                driver.execute_script("arguments[0].click();", download_button)
            except Exception:
                ActionChains(driver).move_to_element(download_button).click().perform()
            
            print("Clicked on download button")

            # Wait for the download to complete (adjust time as needed)
            time.sleep(2)
            pdf_downloaded = True

            # Switch back to default content if we switched to an iframe
            driver.switch_to.default_content()

            # Close the PDF viewer
            close_button = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button.btn-close[data-bs-dismiss='modal']"))
            )
            driver.execute_script("arguments[0].click();", close_button)
            print("Closed the PDF viewer")

        except TimeoutException:
            print("'Copy of Judgment' link not found or PDF viewer not available")
        except Exception as e:
            print(f"Error while handling judgment PDF: {e}")

        # Prepare and write row to CSV
        row = [
            "1",  # State Code (Maharashtra)
            "19",  # District Code (Pune)
            case_details.get('Case Type', ''),
            case_details.get('Filing Number', ''),
            case_details.get('Filing Date', ''),
            case_details.get('Registration Number', ''),
            case_details.get('Registration Date', ''),
            case_details.get('CNR Number', ''),
            case_status.get('First Hearing Date', ''),
            case_status.get('Decision Date', ''),
            case_status.get('Case Status', ''),
            case_status.get('Nature of Disposal', ''),
            case_status.get('Court Number and Judge', ''),
            ';'.join(petitioners),
            '; '.join(petitioner_advocates),
            '; '.join(respondents),
            '; '.join(respondent_advocates),
            '; '.join(acts),
            '; '.join(sections),
            'Yes' if pdf_downloaded else 'No'  # Indicate whether PDF was downloaded
        ]
        
        csv_writer.writerow(row)
        print("Successfully scraped and wrote case details to CSV")
        
    except Exception as e:
        print(f"Error while scraping case details: {e}")
        
def main():
    try:
        # Navigate to eCourts website
        driver.get("https://services.ecourts.gov.in/ecourtindia_v6/")
        time.sleep(1)

        # Navigate to Case Status
        case_status_tab = driver.find_element(By.LINK_TEXT, "Case Status")
        case_status_tab.click()
        time.sleep(1)

        # Close initial popups
        close_popup()

        # Navigate to Case Type tab
        case_type_tab_button = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.ID, "casetype-tabMenu"))
        )
        driver.execute_script("arguments[0].click();", case_type_tab_button)
        time.sleep(1)

        # Close OK popup
        close_ok_popup()

        # Select Maharashtra
        state_dropdown = Select(driver.find_element(By.ID, "sess_state_code"))
        state_dropdown.select_by_value("1")
        time.sleep(1)
        close_popup()

        # Select Pune district
        district_dropdown = Select(driver.find_element(By.ID, "sess_dist_code"))
        district_dropdown.select_by_value("19")
        time.sleep(1)

        # Select Pune District and Sessions Court
        court_complex_dropdown = Select(driver.find_element(By.ID, "court_complex_code"))
        court_complex_dropdown.select_by_value("1010217@3,4,5@N")
        close_popup()

        # Select case type (M.A.C.P)
        case_type_dropdown = Select(driver.find_element(By.ID, "case_type_2"))
        case_type_dropdown.select_by_value("12^5")

        # Enter year
        year_field = driver.find_element(By.ID, "search_year")
        year_field.clear()
        year_field.send_keys("2015")

        # Select disposed option
        disposed_option = driver.find_element(By.ID, "radDCT")
        disposed_option.click()

        # Handle captcha and submit
        if not handle_captcha():
            print("Failed to handle captcha. Exiting...")
            return

        # Wait for results
        time.sleep(2)

        # Process results
        page_number = 1
        while True:
            try:
                view_buttons = WebDriverWait(driver, 3).until(
                    EC.presence_of_all_elements_located((By.XPATH, "//a[contains(text(), 'View')]"))
                )

                if not view_buttons:
                    print(f"No 'View' buttons found on page {page_number}.")
                    try:
                        next_page_button = driver.find_element(By.XPATH, "//a[contains(text(), 'Next')]")
                        next_page_button.click()
                        print(f"Moved to page {page_number + 1}")
                        page_number += 1
                        time.sleep(1)
                        continue
                    except NoSuchElementException:
                        print("No 'Next' button found. All pages processed.")
                        break

                print(f"Processing {len(view_buttons)} 'View' buttons on page {page_number}")

                for index, button in enumerate(view_buttons):
                    try:
                        driver.execute_script("arguments[0].click();", button)
                        print(f"Clicked on 'View' button #{index + 1} on page {page_number}")
                        
                        # Wait and scrape details
                        time.sleep(1)
                        scrape_case_details()
                        
                        # Go back
                        back_button = driver.find_element(By.ID, "main_back_caseType")
                        driver.execute_script("arguments[0].click();", back_button)
                        print("Clicked back button")
                        
                        # Wait for results page to reload
                        time.sleep(1)
                        close_popup()
                        
                    except Exception as e:
                        print(f"Error processing button #{index + 1} on page {page_number}: {e}")
                        driver.refresh()
                        time.sleep(2)
                        break

                # Try to go to next page
                try:
                    next_page_button = driver.find_element(By.XPATH, "//a[contains(text(), 'Next')]")
                    next_page_button.click()
                    print(f"Moved to page {page_number + 1}")
                    page_number += 1
                    time.sleep(1)
                except NoSuchElementException:
                    print("No 'Next' button found. All pages processed.")
                    break

            except Exception as e:
                print(f"An error occurred while processing page {page_number}: {e}")
                time.sleep(2)
                driver.refresh()

    except Exception as e:
        print(f"Fatal error: {e}")
    finally:
        csv_file.close()
        driver.quit()

if __name__ == "__main__":
    main()