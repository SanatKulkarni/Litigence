import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';

// Initialize CSV writer for output file
const csvWriter = createObjectCsvWriter({
  path: './fraud_scores.csv',  // Path to the output file
  header: [
    { id: 'caseNumber', title: 'Case Number' },
    { id: 'claim', title: 'Claim' },
    { id: 'fraudScore', title: 'Fraud Score' }
  ]
});

// Function to send claim to the API and get the fraud score
const getFraudScore = async (claim) => {
  try {
    const response = await axios.post('http://localhost:3001/analyze-claim', {
      claim // Sending the 'doc' field as 'claim'
    });
    return response.data.analysis;
  } catch (error) {
    console.error('Error fetching score for claim: "${claim}"'); // Log the claim that caused the error
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return 'Error fetching score';
  }
};

// Function to process all claims and save results to CSV with a 15-second timeout after every 15 cases
const processClaims = async (claims) => {
  let processedCount = 0;  // Keep track of processed claims
  const records = [];  // Array to store processed claim records for CSV

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const fraudScore = await getFraudScore(claim);  // Send the 'doc' as 'claim'
    const caseNumber = i + 1;

    // Push result to the records array
    records.push({
      caseNumber,
      claim,
      fraudScore
    });

    console.log('Fraud score for case ${caseNumber} saved.'); // Log that the fraud score has been saved
    processedCount++;

    // After processing every 15 cases, introduce a 15-second timeout
    if (processedCount % 15 === 0) {
      console.log('Processed 15 cases. Pausing for 15 seconds...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15-second delay (15000 ms)
    }
  }

  // Write the collected records to a CSV file
  await csvWriter.writeRecords(records);
  console.log('All claims have been processed and saved to fraud_scores.csv.');
};

// Function to process the CSV file
const processCSV = async () => {
  const results = [];
  
  // Read the CSV file and collect all docs in an array
  fs.createReadStream('./scrapedCasesFull.csv')  // Adjust the file path
    .pipe(csv())
    .on('data', (row) => {
      const doc = row['doc'];  // Extract 'doc' column from CSV
      if (doc) {
        results.push(doc);  // Add to results array
      }
    })
    .on('end', async () => {
      console.log('CSV file successfully processed. Analyzing claims...');
      await processClaims(results); // Process all claims one by one
    });
};

// Start processing the CSV
processCSV();