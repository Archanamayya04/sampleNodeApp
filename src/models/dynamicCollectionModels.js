

const mongoose = require("mongoose");
const { availableCollections } = require(".");
const { Config } = require("../config/config");
const { logger } = require("../config/logs");

const Schema = mongoose.Schema;

var schema = new Schema({}, { timestamps: true, strict: false, versionKey: false });

let config = new Config();


const getCollectionObject = (collectionName, schema) => {
    let collectionExists = false;  
    let collectionHandle;

    try {

        if (config.dynamicCollectionModels[collectionName]) {
            collectionHandle = config.dynamicCollectionModels[collectionName]
            collectionExists = true;
        }

        if (!collectionExists) {

            if (collectionName == availableCollections.admin_tokens) {
                console.log(("created index for amdin token"));
                schema.index({ createdAt: 1 }, { expireAfterSeconds: config.adminTokenExpiry })
            }
            collectionHandle = mongoose.model(
                collectionName,
                schema,
                collectionName
            );
            config.dynamicCollectionModels[collectionName] = collectionHandle;
        }

        if (!collectionHandle) {
            throw new Error("collectionHandle is :: ", collectionHandle)
        }

        return collectionHandle;

    } catch (err) {
        logger.error("CATCH :: ", err?.message)
        logger.error("Failed to prepare collectionHandle for :: ", collectionName)
        throw err;
    }

}

exports.insertMany = async (collectionName, data, ...isCallback) => {
    let callBack = isCallback[0] || null;

    if (!Array.isArray(data)) {
        data = [data]
    }

    if (callBack) {
        try {
            getCollectionObject(collectionName, schema).insertMany(
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
            let result = await getCollectionObject(collectionName, schema).insertMany(data)

            return result;
        } catch (error) {
            throw error
        }
    }
}

exports.findMany = async (collectionName, query, ...isCallback) => {
    let callBack = isCallback[0] || null;

    if (callBack) {
        try {
            getCollectionObject(collectionName, schema).find(
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
            let result = await getCollectionObject(collectionName, schema).find(query)

            return JSON.parse(JSON.stringify(result)) || result;
        } catch (error) {
            throw error
        }
    }
}


exports.findOne = async (collectionName, query, ...isCallback) => {
    let callBack = isCallback[0] || null;

    if (callBack) {
        try {
            getCollectionObject(collectionName, schema).findOne(
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
            let result = await getCollectionObject(collectionName, schema).findOne(query)

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}

exports.updateOne = async (collectionName, query, updateObj, ...isCallback) => {
    let callBack = isCallback[0] || null;

    let timestamp = { updatedAt: Date.now() }

    if (updateObj["$set"]) {
        updateObj["$set"] = { ...updateObj["$set"], ...timestamp }
    } else {
        updateObj["$set"] = { ...timestamp }
    }

    if (callBack) {
        try {
            getCollectionObject(collectionName, schema).updateOne(
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
            let result = await getCollectionObject(collectionName, schema).updateOne(query, updateObj)

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

exports.deleteOne = async (collectionName, query, ...isCallback) => {
    let callBack = isCallback[0] || null;

    logger.debug("query to deleteOne :: ", query)
    if (callBack) {
        try {
            if(!Object.keys(query).length){
                callBack("query should not be empty", null)
                return;
            }
            getCollectionObject(collectionName, schema).deleteOne(
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
            if(!Object.keys(query).length){
                throw(new Error("query should not be empty"))
            }
            let result = await getCollectionObject(collectionName, schema).deleteOne(query)

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}

exports.deleteMany = async (collectionName, query, ...isCallback) => {
    let callBack = isCallback[0] || null;

    logger.debug("query to deleteMany :: ", query)

    if (callBack) {
        try {
            if(!Object.keys(query).length){
                callBack("query should not be empty", null)
                return;
            }
            getCollectionObject(collectionName, schema).deleteMany(
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
            if(!Object.keys(query).length){
                throw(new Error("query should not be empty"))
            }

            let result = await getCollectionObject(collectionName, schema).deleteMany(query)

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            throw error
        }
    }
}



