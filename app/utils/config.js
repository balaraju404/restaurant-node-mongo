require('dotenv').config()

global.PORT = process.env.PORT
global.MONGODB_URL = process.env.MONGODB_URL
global.MONGO_DB_USER = process.env.MONGO_DB_USER
global.MONGO_DB_USER_PWD = process.env.MONGO_DB_USER_PWD
global.MONGO_DB_HOST = process.env.MONGO_DB_HOST
global.MONGO_DB_NAME = process.env.MONGO_DB_NAME
global.PROJECT_ID = process.env.PROJECT_ID