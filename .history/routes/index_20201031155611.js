var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const infos = localStorage.getItem("userdata");
  res.render("index", { infos });
});

module.exports = router;
