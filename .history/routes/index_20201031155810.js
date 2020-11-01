var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const cookies = req.cookies;
  console.log(cookies);
  res.render("index", { title: "Express" });
});

module.exports = router;
