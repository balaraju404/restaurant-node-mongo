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
   scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
   projectId: 'gbr-food-app',
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

// Send the push notification to multiple device tokens using FCM API
async function sendPushNotification(deviceTokens, msgContent = {}, data = {}) {
 try {
  const accessToken = await getAccessToken(); // Get OAuth token

  // FCM HTTP v1 API endpoint
  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

  // Define the notification payload
  const message = {
   message: {
    token: deviceTokens[0],
    notification: {
     title: msgContent['title'] || 'Hello from Firebase!',
     body: msgContent['message'] || 'This is a test notification sent from Firebase Cloud Messaging API v1.'
    },
    data: data
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

module.exports = { sendPushNotification };
