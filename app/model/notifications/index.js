const { getDb } = require("../../db-conn/db-conn");
const { sendPushNotification } = require("../../utils/notification-conn");
const { getDeviceTokens } = require("../device_token");
const { ObjectId } = require('mongoose').Types;

exports.send = async (reqParams) => {
 try {
  const sender_id = reqParams['sender_id'] || 0;
  const receiver_id = reqParams['receiver_id'] || 0;
  const title = reqParams['title'] || '';
  const message = reqParams['message'] || [];
  const link = reqParams['link'] || '';
  const ref_id = reqParams['ref_id'] || '';
  const status = 1;
  const insertRec = { 'sender_id': sender_id, 'receiver_id': receiver_id, 'title': title, 'message': message, 'link': link, 'ref_id': ref_id, 'sent_date': new Date(), 'status': status };

  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  const result = await collection.insertOne(insertRec);
  const params = { 'id': receiver_id, 'status': 1 }
  const res = await getDeviceTokens(params);
  console.log(res);
 
  if (res['status']) {
   const tokens = res['data'].map((m) => m['device_token'])
   await sendPushNotification(tokens);
  }
  const notification_id = result['insertedId'].toString();
  return { status: true, msg: 'Notification sent successfully', insertedId: notification_id };
 } catch (error) {
  throw error;
 }
};

exports.update = async (reqParams) => {
 try {
  const notification_id = reqParams['notification_id'] || 0;
  const status = reqParams['status'] || 0;

  const updateRec = { modified_date: new Date(), status: status };
  const whr = { _id: new ObjectId(notification_id) };

  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  await collection.updateOne(whr, { $set: updateRec });
  let msg = 'Record Updated Successfully'
  return { status: true, msg: msg, 'notification_id': notification_id };
 } catch (error) {
  throw error;
 }
};
exports.del = async (reqParams) => {
 try {
  const whr = { _id: new ObjectId(reqParams['notification_id']) || 0 };
  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  await collection.deleteOne(whr);
  return { status: true, msg: 'Record Deleted Successfully' };
 } catch (error) {
  throw error;
 }
};
exports.getRec = async (reqParams) => {
 try {
  const whr = { _id: new ObjectId(reqParams['notification_id']) || 0 };
  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  const result = await collection.findOne(whr);
  return { status: true, data: result };
 } catch (error) {
  throw error;
 }
};
exports.details = async (reqParams) => {
 try {
  let limit_count = reqParams['page_limit'] || 0;
  let offset_count = 0;
  if (limit_count > 0) {
   offset_count = reqParams['page_num'] * limit_count;
  }

  let pipeline = []
  const matchConditions = {}
  if ("notification_id" in reqParams) {
   matchConditions._id = new ObjectId(reqParams['notification_id'])
  }
  if ('sender_id' in reqParams) {
   matchConditions.sender_id = reqParams['sender_id']
  }
  if ('receiver_id' in reqParams) {
   matchConditions.receiver_id = reqParams['receiver_id']
  }
  if ("status" in reqParams) {
   matchConditions.status = reqParams['status']
  }

  if (Object.keys(matchConditions).length > 0) {
   pipeline.push({
    $match: matchConditions
   })
  }

  pipeline.push({
   $project: {
    _id: 0,
    notification_id: '$_id',
    sender_id: '$sender_id',
    receiver_id: '$receiver_id',
    title: '$title',
    message: '$message',
    sent_date: '$sent_date',
    display_sent_date: { $dateToString: { date: { $toDate: "$sent_date" }, format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    modified_date: '$modified_date',
    status: '$status'
   }
  })

  pipeline.push({
   $sort: { sent_date: -1 }
  })
  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  let result;
  if (limit_count > 0) {
   result = await collection.aggregate(pipeline).skip(offset_count).limit(limit_count).toArray()
  } else {
   result = await collection.aggregate(pipeline).toArray();
  }
  const count = await collection.countDocuments(matchConditions)

  return { status: true, data: result, count: count };
 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};
exports.count = async (reqParams) => {
 try {
  const matchConditions = {}
  if ('sender_id' in reqParams) {
   matchConditions.sender_id = reqParams['sender_id']
  }
  if ('receiver_id' in reqParams) {
   matchConditions.receiver_id = reqParams['receiver_id']
  }
  if ("status" in reqParams) {
   let status = reqParams['status'] || []
   if (!Array.isArray(status)) {
    status = [status]
   }
   matchConditions.status = { $in: status }
  }
  const db = getDb()
  const collection = db.collection(TBL_NOTIFICATIONS)
  const count = await collection.countDocuments(matchConditions)
  return { status: true, count: count || 0 };
 } catch (error) {
  console.log(error);

  return { status: false, msg: 'Internal server error', error };

 }
}