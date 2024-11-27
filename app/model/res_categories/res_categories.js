const { ObjectId } = require('mongodb');
const { getDb } = require("../../db-conn/db-conn");

exports.add = async (reqParams) => {
 try {
  const res_id = reqParams['res_id'] || '';
  const cat_id = reqParams['cat_id'] || '';
  const recordExists = await checkRecord(res_id, cat_id);
  if (recordExists) {
   return { status: false, msg: 'Category already exists' };
  }
  const insertRec = { 'res_id': res_id, 'cat_id': cat_id, 'created_by': 'system', 'created_date': new Date(), 'modified_date': '', 'status': 1 }
  const db = getDb();
  const collection = db.collection(TBL_RESTAURANT_CATEGORIES)
  const result = await collection.insertOne(insertRec)
  return { status: true, msg: 'Category Created Successful', insertedId: result['insertedId'] }
 } catch (error) {
  throw error
 }
}
exports.details = async (reqParams) => {
 try {
  const res_id = reqParams['res_id'];

  // Validate restaurant ID
  if (!ObjectId.isValid(res_id)) {
   return { status: false, msg: 'Invalid restaurant id' };
  }

  const db = getDb();
  const collection = db.collection(TBL_RESTAURANT_CATEGORIES);

  // Construct the aggregation pipeline
  const pipeline = [
   {
    $match: { 'res_id': res_id }
   },
   {
    $addFields: {
     cat_id: { $toObjectId: "$cat_id" },
    }
   },
   {
    $lookup: {
     from: TBL_CATEGORIES,
     localField: 'cat_id',
     foreignField: "_id",
     as: 'cat_info'
    }
   },
   {
    $unwind: { path: '$cat_info', preserveNullAndEmptyArrays: true }
   },
   {
    $project: {
     cat_id: '$_id',
     user_id: '$user_id',
     res_id: '$res_id',
     cat_name: { $ifNull: ['$cat_info.cat_name', 'Not Found'] },
     cat_img: { $ifNull: ['$cat_info.cat_img', null] },
     description: { $ifNull: ['$cat_info.description', ''] }
    }
   }
  ];

  // Execute the aggregation pipeline
  const result = await collection.aggregate(pipeline).toArray();

  // Process the results to convert image data to base64
  if (result.length > 0) {
   result.forEach((obj) => {
    const imageData = obj['cat_img'];
    if (imageData) {
     const base64Image = imageData.toString('base64');
     obj['cat_img'] = `data:image/png;base64,${base64Image}`;
    }
   });
  }

  return { status: true, data: result };
 } catch (error) {
  // Better error handling can be done here
  console.error('Error fetching restaurant details:', error);
  return { status: false, msg: 'Internal server error' };
 }
}

async function checkRecord(res_id, cat_id) {
 try {
  const db = getDb();
  const collection = db.collection(TBL_RESTAURANT_CATEGORIES);
  const rec = await collection.findOne({ res_id, cat_id })
  return rec != null
 } catch (error) {
  throw error
 }
}