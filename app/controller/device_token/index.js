const deviceToken = require('../../model/device_token')
exports.saveDeviceToken = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await deviceToken.saveDeviceToken(reqParams);
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
  const result = await deviceToken.update(reqParams);
  res.status(200).json({ status: result['status'], msg: result['msg'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.del = async (req, res, next) => {
 try {
  const reqParams = req['params'] || {}
  const result = await deviceToken.del(reqParams);
  res.status(200).json({ status: result['status'], msg: result['msg'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.getRec = async (req, res, next) => {
 try {
  const reqParams = req['params'] || {}
  const result = await deviceToken.getRec(reqParams);
  res.status(200).json({ status: result['status'], data: result['data'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.getDeviceTokens = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await deviceToken.getDeviceTokens(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}