const dashboard = require('../../model/dashboard')
exports.details = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await dashboard.details(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.userCartCount = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await dashboard.userCartCount(reqParams);
  if (result['status']) {
   res.status(200).json({ status: result['status'], count: result['count'] || 0 })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.resActiveCount = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await dashboard.resActiveCount(reqParams);
  if (result['status']) {
   res.status(200).json({ status: result['status'], count: result['count'] || 0 })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}
exports.resOrdersCount = async (req, res, next) => {
 try {
  const reqParams = req['body'] || {}
  const result = await dashboard.resOrdersCount(reqParams);
  if (result['status']) {
   res.status(200).json({ status: result['status'], data: result['data'] || {} })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}