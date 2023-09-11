// const mongoose = require("mongoose");
const redis = require("redis");
const { logger } = require("../config/logs");

var redisClient;

class Redis {
    static db;
    // getDB() {
    //     return Redis.db;
    // }
    async connect({ host, port, password }) {
        logger.info("connecting to redis :: ", { host, port, password })
        // redisClient = redis.createClient({ host, port, password });
        redisClient = redis.createClient({
            socket: {
                host: host,
                port: port
            },
            password: password
        });



        redisClient.on('error', function (error) {

            logger.log(' Failed to connect to redis. Error :: ', error);

            return null;
        });


        try {
            await redisClient.connect();

            logger.log('Connected to redis ');

            return redisClient;
        } catch (error) {
            logger.error("Failed to connect Redis. Err :: ", error?.message)
            return null;
        }



        // redisClient.on('connect', function () {

        //     logger.log('Connected to redis ');

        //     return redisClient
        // });



    }

}

class RedisOldModel {
    setHashMapData(hMap, pairedData, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {
                redisClient.hmset(hMap, pairedData, function (err) {
                    if (err) {
                        logger.log('setHashMap error  ::  ', err?.message || err);
                        callback(err, null);
                    }

                    callback(null, true)

                })

            } catch (error) {
                callback(error, null);
            }

        } else {

            return new Promise((resolve, reject) => {
                try {
                    redisClient.hmset(hMap, pairedData, function (err) {
                        if (err) {
                            logger.log('setHashMap error  :: ', err?.message || err);
                            reject(err);
                        }

                        reject(new Error("sadhsfhg"))

                        // resolve(true);

                    })

                } catch (error) {
                    reject(error);
                }
            })

        }
    };

    getAll(hMap, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {
                redisClient.hmgetall(hMap, function (err, result) {
                    if (err) {
                        logger.log('error on getting redis data : ', err?.message || err);
                        callback(err, null);
                    }

                    callback(null, result)

                })

            } catch (error) {
                callback(error, null);
            }

        } else {
            return new Promise((resolve, reject) => {
                try {
                    redisClient.hGetAll(hMap, function (err, result) {
                        if (err) {
                            logger.log('error on getting redis data : ', err?.message || err);
                            reject(err);
                        }

                        console.log("result 105", result);

                        resolve(result);

                    })
                } catch (error) {
                    reject(error);
                }

            })

        }
    }
}

class RedisModel {
    async setHashMapData(hMap, pairedData, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {

                let result = await redisClient.hSet(hMap, pairedData)

                callback(null, result)

            } catch (error) {
                callback(error, null);
            }

        } else {
            try {

                let result = await redisClient.hSet(hMap, pairedData)

                console.log("Added to redis :: ", result);

                return result;

            } catch (error) {
                throw error;
            }

        }
    };

    async getAll(hMap, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {

                let result = await redisClient.hGetAll(hMap)

                callback(null, result)

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message);
                callback(error, null);
            }

        } else {
            try {

                let result = await redisClient.hGetAll(hMap)

                return JSON.parse(JSON.stringify(result))

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message)
                throw error;
            }

        }
    }

    async getOne(hMap, field, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {

                let result = await redisClient.hGet(hMap, field)

                callback(null, result)

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message);
                callback(error, null);
            }

        } else {
            try {

                let result = await redisClient.hGet(hMap, field)

                return JSON.parse(JSON.stringify(result))

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message)
                throw error;
            }

        }
    }

    async deleteOne(hMap, field, ...manyMoreArguments) {

        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {

                let result = await redisClient.hDel(hMap, field)

                callback(null, result)

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message);
                callback(error, null);
            }

        } else {
            try {

                let result = await redisClient.hDel(hMap, field)

                console.log("deleting result :: ", result);
                return JSON.parse(JSON.stringify(result))

            } catch (error) {
                logger.error("redis getAll error :: ", error?.message)
                throw error;
            }

        }
    }

    async deleteMany(hMap, fields, ...manyMoreArguments) {

        console.log("inside deleteMany", hMap, fields);
        let callback = manyMoreArguments[0] || null;

        if (callback) {
            try {

                let result = await redisClient.hDel(hMap, fields)

                callback(null, result)

            } catch (error) {
                logger.error("redis deleteMany error :: ", error?.message);
                callback(error, null);
            }

        } else {
            try {

                let result = await redisClient.hDel(hMap, fields)

                console.log("deleting result :: ", result);
                return JSON.parse(JSON.stringify(result))

            } catch (error) {
                logger.error("redis deleteMany error :: ", error?.message)
                throw error;
            }

        }
    }
}

// const getAll = (hMap, ...manyMoreArguments) => {

//     let callback = manyMoreArguments[0] || null;

//     if (callback) {
//         try {
//             redisClient.hmgetall(hMap, function (err, result) {
//                 if (err) {
//                     logger.log('error on getting redis data : ', err?.message || err);
//                     callback(err, null);
//                 }

//                 callback(null, result)

//             })

//         } catch (error) {
//             callback(error, null);
//         }

//     } else {
//         return new Promise((resolve, reject) => {
//             try {
//                 console.log("redisClient", redisClient);
//                 redisClient.hGetAll(hMap, function (err, result) {
//                     if (err) {
//                         logger.log('error on getting redis data : ', err?.message || err);
//                         reject(err);
//                     }

//                     console.log("result 105", result);

//                     resolve(result);

//                 })
//             } catch (error) {
//                 reject(error);
//             }

//         })

//     }
// }


var redisModel = new RedisModel()


module.exports = { Redis, redisModel }