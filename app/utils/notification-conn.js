const { google } = require('googleapis');
const path = require('path');
const axios = require('axios');

// Path to the service account file
const SERVICE_ACCOUNT_FILE = path.join(__dirname, './firebaseServiceAccount.json');

// Get an access token using the service account
async function getAccessToken() {
 try {
  const auth = new google.auth.GoogleAuth({
   keyFile: SERVICE_ACCOUNT_FILE,
   scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });

  // Get the OAuth 2.0 access token
  const authClient = await auth.getClient();
  const accessToken = await authClient.getAccessToken();

  // The access token is inside `token` field
  return accessToken.token;
 } catch (error) {
  console.error('Error authenticating with Firebase:', error);
  throw error;
 }
}

// Send the push notification to the device using FCM API
async function sendPushNotification(deviceToken) {
 try {
  const accessToken = await getAccessToken(); // Get OAuth token

  // FCM HTTP v1 API endpoint
  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`; // Replace with your project ID

  // Define the notification payload
  const message = {
   message: {
    token: deviceToken, // Device token to send the message to
    notification: {
     title: 'Hello from Firebase!',
     body: 'This is a test notification sent from Firebase Cloud Messaging API v1.'
    },
    data: {
     key1: 'value1',
     key2: 'value2'
    }
   }
  };

  // Send the POST request to FCM API
  const response = await axios.post(url, message, {
   headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
   }
  });

  console.log('Notification sent successfully:', response.data);
 } catch (error) {
  console.error('Error sending notification:', error.response ? error.response.data : error.message);
 }
}

// Replace this with the actual device token of your target device
// const deviceToken = 'YOUR_DEVICE_FCM_TOKEN'; // Replace with your actual device token
// sendPushNotification(deviceToken);

module.exports = { sendPushNotification };
