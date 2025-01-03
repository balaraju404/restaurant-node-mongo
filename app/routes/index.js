const routes = require('express').Router();
const login = require('./login/login');
const user = require('./users/users');
const restaurant = require('./restaurant/restaurant')
const assign_restaurant_users = require('./assign_restaurant_users/assign_restaurant_users.js')
const categories = require('./categories/categories')
const res_categories = require('./res_categories/res_categories')
const products = require('./products/products.js')
const cart = require('./cart/cart.js')
const order = require('./order/order')
const dashboard = require('./dashboard')
const notifications = require('./notifications')
const device_token = require('./device_token')

routes.use('/login', login);
routes.use('/user', user)
routes.use('/restaurant', restaurant)
routes.use('/assign_restaurant_users', assign_restaurant_users)
routes.use('/categories', categories)
routes.use('/res_categories', res_categories)
routes.use('/products', products)
routes.use('/cart', cart)
routes.use('/order', order)
routes.use('/dashboard', dashboard)
routes.use('/notifications', notifications)
routes.use('/device_token', device_token)

module.exports = routes;
