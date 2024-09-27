const mongoose = require('mongoose');

let _db;
const dbUrl = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_USER_PWD}@${MONGO_DB_HOST}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

const mongoConnect = callback => {
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            console.log('Connected to MongoDB!');
            _db = client.connection.db;
            callback();
        })
        .catch(err => {
            console.log('Error connecting to MongoDB', err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw new Error('Database not initialized. Call mongoConnect first.');
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
