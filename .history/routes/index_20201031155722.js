var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const cookie = req.res.render("index", { title: "Express" });
});

module.exports = router;
