const { getDb } = require('../../db-conn/db-conn');

exports.create = async (reqParams, file) => {
    try {
        const restaurant_name = reqParams['restaurant_name'];
        const res_logo = file['buffer'];
        const restaurantExists = await checkRestaurant(restaurant_name);
        if (restaurantExists) {
            return { status: false, msg: 'Restaurant name already exists' };
        }
        const insertRec = { 'restaurant_name': restaurant_name, 'res_logo': res_logo, 'created_date': new Date(), 'modified_date': '', 'status': 1 }
        const db = getDb();
        const collection = db.collection(TBL_RESTAURANTS);
        const result = await collection.insertOne(insertRec)
        return { status: true, msg: 'Restaurant Created Successfull', insertedId: result['insertedId'] }
    } catch (error) {
        throw error
    }
}
exports.get = async (reqParams) => {
    try {
        const res_id = reqParams['res_id']
        const db = getDb();
        const collection = db.collection(TBL_RESTAURANTS);
        const result = await collection.find(res_id).sort({ restaurant_name: 1 }).toArray();
        if (result.length > 0) {
            result.forEach((obj) => {
                const imageData = obj['res_logo'];
                const base64Image = imageData.toString('base64');
                obj['res_logo'] = `data:image/png;base64,${base64Image}`;
                obj['res_id'] = obj['_id']
            });
        }
        return { status: true, data: result[0] }
    } catch (error) {
        throw error
    }
}
exports.details = async (reqParams) => {
    try {
        const db = getDb();
        const collection = db.collection(TBL_RESTAURANTS);
        const result = await collection.find().sort({ restaurant_name: 1 }).toArray();
        if (result.length > 0) {
            result.forEach((obj) => {
                const imageData = obj['res_logo'];
                const base64Image = imageData.toString('base64');
                obj['res_logo'] = `data:image/png;base64,${base64Image}`;
                obj['res_id'] = obj['_id']
            });
        }
        return { status: true, data: result }
    } catch (error) {
        throw error
    }
}
async function checkRestaurant(restaurant_name) {
    const db = getDb();
    const collection = db.collection(TBL_RESTAURANTS);
    const record = await collection.findOne({ restaurant_name });
    return record !== null;
}