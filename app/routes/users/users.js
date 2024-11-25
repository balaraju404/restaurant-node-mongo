const routes = require("express").Router();
const userController = require('../../controller/users/users')
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

routes.post('/create', async (req, res, next) => {
 try {
  await userController.create(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.put('/update', async (req, res, next) => {
 try {
  await userController.update(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/user_profile', upload.single('user_profile'), async (req, res, next) => {
 try {
  await userController.userProfile(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/delete_user_profile', async (req, res, next) => {
 try {
  await userController.deleteUserProfile(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/getUsers', async (req, res, next) => {
 try {
  await userController.details(req, res, next);
 } catch (error) {
  console.error(error);
 }
})

module.exports = routes