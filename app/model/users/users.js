const { getDb } = require('../../db-conn/db-conn');
const { ObjectId } = require('mongodb');

exports.create = async (reqParams) => {
 try {
  const login_name = reqParams['login_name'];
  const user_name = reqParams['user_name'];
  const password = reqParams['password'];
  const role_id = reqParams['role_id'];
  const userExists = await checkUser(login_name);
  if (userExists) {
   return { status: false, msg: 'User already exists' };
  }
  const insertRec = { 'fname': '', 'lname': '', 'user_name': user_name, 'login_name': login_name, 'password': password, 'role_id': role_id, 'email': '', 'mobile': '', 'created_by': 'system', 'created_date': new Date(), 'modified_date': '', 'status': 1 }
  const db = getDb();
  const collection = db.collection(TBL_USERS)
  const result = await collection.insertOne(insertRec)
  return { status: true, msg: 'User Created Successfull', insertedId: result['insertedId'] }
 } catch (error) {
  throw error
 }
}
exports.update = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || ''
  const fname = reqParams['fname'] || ''
  const lname = reqParams['lname'] || ''
  const email = reqParams['email'] || ''
  const mobile = reqParams['mobile'] || ''
  const updateRec = { 'fname': fname, 'lname': lname, 'email': email, 'mobile': mobile, 'modified_date': new Date(), 'status': 1 }
  const db = getDb();
  const collection = db.collection(TBL_USERS)
  const result = await collection.updateOne({ _id: new ObjectId(user_id) }, { $set: updateRec });
  return { status: true, msg: 'User Updated Successfull' }
 } catch (error) {
  throw error
 }
}

exports.userProfile = async (reqParams, file) => {
 try {
  const user_id = reqParams['user_id'];
  if (!user_id) {
   return { status: false, msg: 'User ID is required.' };
  }

  const user_profile = file ? file['buffer'] : null;
  if (!user_profile) {
   return { status: false, msg: 'Profile image is required.' };
  }

  const db = getDb();
  const collection = db.collection(TBL_USERS);

  const updateRec = { 'user_profile': user_profile, 'modified_date': new Date() };
  const result = await collection.updateOne({ _id: new ObjectId(user_id) }, { $set: updateRec });
  if (result.modifiedCount === 0) {
   return { status: false, msg: 'No changes made to the profile.' };
  }
  return { status: true, msg: 'Profile Updated' };

 } catch (error) {
  console.error('Error in userProfile function:', error);
  throw new Error('An error occurred while updating the user profile.');
 }
};
exports.deleteUserProfile = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'];
  if (!user_id) {
   return { status: false, msg: 'User ID is required.' };
  }

  const db = getDb();
  const collection = db.collection(TBL_USERS);

  const updateRec = { 'user_profile': null, 'modified_date': new Date() };
  const result = await collection.updateOne({ _id: new ObjectId(user_id) }, { $set: updateRec });
  if (result.modifiedCount === 0) {
   return { status: false, msg: 'No changes made to the profile.' };
  }
  return { status: true, msg: 'Profile Deleted' };

 } catch (error) {
  console.error('Error in userProfile function:', error);
  throw new Error('An error occurred while updating the user profile.');
 }
};

exports.details = async (reqParams) => {
 try {
  const login_name = reqParams['login_name'] || '';
  const user_name = reqParams['user_name'] || '';
  const role_id = reqParams['role_id'] || 0;

  const query = {};
  if (login_name.length > 0) {
   query.login_name = login_name;
  }
  if (user_name.length > 0) {
   query.user_name = user_name;
  }
  if (role_id > 0) {
   query.role_id = role_id;
  }

  const db = getDb();
  const collection = db.collection(TBL_USERS);
  const result = await collection.find(query).sort({ login_name: 1 }).toArray();
  result.forEach(e => {
   if (e['user_profile']) {
    const base64Image = e['user_profile'].toString('base64');
    e['user_profile'] = `data:image/png;base64,${base64Image}`;
   }
   e['user_id'] = e['_id']
  });
  return { status: true, data: result };
 } catch (error) {
  throw error;
 }
};

async function checkUser(login_name) {
 const db = getDb();
 const collection = db.collection(TBL_USERS);
 const user = await collection.findOne({ login_name });
 return user !== null;
}