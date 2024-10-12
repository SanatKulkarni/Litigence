import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

app.post('/analyze-claim', async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim) {
      return res.status(400).json({ error: 'Claim details are required' });
    }

    const prompt = `
      Analyze the following motor insurance claim to detect potential fraud. Consider the following factors: pre-existing vehicle damage, fraudulent documentation (bills, receipts, police reports, identity documents), false information (location, timing, vehicle details), staged accident, multiple claims in a short span, exaggerated damages, invalid driver's license, medical fraud (inflated or fake injuries), involvement of suspicious third parties (lawyers, medical professionals), delayed reporting, witness tampering or absence of independent witnesses, inconsistent statements between claimant and reports, vehicle use beyond policy terms, telematics data inconsistencies, unreported vehicle modifications, involvement in fraud rings, excessive or unnecessary repairs, involvement of professionals linked to previous fraud cases, no police report filed, inconsistent accident timing, and unreasonable driver behavior (e.g., sudden braking, intentional swerves).
      For each factor, determine its presence and severity, then generate a fraud score between 0 and 100 based on the following considerations:
      * 0-25: Low risk of fraud (minimal or no indicators)
      * 26-50: Moderate risk (one or a few suspicious factors)
      * 51-75: High risk (several strong fraud indicators)
      * 76-100: Very high risk (multiple or severe fraud indicators, likely fraudulent)
      Only return the fraud score. Don't return along with a breakdown of which factors contributed to the score and why.

      Claim details:
      ${claim}
    `;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    console.log('Response from Gemini API:', response.data);

    const analysis = response.data.candidates[0].content.parts[0].text;

    res.json({ analysis });
  } catch (error) {
    console.error('Error while analyzing claim:', error.message, error.response ? error.response.data : '');
    res.status(500).json({ error: 'An error occurred while analyzing the claim' });
  }
});

app.get('/', (req, res) => {
  res.send('Fraud Detection API is running');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;