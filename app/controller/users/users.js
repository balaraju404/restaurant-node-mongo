const userModel = require('../../model/users/users')
exports.create = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await userModel.create(reqParams);
  if (result['insertedId']) {
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
  const result = await userModel.update(reqParams);
  if (result['insertedId']) {
   res.status(200).json({ status: result['status'], msg: result['msg'], insertedId: result['insertedId'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.userProfile = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const file = req['file'] || {}
  const result = await userModel.userProfile(reqParams, file);
  if (result['insertedId']) {
   res.status(200).json({ status: result['status'], msg: result['msg'], insertedId: result['insertedId'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.deleteUserProfile = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await userModel.deleteUserProfile(reqParams);
  if (result['insertedId']) {
   res.status(200).json({ status: result['status'], msg: result['msg'], insertedId: result['insertedId'] })
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
  const result = await userModel.details(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}