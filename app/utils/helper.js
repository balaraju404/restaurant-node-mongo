const { getDb } = require("../../db-conn/db-conn");

exports.getDeviceToken = async (reqParams) => {
 try {

 } catch (error) {

 }
}
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
}