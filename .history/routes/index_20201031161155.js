var express = require("express");
var router = express.Router();

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
  const cookie = req.cookies.covidgendata;
  let data;
  if (req.method == "POST") console.log(typeof cookie);
  if (typeof cookie != "undefined") {
    data = cookie;
  } else {
    data = null;
  }
  res.render("index", { data });
});

module.exports = router;
