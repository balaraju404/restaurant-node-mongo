const { getDb } = require("../../db-conn/db-conn");
const { ObjectId } = require('mongoose').Types;

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
exports.resActiveCount = async (reqParams) => {
 try {
  const res_id = reqParams['res_id'] || '';
  const status = reqParams['status'] || 1;

  const matchConditions = {};
  if (res_id.length > 0) matchConditions['res_id'] = res_id;
  if (status > 0) matchConditions['status'] = status;

  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)
  const count = await collection.countDocuments(matchConditions);
  return { status: true, count: count };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
exports.resOrdersCount = async (reqParams) => {
 try {
  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)

  const res_id = reqParams['res_id'] || '';
  const matchConditions = {};
  matchConditions['res_id'] = res_id;
  const received_count = await collection.countDocuments(matchConditions);

  matchConditions['status'] = { $in: [1, 2, 5, 6] };
  const active_count = await collection.countDocuments(matchConditions);

  matchConditions['status'] = { $in: [7] };
  const deliverd_count = await collection.countDocuments(matchConditions);


  matchConditions['status'] = { $in: [3] };
  const rejected_count = await collection.countDocuments(matchConditions);

  return { status: true, data: { active_count: active_count || 0, deliverd_count: deliverd_count || 0, rejected_count: rejected_count || 0, received_count: received_count || 0 } };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
