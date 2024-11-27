const { getDb } = require("../../db-conn/db-conn");

exports.add = async (reqParams, image) => {
 try {
  const cat_name = reqParams['cat_name'] || '';
  const description = reqParams['description'] || '';
  const cat_img = image['buffer'];
  const recordExists = await checkRecord(cat_name);
  if (recordExists) {
   return { status: false, msg: 'Category name already exists' };
  }
  const insertRec = { 'cat_name': cat_name, 'cat_img': cat_img, 'description': description, 'created_by': '', 'created_date': new Date(), 'modified_date': '', 'status': 1 }
  const db = getDb();
  const collection = db.collection(TBL_CATEGORIES)
  const result = await collection.insertOne(insertRec)
  return { status: true, msg: 'Category Created Successful', insertedId: result['insertedId'] }
 } catch (error) {
  throw error
 }
}
exports.details = async (reqParams) => {
 try {
  const db = getDb();
  const collection = db.collection(TBL_CATEGORIES)
  const result = await collection.find().toArray()
  if (result.length > 0) {
   result.forEach((obj) => {
    const imageData = obj['cat_img'];
    const base64Image = imageData.toString('base64');
    obj['cat_img'] = `data:image/png;base64,${base64Image}`;
    obj['cat_id'] = obj['_id']
   });
  }
  return { status: true, data: result }
 } catch (error) {
  throw error
 }
}
async function checkRecord(cat_name) {
 const db = getDb();
 const collection = db.collection(TBL_CATEGORIES)
 const record = await collection.findOne({ cat_name })
 return record !== null;
}