const routes = require("express").Router();
const restaurantController = require('../../controller/restaurant/restaurant')
const { check, validationResult } = require('express-validator')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

routes.post('/create', [
 check('restaurant_name').not().isEmpty().withMessage('Restaurant Name is required'),
 check('restaurant_name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
 check('restaurant_name').isLength({ max: 20 }).withMessage('Name must be at most 20 characters'),
], upload.single('res_logo'), async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await restaurantController.create(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.put('/update', [
], upload.single('res_logo'), async (req, res, next) => {
 try {
  await restaurantController.update(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/getAll', async (req, res, next) => {
 try {
  await restaurantController.details(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/:res_id', async (req, res, next) => {
 try {
  await restaurantController.get(req, res, next);
 } catch (error) {
  console.error(error);
 }
})

module.exports = routes