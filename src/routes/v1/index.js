const express = require("express");
let router = express.Router();
const { entryPoint } = require("../middlewares/entryPoint");
const { exitPoint } = require("../middlewares/exitPoint");

// const suppressionController = require("../controllers/suppressionList");

// router.post("/test", entryPoint, suppressionController.testMultipleDbConnection, exitPoint)


module.exports = router;