const { getDb } = require('../../db-conn/db-conn');

exports.create = async (reqParams) => {
    try {
        const login_name = reqParams['login_name'];
        const user_name = reqParams['user_name'];
        const password = reqParams['password'];
        const role_id = reqParams['role_id'];
        const userExists = await checkUser(login_name);
        if (userExists) {
            return { status: false, msg: 'User already exists' };
        }
        const insertRec = { 'fname': '', 'lname': '', 'user_name': user_name, 'login_name': login_name, 'password': password, 'role_id': role_id, 'email': '', 'mobile': '', 'created_by': 'system', 'created_date': new Date(), 'modified_date': '', 'status': 1 }
        const db = getDb();
        const collection = db.collection(TBL_USERS)
        const result = await collection.insertOne(insertRec)
        return { status: true, msg: 'User Created Successfull', insertedId: result['insertedId'] }
    } catch (error) {
        throw error
    }
}
exports.details = async (reqParams) => {
    try {
        const login_name = reqParams['login_name'] || '';
        const user_name = reqParams['user_name'] || '';
        const role_id = reqParams['role_id'] || 0;

        const query = {};
        if (login_name.length > 0) {
            query.login_name = login_name;
        }
        if (user_name.length > 0) {
            query.user_name = user_name;
        }
        if (role_id > 0) {
            query.role_id = role_id;
        }

        const db = getDb();
        const collection = db.collection(TBL_USERS);
        const result = await collection.find(query).sort({ login_name: 1 }).toArray();
        result.forEach(e => {
            e['user_id'] = e['_id']
        });
        return { status: true, data: result };
    } catch (error) {
        throw error;
    }
};

async function checkUser(login_name) {
    const db = getDb();
    const collection = db.collection(TBL_USERS);
    const user = await collection.findOne({ login_name });
    return user !== null;
}