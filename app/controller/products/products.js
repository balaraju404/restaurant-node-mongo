const productsModel = require('../../model/products/products')
exports.add = async (req, res, next) => {
 try {

  const reqParams = req['body'] || {}
  const images = req['files'] || {}
  const result = await productsModel.add(reqParams, images);
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
  const result = await productsModel.details(reqParams);
  if (result['data']) {
   res.status(200).json({ status: result['status'], data: result['data'] })
  } else {
   res.status(200).json({ status: result['status'], msg: result['msg'] })
  }
 } catch (error) {
  res.status(500).json({ status: false, msg: 'Internal server error', error: error })
 }
}