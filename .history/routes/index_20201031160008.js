var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const cookie = req.cookies.covidgendata;
  let data;
  if (typeof cookie !== "undefined") {
    data = cookie;
  } else {
    data = null;
  }
  console.log(cookie);
  res.render("index", { cookie });
});

module.exports = router;
