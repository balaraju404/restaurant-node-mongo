const restaurantModel = require('../../model/restaurant/restaurant')
const mongoose = require('mongoose');

exports.create = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const file = req['file'] || {}
  const result = await restaurantModel.create(reqParams, file);
  if (result) {
   res.status(200).json({ status: result['status'], msg: result['msg'], insertedId: result['insertedId'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.update = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  if (!reqParams.res_id || !mongoose.Types.ObjectId.isValid(reqParams.res_id)) {
   return res.status(400).json({ status: false, msg: 'Invalid restaurant ID' });
  }
  const file = req['file'] || {}
  const result = await restaurantModel.update(reqParams, file);
  res.status(200).json({ status: result['status'], msg: result['msg'] })
 } catch (error) {
    console.log(error);
    
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.get = async (req, res, next) => {
 try {
  const reqParams = req['params'] || {}
  const result = await restaurantModel.get(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] || {} })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.details = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await restaurantModel.details(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}