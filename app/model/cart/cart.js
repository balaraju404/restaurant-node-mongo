const { getDb } = require("../../db-conn/db-conn");
const { ObjectId } = require('mongoose').Types;

exports.add = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || 0;
  const res_id = reqParams['res_id'] || 0;
  const cat_id = reqParams['cat_id'] || 0;
  const product_id = reqParams['product_id'] || 0;
  const product_qty = reqParams['product_qty'] || 0;
  const status = reqParams['status'] || 0;

  const record = await checkRecord(reqParams);

  if (record.length > 0) {
   reqParams['cart_id'] = record[0]['_id'].toString();
   await this.update(reqParams);
   return { status: true, msg: 'Cart Updated Successfully' };
  }

  const insertRec = { user_id, res_id, cat_id, product_id, product_qty, status };

  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  const result = await collection.insertOne(insertRec);
  const productId = result['insertedId'];
  return { status: true, msg: 'Cart Added Successfully', insertedId: productId };
 } catch (error) {
  throw error;
 }
};

exports.update = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || 0;
  const res_id = reqParams['res_id'] || 0;
  const cat_id = reqParams['cat_id'] || 0;
  const product_id = reqParams['product_id'] || 0;
  const product_qty = reqParams['product_qty'] || 0;
  const status = reqParams['status'] || 0;

  const cart_id = reqParams['cart_id'];
  if (!cart_id) {
   return { status: false, msg: 'Cart ID is required.' };
  }

  const updateRec = { user_id, res_id, cat_id, product_id, product_qty, status };
  const whr = { '_id': new ObjectId(cart_id) };

  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  // Perform the update operation
  const result = await collection.updateOne(whr, { $set: updateRec });

  if (result.matchedCount === 0) {
   return { status: false, msg: 'No record found to update.' };
  }
  return { status: true, msg: 'Cart Updated Successfully' };
 } catch (error) {
  throw error;
 }
};
exports.del = async (reqParams) => {
 try {
  const whr = { _id: new ObjectId(reqParams['cart_id']) };
  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  await collection.deleteOne(whr);
  return { status: true, msg: 'Cart Deleted Successfully' };
 } catch (error) {
  throw error;
 }
};

async function checkRecord(reqParams) {
 const user_id = reqParams['user_id'] || 0;
 const res_id = reqParams['res_id'] || 0;
 const cat_id = reqParams['cat_id'] || 0;
 const product_id = reqParams['product_id'] || 0;

 const db = getDb()
 const collection = db.collection(TBL_USER_CART);
 const result = await collection.find({ user_id, res_id, cat_id, product_id }).toArray()
 return result;
}

exports.details = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || '';
  const res_id = reqParams['res_id'] || '';
  const cat_id = reqParams['cat_id'] || '';
  const status = reqParams['status'] || 0;

  let pipeline = [];

  const matchConditions = {};
  if (user_id.length > 0) matchConditions['user_id'] = user_id;
  if (res_id.length > 0) matchConditions['res_id'] = res_id;
  if (cat_id.length > 0) matchConditions['cat_id'] = cat_id;
  if (status > 0) matchConditions['status'] = status;

  if (Object.keys(matchConditions).length > 0) {
   pipeline.push({ $match: matchConditions })
  }

  pipeline.push({
   $addFields: {
    product_id: { $toObjectId: "$product_id" },
    res_id: { $toObjectId: "$res_id" },
    cat_id: { $toObjectId: "$cat_id" },
   }
  })

  // joins - lookup
  pipeline.push({
   $lookup: {
    from: TBL_RESTAURANT_PRODUCTS,
    localField: 'product_id',
    foreignField: '_id',
    as: 'products_info'
   }
  })
  pipeline.push({
   $lookup: {
    from: TBL_RESTAURANTS,
    localField: 'res_id',
    foreignField: '_id',
    as: 'restaurant_info'
   }
  })
  pipeline.push({
   $lookup: {
    from: TBL_CATEGORIES,
    localField: 'cat_id',
    foreignField: '_id',
    as: 'category_info'
   }
  })

  pipeline.push({ $unwind: { path: '$products_info', preserveNullAndEmptyArrays: true } })
  pipeline.push({ $unwind: { path: '$restaurant_info', preserveNullAndEmptyArrays: true } })
  pipeline.push({ $unwind: { path: '$category_info', preserveNullAndEmptyArrays: true } })

  pipeline.push({
   $project: {
    cart_id: '$_id',
    user_id: '$user_id',
    res_id: '$res_id',
    cat_id: '$cat_id',
    product_id: '$product_id',
    product_qty: '$product_qty',
    status: '$status',
    product_name: '$products_info.product_name',
    product_img: '$products_info.product_img',
    price: '$products_info.price',
    restaurant_name: '$restaurant_info.restaurant_name',
    cat_name: '$category_info.cat_name',
   }
  })

  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  const result = await collection.aggregate(pipeline).toArray();
  if (result.length > 0) {
   result.forEach((obj) => {
    // if (Buffer.isBuffer(obj['product_img'])) {
    const base64Image = obj['product_img'].toString('base64');
    obj['product_img'] = `data:image/png;base64,${base64Image}`;
    // }
   });
  }
  return { status: true, data: result };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
exports.userCartCount = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || '';
  const status = reqParams['status'] || 0;

  const matchConditions = {};
  if (user_id.length > 0) matchConditions['user_id'] = user_id;
  if (status > 0) matchConditions['status'] = status;

  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  const count = await collection.countDocuments(matchConditions);
  return { status: true, count: count };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
