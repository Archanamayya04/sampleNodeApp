const mongoose = require("mongoose");
const { logger } = require("../config/logs");

class DB {
  // Mongoose won't retry an initial failed connection.
  static db;
  getDB() {
    return DB.db;
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

mongoose.connection.on("error", function (err) {
  logger.log("Mongoose error: " + err);
});

mongoose.connection.on("connected", function () {
  logger.log("Mongoose connected.");
});

mongoose.connection.on("disconnected", function () {
  logger.log("Mongoose disconnected.");
});

module.exports = { DB }