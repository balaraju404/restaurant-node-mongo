const notifications = require('../../model/notifications')
exports.send = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await notifications.send(reqParams);
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
  const result = await notifications.update(reqParams);
  res.status(200).json({ status: result['status'], msg: result['msg'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.del = async (req, res, next) => {
 try {
  const reqParams = req['params'] || {}
  const result = await notifications.del(reqParams);
  res.status(200).json({ status: result['status'], msg: result['msg'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.getRec = async (req, res, next) => {
 try {
  const reqParams = req['params'] || {}
  const result = await notifications.getRec(reqParams);
  res.status(200).json({ status: result['status'], data: result['data'] });
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.details = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await notifications.details(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'], count: result['count'] || 0 })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.count = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await notifications.count(reqParams);
  if (result['status']) {
   res.status(200).json({ status: result['status'], count: result['count'] || 0 })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}