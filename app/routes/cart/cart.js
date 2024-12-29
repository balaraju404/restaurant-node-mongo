const routes = require("express").Router();
const cartController = require('../../controller/cart/cart')
const { check, validationResult } = require('express-validator')

routes.post('/add', async (req, res, next) => {
 try {
  await cartController.add(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.put('/update', async (req, res, next) => {
 try {
  await cartController.update(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.delete('/delete/:cart_id', async (req, res, next) => {
 try {
  await cartController.del(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/details', async (req, res, next) => {
 try {
  await cartController.details(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/userCartCount', [
 check('user_id').isMongoId().withMessage('Invalid User ID'),
], async (req, res, next) => {
 try {
  await cartController.userCartCount(req, res, next);
 } catch (error) {
  console.error(error);
 }
})

module.exports = routes