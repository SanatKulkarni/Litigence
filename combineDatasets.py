import pandas as pd
import glob

# Define the path to your CSV files
csv_files = glob.glob(r"D:\HackRX\pdf-scraper\*.csv")

# Initialize an empty list to store the dataframes
dataframes = []

# Loop through each CSV file
for file in csv_files:
    # Read the CSV file and only keep 'PDF Name' and 'Extracted Text' columns
    df = pd.read_csv(file, usecols=['PDF Name', 'Extracted Text'])
    
    # Append the dataframe to the list
    dataframes.append(df)

# Concatenate all the dataframes in the list into a single dataframe
combined_df = pd.concat(dataframes, ignore_index=True)

# Save the combined dataframe to a new CSV file
combined_df.to_csv(r"D:\HackRX\pdf-scraper\combined_dataset.csv", index=False)

print("Combined dataset created and saved as 'combined_dataset.csv'")
