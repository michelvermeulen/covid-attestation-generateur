var express = require("express");
var router = express.Router();
var cookies = require("cookie-parser");
/* GET home page. */
router.get("/", function (req, res, next) {
  const infos = cookies.get("userdata");
  res.render("index", { infos });
});

module.exports = router;
