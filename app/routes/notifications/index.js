const routes = require("express").Router();
const notifications = require('../../controller/notifications')
const { check, validationResult } = require('express-validator')

routes.post('/send', [
 check('sender_id').not().isEmpty().withMessage('Sender Id is required'),
 check('receiver_id').not().isEmpty().withMessage('Receiver Id is required'),
 check('title').not().isEmpty().withMessage('Title is required'),
 check('message').not().isEmpty().withMessage('Message is required'),
], async (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
 }
 try {
  await notifications.send(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.put('/update', [
 check('notification_id').not().isEmpty().withMessage('Notification Id is required'),
],
 async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
  }
  try {
   await notifications.update(req, res, next);
  } catch (error) {
   console.error(error);
  }
 })
routes.delete('/:notification_id', async (req, res, next) => {
 try {
  await notifications.del(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.get('/:notification_id', async (req, res, next) => {
 try {
  await notifications.getRec(req, res, next);
 } catch (error) {
  console.error(error);
 }
})
routes.post('/details', async (req, res, next) => {
 try {
  await notifications.details(req, res, next);
 } catch (error) {
  console.error(error);
 }
})

module.exports = routes