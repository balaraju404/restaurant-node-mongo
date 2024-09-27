const routes = require('express').Router();
const login = require('./login/login');
const user = require('./users/users');
const restaurant = require('./restaurant/restaurant')
const assign_restaurant_users = require('./assign_restaurant_users/assign_restaurant_users.js')
const categories = require('./categories/categories')

routes.use('/login', login);
routes.use('/user', user)
routes.use('/restaurant', restaurant)
routes.use('/assign_restaurant_users', assign_restaurant_users)
routes.use('/categories', categories)

module.exports = routes;
