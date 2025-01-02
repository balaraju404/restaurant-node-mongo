const routes = require("express").Router();
const deviceToken = require('../../controller/device_token')
const { check, validationResult } = require('express-validator')

routes.post('/save', [
 check('id').not().isEmpty().withMessage('Id is required'),
 check('device_token').not().isEmpty().withMessage('Device Token is required')
], async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await deviceToken.saveDeviceToken(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.put('/update', [
 check('device_token_id').not().isEmpty().withMessage('Device Token Id is required'),
],
 async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
  }
  try {
   await deviceToken.update(req, res, next);
  } catch (error) {
   console.error(error);
  }
 })
routes.delete('/:device_token_id', async (req, res, next) => {
 try {
  await deviceToken.del(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.get('/:device_token_id', async (req, res, next) => {
 try {
  await deviceToken.getRec(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/details', async (req, res, next) => {
 try {
  await deviceToken.getDeviceTokens(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
module.exports = routes