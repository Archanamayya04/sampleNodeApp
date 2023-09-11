// This is the root file

const express = require('express');

const http = require("http");
// const https = require("https");
const path = require("path");
const errorhandler = require("errorhandler");
const expressValidator = require("express-validator");
require("dotenv").config();

const { Config } = require("./config/config");
let config = new Config()

const app = express();

const cors = require("cors");
const { DB } = require('./models/db');
const { logger } = require('./config/logs');

var corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [
        "Origin",
        "Authorization",
        "X-Requested-With",
        "Content-Type",
        "Accept",
    ],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const httpServer = http.createServer(app);

const db = new DB(); // creating an instance DB class
const httpPort = config.httpPort || 80;
const mongodbURI = config.mongodbURI;
const LABEL = config.serviceName;

// app.set("port", port);


app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

//Express Validator
app.use(
    expressValidator({
        errorFormatter: function (param, msg, value) {
            var namespace = param.split("."),
                root = namespace.shift(),
                formParam = root;

            while (namespace.length) {
                formParam += "[" + namespace.shift() + "]";
            }
            return {
                param: formParam,
                msg: msg,
                value: value,
            };
        },
    })
);

if ("development" === app.get("env")) {
    console.log("Running in Development Environment..");

    logger.info(
        "Running in Development Environment ."
    );

    app.use(errorhandler());
}

//////////////// Bring in the database!

//redis

const { Redis } = require("./models/redis");

const redis = new Redis();


redis.connect({
    host: config.redisHost,
    port: config.redisPort,
    password: config.redisPassword
});

// mongodb
db.connectWithRetry(mongodbURI); 

//////////////////////////////////////////////

//allow requests from any host
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, Authorization, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST,PUT, DELETE");
    next();
});


app.use("/test", (req, res) => {
    return res.status(200).send(`${config.serviceName} backend API's are live`);
});

// app.use("/", require("./routes/v1/index"));  // Mapping all the routes to v1


// START THE HTTP SERVER
httpServer.listen(httpPort, () => {
    logger.log(LABEL + " is running on httpPort " + httpPort);
});


// // START THE HTTPS SERVER
// httpServer.listen(httpPort, () => {
//     logger.log(LABEL + " is running on httpPort " + httpPort);
// });

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).send("Page/Api Not Found");
    return;
});

process.on("SIGINT", function () {
    process.exit(0);
});

process.on("SIGTERM", function () {
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.log("uncaughtException :: ", err?.message);
    logger.log("uncaughtException :: ", err?.message);

    process.exit(0)
});

module.exports = redis;
