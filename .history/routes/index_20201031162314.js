var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");

/* GET home page. */
router.get("/", function (req, res, next) {
  const cookie = req.cookies.covidgendata;
  let data;
  if (typeof cookie != "undefined") {
    data = cookie;
  } else {
    data = null;
  }

  res.render("index", { data });
});

router.post("/", function (req, res, next) {
  const body = req.body;
  res.cookie("covidgendata", JSON.stringify(req.body));
  res.render("index");
});

module.exports = router;
