const { getDb } = require("../../db-conn/db-conn");

exports.add = async (reqParams, images) => {
 try {
  const res_id = reqParams['res_id'] || 0;
  const cat_id = reqParams['cat_id'] || 0;
  const product_name = reqParams['product_name'] || '';
  const product_img = images[0]['buffer'];
  const price = reqParams['price'];
  const description = reqParams['description'];

  const insertRec = { 'res_id': res_id, 'cat_id': cat_id, 'product_name': product_name, 'product_img': product_img, 'price': price, 'description': description, 'created_by': '', 'created_date': new Date(), 'modified_date': '', 'status': 1 };

  const db = getDb()
  const collection = db.collection(TBL_RESTAURANT_PRODUCTS);
  const result = await collection.insertOne(insertRec)
  const productId = result['insertedId'];
  if (images.length > 1) {
   await resImages(productId, res_id, cat_id, images);
  }
  return { status: true, msg: 'Product Created Successfully', insertedId: productId };
 } catch (error) {
  throw error;
 }
};

async function resImages(product_id, res_id, cat_id, images) {
 try {
  const db = getDb();
  const collection = db.collection(TBL_PRODUCT_IMAGES);
  const promises = images.slice(1).map(async (img) => {
   const insertRec = { 'res_id': res_id, 'cat_id': cat_id, 'product_id': product_id, 'image': img['buffer'] };
   await collection.insertOne(insertRec);
  });
  await Promise.all(promises);
 } catch (error) {
  throw error;
 }
}
exports.details = async (reqParams) => {
 try {
  const res_id = reqParams['res_id'] || 0;
  const cat_id = reqParams['cat_id'] || 0;

  let pipeline = [];

  // Combine match conditions into a single object
  const matchConditions = {};
  if (res_id.length > 0) matchConditions['res_id'] = res_id;
  if (cat_id.length > 0) matchConditions['cat_id'] = cat_id;

  if (Object.keys(matchConditions).length > 0) {
   pipeline.push({ $match: matchConditions });
  }

  // Add fields for type conversion
  pipeline.push({
   $addFields: {
    res_id: { $toObjectId: "$res_id" },
    cat_id: { $toObjectId: "$cat_id" },
   }
  });

  pipeline.push(
   {
    $lookup: {
     from: TBL_RESTAURANTS,
     localField: 'res_id',
     foreignField: '_id',
     as: 'restaurant_info'
    }
   },
   {
    $lookup: {
     from: TBL_CATEGORIES,
     localField: 'cat_id',
     foreignField: '_id',
     as: 'category_info'
    }
   },
   { $unwind: { path: '$restaurant_info', preserveNullAndEmptyArrays: true } },
   { $unwind: { path: '$category_info', preserveNullAndEmptyArrays: true } },
   {
    $project: {
     product_id: '$_id',
     res_id: '$res_id',
     cat_id: '$cat_id',
     product_name: '$product_name',
     product_img: '$product_img',
     price: '$price',
     description: '$description',
     created_date: '$created_date',
     modified_date: '$modified_date',
     status: '$status',
     restaurant_name: '$restaurant_info.restaurant_name',
     cat_name: '$category_info.cat_name'
    }
   }
  );

  const db = getDb();
  const collection = db.collection(TBL_RESTAURANT_PRODUCTS);
  const result = await collection.aggregate(pipeline).toArray();

  // Fetch product images concurrently
  const resProductsCollection = db.collection(TBL_PRODUCT_IMAGES);
  const product_images = await resProductsCollection.find({ product_id: { $in: result.map(r => r.product_id) } }).toArray();

  // Attach images to results
  result.forEach((obj) => {
   obj['images'] = product_images.filter((img) => img['product_id'].toString() === obj['product_id'].toString());
  });

  result.forEach((obj) => {
   // if (Buffer.isBuffer(obj['product_img'])) {
   const base64Image = obj['product_img'].toString('base64');
   obj['product_img'] = `data:image/png;base64,${base64Image}`;
   // }

   if (obj['images']) {
    obj['images'] = obj['images'].map((imgObj) => {
     // if (Buffer.isBuffer(imgObj['image'])) {
     const base64Image = imgObj['image'].toString('base64');
     imgObj['image'] = `data:image/png;base64,${base64Image}`;
     // }
     return imgObj;
    });
   }
  });


  return { status: true, data: result };

 } catch (error) {
  return { status: false, msg: 'Internal server error', error: error.message || error };
 }
};

async function checkRecord(product_name) {
 const db = getDb();
 const collection = db.collection(TBL_RESTAURANT_PRODUCTS)
 const record = await collection.findOne({ product_name });
 return record !== null;
}
