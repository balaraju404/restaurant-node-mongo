const routes = require("express").Router();
const dashboard = require('../../controller/dashboard')
const { check, validationResult } = require('express-validator')

routes.post('/details', async (req, res, next) => {
 try {
  await dashboard.details(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/userCartCount', [
 check('user_id').isMongoId().withMessage('Invalid User ID'),
], async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await dashboard.userCartCount(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/resActiveCount', [
 check('res_id').isMongoId().withMessage('Invalid User ID'),
], async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await dashboard.resActiveCount(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/resOrdersCount', [
 check('res_id').isMongoId().withMessage('Invalid Restaurant ID'),
], async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await dashboard.resOrdersCount(req, res, next);
 } catch (error) {
  console.error(error);
 }
})

module.exports = routes