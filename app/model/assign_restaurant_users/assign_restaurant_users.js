const { getDb } = require("../../db-conn/db-conn");

exports.add = async (reqParams) => {
    try {
        const res_id = reqParams['res_id'] || 0;
        const user_id = reqParams['user_id'] || 0;
        const role_id = reqParams['role_id'] || 0
        const recordExists = await checkRecord(reqParams);
        if (recordExists) {
            return { status: false, msg: 'Record already exists' };
        }
        const insertRec = { 'res_id': res_id, 'user_id': user_id, 'role_id': role_id, 'created_date': new Date(), 'modified_date': '', 'status': 1 }
        const db = getDb();
        const collection = db.collection(TBL_RESTAURANT_USERS);
        const result = await collection.insertOne(insertRec);
        return { status: true, msg: 'User Assigned To Restaurant', insertedId: result['insertedId'] }
    } catch (error) {
        throw error
    }
}
exports.details = async (reqParams) => {
    try {
        const db = getDb();
        const collection = db.collection(TBL_RESTAURANT_USERS);

        const pipeline = [];

        // Match stage for filtering by user_id if provided
        if (reqParams['user_id']) {
            pipeline.push({
                $match: { user_id: reqParams['user_id'] }
            });
        }

        // Add fields for type conversion
        pipeline.push({
            $addFields: {
                res_id: { $toObjectId: "$res_id" },
            }
        });

        // Lookup to join with restaurants
        pipeline.push({
            $lookup: {
                from: TBL_RESTAURANTS,
                localField: 'res_id',
                foreignField: '_id',
                as: 'restaurant_info'
            }
        });

        // Lookup to join with login_roles
        pipeline.push({
            $lookup: {
                from: TBL_LOGIN_ROLES,
                localField: 'role_id',
                foreignField: 'login_role_id',
                as: 'role_info'
            }
        });

        // Unwind the joined arrays to flatten the structure
        pipeline.push({ $unwind: { path: '$restaurant_info', preserveNullAndEmptyArrays: true } });
        pipeline.push({ $unwind: { path: '$role_info', preserveNullAndEmptyArrays: true } });

        // Project the required fields
        pipeline.push({
            $project: {
                id: '$_id',
                user_id: '$user_id',
                res_id: '$res_id',
                restaurant_name: { $ifNull: ['$restaurant_info.restaurant_name', 'Not Found'] },
                res_logo: { $ifNull: ['$restaurant_info.res_logo', null] },
                role_id: '$role_id',
                role_name: { $ifNull: ['$role_info.login_role_name', 'Not Found'] }
            }
        });

        // Execute the aggregation pipeline
        const result = await collection.aggregate(pipeline).toArray();

        if (result.length > 0) {
            result.forEach((obj) => {
                const imageData = obj['res_logo'];
                if (imageData) {
                    const base64Image = imageData.toString('base64');
                    obj['res_logo'] = `data:image/png;base64,${base64Image}`;
                } else {
                    obj['res_logo'] = null;
                }
            });
        }

        return { status: true, data: result };
    } catch (error) {
        console.error('Error fetching details:', error);
        throw error;
    }
};


async function checkRecord(reqParams) {
    const res_id = reqParams['res_id'];
    const user_id = reqParams['user_id'];
    const role_id = reqParams['role_id'];

    const db = getDb();
    const collection = db.collection(TBL_RESTAURANT_USERS);

    const record = await collection.findOne({ res_id, user_id, role_id });
    return record !== null;
}
