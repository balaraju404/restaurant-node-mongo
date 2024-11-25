const { getDb } = require('../../db-conn/db-conn');

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
