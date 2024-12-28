const { getDb } = require('../../db-conn/db-conn');
const { add } = require('../assign_restaurant_users/assign_restaurant_users');
const { ObjectId } = require('mongoose').Types;

exports.create = async (reqParams, file) => {
 try {
  const restaurant_name = reqParams['restaurant_name'];
  const description = reqParams['description'];
  const res_logo = file['buffer'];
  const restaurantExists = await checkRestaurant(restaurant_name);
  if (restaurantExists) {
   return { status: false, msg: 'Restaurant name already exists' };
  }
  const insertRec = { 'restaurant_name': restaurant_name, 'res_logo': res_logo, 'description': description, 'created_date': new Date(), 'modified_date': '', 'status': 1 }
  const db = getDb();
  const collection = db.collection(TBL_RESTAURANTS);
  const result = await collection.insertOne(insertRec)
  const res_id = result['insertedId'].toString()
  const user_id = reqParams['user_id'] || ''
  const role_id = reqParams['role_id'] || 0
  if (role_id == 2) {
   const params = { res_id, user_id, role_id }
   const result = await add(params);
  }
  return { status: true, msg: 'Restaurant Created Successfull', insertedId: result['insertedId'] }
 } catch (error) {
  throw error
 }
}
exports.get = async (reqParams) => {
 try {
  const res_id = reqParams['res_id'];
  const db = getDb();
  const collection = db.collection(TBL_RESTAURANTS);

  // Convert res_id to ObjectId
  const result = await collection.find({ '_id': new ObjectId(res_id) }).sort({ restaurant_name: 1 }).toArray();

  if (result.length > 0) {
   result.forEach((obj) => {
    const imageData = obj['res_logo'];

    // Check if imageData is a Buffer before converting to base64
    if (imageData) {
     const base64Image = imageData.toString('base64');
     obj['res_logo'] = `data:image/png;base64,${base64Image}`;
    } else {
     obj['res_logo'] = null; // or set to a placeholder image if desired
    }

    obj['res_id'] = obj['_id'];
   });
  } else {
   return { status: false, msg: "Restaurant not found" };
  }

  return { status: true, data: result[0] };
 } catch (error) {
  console.error('Error fetching restaurant data:', error); // Log the error for debugging
  return { status: false, msg: "Internal server error", error: error.message }; // Return structured error response
 }
};
exports.details = async (reqParams) => {
 try {
  const db = getDb();
  const collection = db.collection(TBL_RESTAURANTS);
  const result = await collection.find().sort({ restaurant_name: 1 }).toArray();
  if (result.length > 0) {
   result.forEach((obj) => {
    const imageData = obj['res_logo'];
    if (imageData) {
     const base64Image = imageData.toString('base64');
     obj['res_logo'] = `data:image/png;base64,${base64Image}`;
    } else {
     obj['res_logo'] = null;
    }
    obj['res_id'] = obj['_id']
   });
  }
  return { status: true, data: result }
 } catch (error) {
  console.log(error);

  throw error
 }
}
async function checkRestaurant(restaurant_name) {
 const db = getDb();
 const collection = db.collection(TBL_RESTAURANTS);
 const record = await collection.findOne({ restaurant_name });
 return record !== null;
}