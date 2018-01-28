var express = require('express');
var router = express.Router();

/**
 * Generates access point to the application
 */
router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;
