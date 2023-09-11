

// const mongoose = require("mongoose");
// const { availableCollections } = require(".");
// const { Config } = require("../config/config");
const { logger } = require("../config/logs");

const { dbInstance } = require("../models/multipleMongo")

// const Schema = mongoose.Schema;

// var schema = new Schema({}, { timestamps: true, strict: false, versionKey: false });

// let config = new Config();

const getCollectionObject = async (dbName, collectionName) => {
    return new Promise(async (resolve, reject) => {
        let collectionHandle;

        try {

            collectionHandle = await dbInstance.getCollectionHandle({ dbName, collectionName })

            if (!collectionHandle) {
                throw new Error("collectionHandle is :: ", collectionHandle)
            }

            // console.log("collectionHandle", collectionHandle);


            resolve(collectionHandle);

            // return collectionHandle;

        } catch (err) {
            logger.error("CATCH :: ", err?.message)
            logger.error("Failed to prepare collectionHandle for :: ", collectionName)
            // throw err;
            reject(err)
        }
    })


}

exports.insertMany = async (...arguments) => {

    let [dbName, collectionName, data, callBack] = arguments

    // let callBack = isCallback[0] || null;

    if (!Array.isArray(data)) {
        data = [data]
    }

    if (callBack) {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            model.insertMany(
                data,
                function (err, result) {
                    callBack(err, result);
                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
        }

    } else {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            let result = await model.insertMany(data)

            return result;
        } catch (error) {
            throw error
        }
    }
}

exports.findMany = async (...arguments) => {

    let [dbName, collectionName, query, callBack] = arguments

    if (callBack) {
        try {

            let model = await getCollectionObject(dbName, collectionName)
            model.find(
                query,
                function (err, result) {
                    callBack(err, result);
                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
        }

    } else {
        try {
            let model = await getCollectionObject(dbName, collectionName)
            let result = await model.find(query);

            return JSON.parse(JSON.stringify(result)) || result;
        } catch (error) {
            throw error
        }
    }
}


exports.findOne = async (...arguments) => {
    // let callBack = isCallback[0] || null;

    let [dbName, collectionName, query, callBack] = arguments

    if (callBack) {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            model.findOne(
                query,
                function (err, result) {
                    callBack(err, result);
                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
        }

    } else {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            let result = await model.findOne(query)

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}

exports.updateOne = async (...arguments) => {
    // let callBack = isCallback[0] || null;

    let [dbName, collectionName, query, updateObj, callBack] = arguments;

    let timestamp = { updatedAt: Date.now() }

    if (updateObj["$set"]) {
        updateObj["$set"] = { ...updateObj["$set"], ...timestamp }
    } else {
        updateObj["$set"] = { ...timestamp }
    }

    if (callBack) {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            model.updateOne(
                query,
                updateObj,
                function (err, result) {

                    if (err) {
                        callBack(err, result);
                        return
                    }

                    if (result && result.nModified > 0) {
                        callBack(err, "Document updated");
                        return;
                    } else {
                        callBack(err, "No documents found to update");
                        return;
                    }


                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
        }

    } else {
        try {
            let model = await getCollectionObject(dbName, collectionName)

            let result = await model.updateOne(query, updateObj)

            console.log("result 124", result);

            if (result && result.nModified > 0) {
                return "Document updated"
            } else {
                return "No documents found to update"
            }
        } catch (error) {
            throw error
        }
    }
}

exports.deleteOne = async (...arguments) => {
    // let callBack = isCallback[0] || null;

    let [dbName, collectionName, query, callBack] = arguments;


    logger.debug("query to deleteOne :: ", query)
    if (callBack) {
        try {
            if (!Object.keys(query).length) {
                callBack("query should not be empty", null)
                return;
            }

            let model = await getCollectionObject(dbName, collectionName)

            model.deleteOne(
                query,
                function (err, result) {
                    callBack(err, result);
                    return
                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
            return;
        }

    } else {
        try {
            if (!Object.keys(query).length) {
                throw (new Error("query should not be empty"))
            }
            let model = await getCollectionObject(dbName, collectionName)

            let result = await model.deleteOne(query)

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}

exports.deleteMany = async (...arguments) => {
    // let callBack = isCallback[0] || null;

    let [dbName, collectionName, query, callBack] = arguments;


    logger.debug("query to deleteMany :: ", query)

    if (callBack) {
        try {
            if (!Object.keys(query).length) {
                callBack("query should not be empty", null)
                return;
            }
            let model = await getCollectionObject(dbName, collectionName)

            model.deleteMany(
                query,
                function (err, result) {
                    callBack(err, result);
                    return
                }
            );
        } catch (error) { // getCollectionObject may throw err so wrapping it in try catch
            callBack(error, null)
            return
        }

    } else {
        try {
            if (!Object.keys(query).length) {
                throw (new Error("query should not be empty"))
            }

            let model = await getCollectionObject(dbName, collectionName)

            let result = await model.deleteMany(query);

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}



