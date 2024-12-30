const { getDb } = require("../../db-conn/db-conn");
const { details } = require("../res_categories/res_categories");

exports.add = async (reqParams, image) => {
 try {
  const cat_name = reqParams['cat_name'] || '';
  const description = reqParams['description'] || '';
  const cat_img = image['buffer'] || '';
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
  const collection = db.collection(TBL_CATEGORIES);

  const whr = {};
  if (reqParams['search_text']) {
   whr['cat_name'] = { $regex: reqParams['search_text'], $options: 'i' };
  }

  let result = await collection.find(whr).toArray();
  if (result.length > 0) {
   let catIds = [];

   if (reqParams['res_id']) {
    const res = await details(reqParams);
    if (res.status) {
     catIds = res.data.map(item => item.cat_id.toString());
     result = result.filter(item => !catIds.includes(item._id.toString()));
    } else {
     return { status: false, msg: res.msg || 'Failed to fetch restaurant categories.' };
    }
   }

   result = result.map(obj => ({
    cat_id: obj._id,
    cat_name: obj.cat_name,
    description: obj.description,
    cat_img: obj.cat_img ? `data:image/png;base64,${obj.cat_img.toString('base64')}` : null
   }));
  }

  return { status: true, data: result };
 } catch (error) {
  console.error('Error in details:', error);
  throw error;
 }
};

async function checkRecord(cat_name) {
 const db = getDb();
 const collection = db.collection(TBL_CATEGORIES)
 const record = await collection.findOne({ cat_name })
 return record !== null;
}