const { getDb } = require('../../db-conn/db-conn');
const { saveDeviceToken } = require('../device_token');

exports.check = async (reqParams) => {
 try {
  const db = getDb();
  const login_name = reqParams.login_name;
  const password = reqParams.login_password;

  const collection = db.collection(TBL_USERS);
  const result = await collection.findOne({ login_name });
  if (result) {
   if (result.password === password) {
    delete result['password']
    result['user_id'] = result['_id']
    if (result['user_profile']) {
     const base64Image = result['user_profile'].toString('base64');
     result['user_profile'] = `data:image/png;base64,${base64Image}`;
    }
    if (result['role_id'] == 1 || result['role_id'] == 3) {
     if ("device_token" in reqParams && reqParams['device_token'].length > 0) {
      const params = { 'id': result['user_id'].toString(), 'device_token': reqParams['device_token'] }
      const res = await saveDeviceToken(params)
      if (res['insertedId']) {
       result['device_token_id'] = res['insertedId'].toString()
      } else {
       result['device_token_id'] = ''
      }
     } else {
      result['device_token_id'] = ''
     }
    }
    return { status: true, msg: 'Login successful', data: result };
   } else {
    return { status: false, msg: 'Invalid password', data: {} };
   }
  } else {
   return { status: false, msg: 'Invalid loginname', data: {} };
  }
 } catch (error) {
  console.error('Database error:', error);
  throw error;
 }
};
