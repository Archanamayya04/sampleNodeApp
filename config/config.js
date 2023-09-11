require("dotenv").config();

class Config {
    serviceName = process.env.SERVICE_NAME || "em-link-nodejs"
    mongodbURI = process.env.MONGO_DB_URI || "mongodb://localhost:27017/main"
    httpPort = process.env.HTTP_PORT || 80;
    httpsPort = process.env.HTTPS_PORT || 443;
    dynamicCollectionModels = new Object();

    redisHost = process.env.REDIS_HOST || "127.0.0.1";
    redisPort = process.env.REDIS_PORT || 6379;
    redisPassword = process.env.REDIS_PASSWORD || "foobared";

    dbConfig = {
        "default": "mongodb://localhost:27017/main"
    }
}

module.exports = { Config }