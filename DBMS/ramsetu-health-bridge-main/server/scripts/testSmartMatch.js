
import axios from 'axios';


// Test script to send sample data to the smart-match endpoint
async function testSmartMatch() {
  // Use a real patientId and organ from your DB
  const patientId = '6943aa5339d636b4a376481e'; // from your screenshot
  const organ = 'Kidney';
  const sampleRequest = {
    urgency_level: 5 // example value, adjust as needed
  };

  try {
    const response = await axios.post(`http://localhost:5000/api/match/smart/${patientId}/${organ}`, sampleRequest);
    console.log('Smart match response:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Backend error:', err.response.status, err.response.statusText);
      console.error('Response data:', err.response.data);
    } else if (err.request) {
      console.error('No response received from backend.');
      console.error('Request:', err.request);
    } else {
      console.error('Error:', err.message);
    }
    console.error('Full error object:', err);
  }
}

testSmartMatch();
