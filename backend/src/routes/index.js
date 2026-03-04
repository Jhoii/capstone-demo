const express = require("express");
const StudentRouter = require("./StudentRouter");

const router = express.Router();

router.use("/students", StudentRouter);

module.exports = router;