const { getDb } = require("../../db-conn/db-conn");
const { ObjectId } = require('mongoose').Types;

exports.add = async (reqParams) => {
    try {
        const user_id = reqParams['user_id'] || 0;
        const res_id = reqParams['res_id'] || 0;
        const total_price = reqParams['total_price'] || 0;
        const products_data = reqParams['products_data'] || [];
        const status = reqParams['status'] || 0;

        const insertRec = { 'user_id': user_id, 'res_id': res_id, 'total_price': total_price, 'transaction_date': new Date(), 'status': status };

        const db = getDb()
        const collection = db.collection(TBL_ORDER_TRANSACTIONS)
        const result = await collection.insertOne(insertRec);
        const trans_id = result['insertedId'].toString();

        await addSubTransactions(trans_id, products_data);
        return { status: 200, msg: 'Order transaction added successfully', insertedId: trans_id };
    } catch (error) {
        throw error;
    }
};

async function addSubTransactions(trans_id, products_data) {
    try {
        const db = getDb()
        const collection = db.collection(TBL_SUB_TRANSACTIONS)
        // Use Promise.all to handle all asynchronous operations
        await Promise.all(products_data.map(async (item) => {
            const insertRec = { 'trans_id': trans_id, 'product_id': item['product_id'], 'product_qty': item['product_qty'] };
            await collection.insertOne(insertRec);
            await deleteUserCartData(item['cart_id'])
        }));
    } catch (error) {
        throw error;
    }
}
async function deleteUserCartData(cart_id) {
    try {
        const db = getDb()
        const collection = db.collection(TBL_USER_CART)
        const whr = { _id: new ObjectId(cart_id) };
        await collection.deleteOne(whr);
        return { status: true, msg: 'Record Deleted Successfully' };
    } catch (error) {
        throw error;
    }
};

exports.update = async (reqParams) => {
    try {
        const trans_id = reqParams['trans_id'] || 0;
        const user_id = reqParams['user_id'] || 0;
        const res_id = reqParams['res_id'] || 0;
        const total_price = reqParams['total_price'] || 0;
        const transaction_date = reqParams['transaction_date'] || 0;
        const status = reqParams['status'] || 0;

        const updateRec = { user_id: user_id, res_id: res_id, total_price: total_price, transaction_date: transaction_date, status: status };
        const whr = { _id: new ObjectId(trans_id) };

        const db = getDb()
        const collection = db.collection(TBL_ORDER_TRANSACTIONS)
        await collection.updateOne(whr, { $set: updateRec });
        let msg = 'Record Updated Successfully'
        if (status == 2) {
            msg = 'Order Accepeted Successfull'
        } else if (status == 3) {
            msg = 'Order Rejection Successfull'
        }
        return { status: true, msg: msg };
    } catch (error) {
        throw error;
    }
};
exports.del = async (reqParams) => {
    try {
        await deleteSubTrans(reqParams['trans_id'])
        const whr = { _id: new ObjectId(reqParams['trans_id']) || 0 };
        const db = getDb()
        const collection = db.collection(TBL_ORDER_TRANSACTIONS)
        await collection.deleteOne(whr);
        return { status: true, msg: 'Record Deleted Successfully' };
    } catch (error) {
        throw error;
    }
};
async function deleteSubTrans(trans_id) {
    try {
        const db = getDb()
        const collection = db.collection(TBL_SUB_TRANSACTIONS)
        const whr = { trans_id: trans_id || 0 };
        await collection.deleteMany(whr);
        return { status: true, msg: 'Sub-transactions Deleted Successfully' };
    } catch (error) {
        throw error;
    }
}

exports.details = async (reqParams) => {
    try {
        const res_id = reqParams['res_id'] || 0;
        const user_id = reqParams['user_id'] || 0;
        const status = reqParams['status'] || 0;

        let pipeline = []
        const matchConditions = {}
        if (user_id > 0) matchConditions['user_id'] = user_id
        if (res_id > 0) matchConditions['res_id'] = res_id
        if (status > 0) matchConditions['status'] = status

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({
                $match: matchConditions
            })
        }
        pipeline.push({
            $addFields: {
                'user_id': { $toObjectId: '$user_id' },
                'res_id': { $toObjectId: '$res_id' }
            }
        })

        //lookup
        pipeline.push({
            $lookup: {
                from: TBL_USERS,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_info'
            }
        })
        pipeline.push({
            $lookup: {
                from: TBL_RESTAURANTS,
                localField: 'res_id',
                foreignField: '_id',
                as: 'restaurant_info'
            }
        })
        pipeline.push({ $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } })
        pipeline.push({ $unwind: { path: '$restaurant_info', preserveNullAndEmptyArrays: true } })

        pipeline.push({
            $project: {
                trans_id: '$_id',
                user_id: '$user_id',
                res_id: '$res_id',
                total_price: '$total_price',
                transaction_date: '$transaction_date',
                status: '$status',
                user_name: '$user_info.user_name',
                email: '$user_info.email',
                restaurant_name: '$restaurant_info.restaurant_name',
            }
        })

        const db = getDb()
        const collection = db.collection(TBL_ORDER_TRANSACTIONS)
        const result = await collection.aggregate(pipeline).toArray();

        let transArray = [];
        result.forEach((item) => {
            item['products_data'] = []
            transArray.push(item['trans_id']);
        })

        let pipeline2 = []
        if (transArray.length > 0) {
            pipeline.push({
                $match: { $in: transArray }
            })
        }
        pipeline2.push({
            $addFields: {
                'product_id': { $toObjectId: '$product_id' }
            }
        })

        //lookup
        pipeline2.push({
            $lookup: {
                from: TBL_RESTAURANT_PRODUCTS,
                localField: 'product_id',
                foreignField: '_id',
                as: 'product_info'
            }
        })
        pipeline2.push({ $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } })

        pipeline2.push({
            $project: {
                sub_trans_id: '$_id',
                trans_id: '$trans_id',
                product_id: '$product_id',
                product_qty: '$product_qty',
                product_name: '$product_info.product_name',
                product_img: '$product_info.product_img',
                price: '$product_info.price',
                description: '$product_info.description'
            }
        })

        const collection2 = db.collection(TBL_SUB_TRANSACTIONS)
        const productsData = await collection2.aggregate(pipeline2).toArray();

        if (productsData.length > 0) {
            productsData.forEach((obj) => {
                if (obj['product_img']) {
                    const base64Image = obj['product_img'].toString('base64');
                    obj['product_img'] = `data:image/png;base64,${base64Image}`;
                }
                const index = result.findIndex(ele => ele['trans_id'] == obj['trans_id'])
                if (index != -1) {
                    result[index]['products_data'].push(obj);
                }
            });
        }
        return { status: true, data: result };

    } catch (error) {
        return { status: false, msg: 'Internal server error', error };
    }
};
