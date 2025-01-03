const { getDb } = require("../../db-conn/db-conn");
const { ObjectId } = require('mongoose').Types;
const { send } = require("../notifications/index");

exports.add = async (reqParams) => {
 try {
  const user_id = reqParams['user_id'] || 0;
  const res_id = reqParams['res_id'] || 0;
  const total_price = reqParams['total_price'] || 0;
  const products_data = reqParams['products_data'] || [];
  const status = reqParams['status'] || 0;

  const insertRec = { 'user_id': user_id, 'res_id': res_id, 'total_price': total_price, 'transaction_date': new Date(), 'status': status };

  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)
  const result = await collection.insertOne(insertRec);
  const trans_id = result['insertedId'].toString();

  await addSubTransactions(trans_id, products_data);
  const params = { 'sender_id': user_id, 'receiver_id': res_id, 'title': 'Receiverd Order', 'message': `Order received successfully. Order ID: ${trans_id}`, 'ref_id': trans_id };
  await send(params)
  return { status: true, msg: 'Order Placed', insertedId: trans_id };
 } catch (error) {
  throw error;
 }
};

async function addSubTransactions(trans_id, products_data) {
 try {
  const db = getDb()
  const collection = db.collection(TBL_SUB_TRANSACTIONS)
  // Use Promise.all to handle all asynchronous operations
  await Promise.all(products_data.map(async (item) => {
   const insertRec = { 'trans_id': trans_id, 'product_id': item['product_id'], 'product_qty': item['product_qty'] };
   await collection.insertOne(insertRec);
   await deleteUserCartData(item['cart_id'])
  }));
 } catch (error) {
  throw error;
 }
}
async function deleteUserCartData(cart_id) {
 try {
  const db = getDb()
  const collection = db.collection(TBL_USER_CART)
  const whr = { _id: new ObjectId(cart_id) };
  await collection.deleteOne(whr);
  return { status: true, msg: 'Record Deleted Successfully' };
 } catch (error) {
  throw error;
 }
};

exports.update = async (reqParams) => {
 try {
  const trans_id = reqParams['trans_id'] || '';
  const res_id = reqParams['res_id'] || '';
  const user_id = reqParams['user_id'] || '';
  const status = reqParams['status'] || 0;

  const updateRec = { modified_date: new Date(), status: status };
  if (status == 2) {
   updateRec['accepted_date'] = new Date();
  } else if (status == 3) {
   updateRec['rejected_date'] = new Date();
  } else if (status == 4) {
   updateRec['cancelled_date'] = new Date();
  } else if (status == 5) {
   updateRec['shipped_date'] = new Date();
  } else if (status == 7) {
   updateRec['delivered_date'] = new Date();
  } else if (status == 8) {
   updateRec['refunded_date'] = new Date();
  }
  const whr = { _id: new ObjectId(trans_id) };

  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)
  await collection.updateOne(whr, { $set: updateRec });

  let msg = 'Record Updated Successfully';
  let title = '';
  let notificationMessage = '';

  if (status == 2) {
   msg = 'Order Accepted Successfully';
   title = 'Order Accepted';
   notificationMessage = 'Your order has been accepted and is being processed.';
  } else if (status == 3) {
   msg = 'Order Rejected Successfully';
   title = 'Order Rejected';
   notificationMessage = 'Unfortunately, your order has been rejected.';
  } else if (status == 4) {
   msg = 'Order Cancelled Successfully';
   title = 'Order Cancelled';
   notificationMessage = 'Your order has been cancelled.';
  } else if (status == 5) {
   msg = 'Order Packed Successfully';
   title = 'Order Packed';
   notificationMessage = 'Your order is packed and ready for shipping.';
  } else if (status == 6) {
   msg = 'Out of Delivered Successfully';
   title = 'Out of Delivered';
   notificationMessage = 'Your order has left for delivery.';
  } else if (status == 7) {
   msg = 'Order Delivered Successfully';
   title = 'Order Delivered';
   notificationMessage = 'Your order has been delivered successfully.';
  } else if (status == 8) {
   msg = 'Order Refund Successfully';
   title = 'Order Refund';
   notificationMessage = 'Your order has been refunded successfully.';
  }
  let params = { 'sender_id': res_id, 'receiver_id': user_id, 'title': title, 'message': `${notificationMessage}. Order ID: ${trans_id}`, 'ref_id': trans_id };
  if (status === 4) {
   params = { 'sender_id': user_id, 'receiver_id': res_id, 'title': title, 'message': `${notificationMessage}. Order ID: ${trans_id}`, 'ref_id': trans_id }
  }
  await send(params)
  return { status: true, msg: msg };
 } catch (error) {
  throw error;
 }
};
exports.del = async (reqParams) => {
 try {
  await deleteSubTrans(reqParams['trans_id'])
  const whr = { _id: new ObjectId(reqParams['trans_id']) || 0 };
  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)
  await collection.deleteOne(whr);
  return { status: true, msg: 'Record Deleted Successfully' };
 } catch (error) {
  throw error;
 }
};
async function deleteSubTrans(trans_id) {
 try {
  const db = getDb()
  const collection = db.collection(TBL_SUB_TRANSACTIONS)
  const whr = { trans_id: trans_id || 0 };
  await collection.deleteMany(whr);
  return { status: true, msg: 'Sub-transactions Deleted Successfully' };
 } catch (error) {
  throw error;
 }
}

exports.details = async (reqParams) => {
 try {
  const trans_id = reqParams['trans_id'] || 0;
  const res_id = reqParams['res_id'] || '';
  const user_id = reqParams['user_id'] || '';
  const status = reqParams['status'] || [];

  let limit_count = reqParams['page_limit'] || 0;
  let offset_count = 0;
  if (limit_count > 0) {
   offset_count = reqParams['page_num'] * limit_count;
  }

  let pipeline = []
  const matchConditions = {}
  if (trans_id.length > 1) { matchConditions._id = new ObjectId(trans_id) }
  if (user_id.length > 0) matchConditions['user_id'] = user_id
  if (res_id.length > 0) matchConditions['res_id'] = res_id
  if (!Array.isArray(status)) {
   status = [status]
  }
  if (status.length > 0) matchConditions['status'] = { $in: status }

  if (Object.keys(matchConditions).length > 0) {
   pipeline.push({
    $match: matchConditions
   })
  }
  pipeline.push({
   $addFields: {
    'user_id': { $toObjectId: '$user_id' },
    'res_id': { $toObjectId: '$res_id' }
   }
  })

  //lookup
  pipeline.push({
   $lookup: {
    from: TBL_USERS,
    localField: 'user_id',
    foreignField: '_id',
    as: 'user_info'
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
  pipeline.push({ $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } })
  pipeline.push({ $unwind: { path: '$restaurant_info', preserveNullAndEmptyArrays: true } })

  pipeline.push({
    $addFields:{
     name:{$concat:['$user_info.fname',' ','$user_info.lname']}
    }
  },
   {
   $project: {
    trans_id: '$_id',
    user_id: '$user_id',
    res_id: '$res_id',
    total_price: '$total_price',
    transaction_date: '$transaction_date',
    display_order_date: { $dateToString: { date: { $toDate: "$transaction_date" }, format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    accepted_date: { $dateToString: { date: '$accepted_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    rejected_date: { $dateToString: { date: '$rejected_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    cancelled_date: { $dateToString: { date: '$cancelled_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    shipped_date: { $dateToString: { date: '$shipped_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    delivered_date: { $dateToString: { date: '$delivered_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    refunded_date: { $dateToString: { date: '$refunded_date', format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    modified_date: '$modified_date',
    status: '$status',
     user_name: {
      $cond: [
       { $eq: [{ $strLenCP: "$name" }, 1] }, // Check if the length of 'name' is 1
          "$user_info.user_name",              // If true, use 'user_info.user_name'
          "$name"                              // Otherwise, use 'name'
      ]},
   // user_name: '$user_info.user_name',
    email: '$user_info.email',
    restaurant_name: '$restaurant_info.restaurant_name',
   }
  })

  pipeline.push({
   $sort: { transaction_date: -1 }
  })
  const db = getDb()
  const collection = db.collection(TBL_ORDER_TRANSACTIONS)
  let result;
  if (limit_count > 0) {
   result = await collection.aggregate(pipeline).skip(offset_count).limit(limit_count).toArray()
  } else {
   result = await collection.aggregate(pipeline).toArray();
  }
  const count = await collection.countDocuments(matchConditions)
  let transArray = [];
  result.forEach((item) => {
   item['products_data'] = []
   transArray.push(item['trans_id']);
  })

  let pipeline2 = []
  if (transArray.length > 0) {
   pipeline.push({
    $match: { trans_id: { $in: transArray } }
   })
  }
  pipeline2.push({
   $addFields: {
    'product_id': { $toObjectId: '$product_id' }
   }
  })

  //lookup
  pipeline2.push({
   $lookup: {
    from: TBL_RESTAURANT_PRODUCTS,
    localField: 'product_id',
    foreignField: '_id',
    as: 'product_info'
   }
  })
  pipeline2.push({ $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } })

  pipeline2.push({
   $project: {
    sub_trans_id: '$_id',
    trans_id: '$trans_id',
    product_id: '$product_id',
    product_qty: '$product_qty',
    product_name: '$product_info.product_name',
    product_img: '$product_info.product_img',
    price: '$product_info.price',
    description: '$product_info.description'
   }
  })

  const collection2 = db.collection(TBL_SUB_TRANSACTIONS)
  const productsData = await collection2.aggregate(pipeline2).toArray();

  if (productsData.length > 0) {
   productsData.forEach((obj) => {
    if (obj['product_img']) {
     const base64Image = obj['product_img'].toString('base64');
     obj['product_img'] = `data:image/png;base64,${base64Image}`;
    }
    const index = result.findIndex(ele => ele['trans_id'] == obj['trans_id'])
    if (index != -1) {
     result[index]['products_data'].push(obj);
    }
   });
  }
  return { status: true, data: result, count: count };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
