const { getDb } = require("../../db-conn/db-conn");
const { sendPushNotification } = require("../../utils/notification-conn");
const { ObjectId } = require('mongoose').Types;

exports.saveDeviceToken = async (reqParams) => {
 try {
  const db = getDb();
  const collection = db.collection(TBL_DEVICE_TOKEN);
  let insertRec = {
   id: reqParams['id'] || '',
   device_token: reqParams['device_token'] || '',
   created_date: new Date(),
   status: 1
  }
  const result = await collection.insertOne(insertRec);
  return result;
 } catch (error) {

 }
};

exports.update = async (reqParams) => {
 try {
  const notification_id = reqParams['device_token'] || 0;
  const status = reqParams['status'] || 0;

  const updateRec = { modified_date: new Date(), status: status };
  const whr = { _id: new ObjectId(notification_id) };

  const db = getDb()
  const collection = db.collection(TBL_DEVICE_TOKEN)
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
  const collection = db.collection(TBL_DEVICE_TOKEN)
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
  const collection = db.collection(TBL_DEVICE_TOKEN)
  const result = await collection.findOne(whr);
  return { status: true, data: result };
 } catch (error) {
  throw error;
 }
};
exports.getDeviceTokens = async (reqParams) => {
 try {
  let pipeline = []
  const matchConditions = {}
  if ("device_token_id" in reqParams) {
   matchConditions._id = new ObjectId(reqParams['device_token_id'])
  }
  if ('id' in reqParams) {
   matchConditions.sender_id = reqParams['id']
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
    device_token_id: '$_id',
    id: '$id',
    device_token: '$device_token',
    created_date: '$created_date',
    display_created_date: { $dateToString: { date: { $toDate: "$created_date" }, format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    modified_date: '$modified_date',
    display_modified_date: { $dateToString: { date: { $toDate: "$modified_date" }, format: "%d %b %Y %H:%M", timezone: TIMEZONE } },
    status: '$status'
   }
  })

  pipeline.push({
   $sort: { created_date: -1 }
  })
  const db = getDb()
  const collection = db.collection(TBL_DEVICE_TOKEN)
  let result = await collection.aggregate(pipeline).toArray();
  return { status: true, data: result };
 } catch (error) {
  return { status: false, msg: 'Internal server error', error };
 }
};