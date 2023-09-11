const mongoose = require("mongoose");
const { Config } = require("../config/config");
const { logger } = require("../config/logs");
const { availableCollections } = require(".");


let config = new Config();

const Schema = mongoose.Schema;

var schema = new Schema({}, { timestamps: true, strict: false, versionKey: false });


class DB {
    globalDbHandle;

    constructor() {
        this.globalDbHandle = {}
    }

    // globalDbHandle example
    //    {
    //     dbName: {
    //         dbHnadle: "dbConnectionHandle",
    //         collectionHandles: "collection handles for dbHandle" :: {collectionName: handle}
    //     }
    //    }

    getDBHandle(dbName) { // NOT IN USE
        // This is the only way to access the dbhandle object {}

        let dbHandle;

        if (this.globalDbHandle && this.globalDbHandle[dbName]) {
            return this.globalDbHandle[dbName].dbHanlde
        }

        return dbHandle;
    }

    async getDbInfo(dbName) {
        try {
            // This is the only way to access the dbInfo object {}

            let dbInfo;

            if (!this.globalDbHandle || !this.globalDbHandle[dbName]) {

                let uri = config.dbConfig[dbName]
                console.log("uri", uri);
                await this.connect({ dbName, uri });
            }

            if (this.globalDbHandle[dbName]) {
                return this.globalDbHandle[dbName]
            }

            return dbInfo;

        } catch (error) {
            logger.error("getDbInfo: Err :: ", error?.message || error)
            throw error;
        }

    }
    async getCollectionHandle({ dbName, collectionName }) {
        return new Promise(async (resolve, reject) => {

            try {

                let dbInfo = await this.getDbInfo(dbName);

                if (!dbInfo) {
                    reject(new Error(`dbInfo not found for ${dbName}`))
                }

                if (dbInfo) {

                    let collectionHandles = dbInfo.collectionHandles || {}
                    let dbHandle = dbInfo.dbHandle || null
                    if (collectionHandles[collectionName]) {
                        logger.debug("Collection handle found")
                        resolve(collectionHandles[collectionName])
                    } else {
                        logger.info("new collection handle created for ", collectionName)

                        if (collectionName == availableCollections.admin_tokens) {
                            logger.debug("created index for amdin token")
                            schema.index({ createdAt: 1 }, { expireAfterSeconds: config.adminTokenExpiry })
                        }

                        let collectionHandle = dbHandle.model(collectionName,
                            schema,
                            collectionName)

                        collectionHandles[collectionName] = collectionHandle;
                        dbInfo["collectionHandles"] = collectionHandles;
                        resolve(collectionHandle);
                        // return collectionHandle;
                    }
                }

            } catch (error) {
                logger.error("getCollectionHandle: Err:: ", error?.message)
                reject(error)
            }


        })

    }

    updateCollectionHandle() {
        // required params: dbName, collection handle
        // Will update here the non existingcollection to dbHandle


    }

    connect({ dbName, uri }) {

        return new Promise(async (resolve, reject) => {
            try {

                logger.info(`Establising a new connection for ${dbName} : ${uri}`)
                // make the mongo connection
                let options = { useNewUrlParser: true, useUnifiedTopology: true, 'useCreateIndex': true }
                let connection = await mongoose.createConnection(uri, options);


                connection.on("error", function (err) {
                    logger.log(uri, "Mongoose error: " + err);
                });

                connection.on("connected", function () {
                    logger.log(`${uri} :: Mongoose connected....`);
                });

                connection.on("disconnected", function () {
                    logger.log(`${uri} :: Mongoose disconnected....`);
                });

                logger.debug(`connection made to ${dbName} : ${uri} `)
                let dbHandleObj = {
                    dbHandle: connection
                }


                // set to the globalDbHandle
                this.globalDbHandle[dbName] = dbHandleObj;

                resolve("Success");

            } catch (error) {
                logger.error("CATCH: connect. Error :: ", error?.message)
                logger.error(`Failed to create mongo connection for db ${dbName}:: ${uri}`)
                reject(new Error(`Failed to connect to db :: ${dbName}`))
            }
        })



        // No need of returning anything

    }

    connectWithRetry(uri) {
        logger.info("Connecting to mongodb :: ", uri)
        return mongoose.connect(
            uri,
            {
                bufferMaxEntries: 0,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            (err) => {
                if (err) {
                    console.log(
                        "Mongoose failed initial connection. Retrying in 5 seconds..."
                    );
                    setTimeout(() => {
                        this.connectWithRetry(uri);
                    }, 5000);
                } else {
                    mongoose.Promise = global.Promise;
                    DB.db = mongoose.connection;
                }
            }
        );
    }

    connectionClose(callback) {
        mongoose.connection.close(function () {
            console.log("Mongoose connection closed.");

            if (callback) {
                callback();
            }
        });
    }
}


module.exports = { dbInstance: new DB() }