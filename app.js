var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');

var appRoutes = require('./routes/app');
var authRoutes = require('./routes/auth');
var projectRoutes = require('./routes/projects');
var messagingRoutes = require('./routes/messaging');
var notificationsRoutes = require('./routes/notifications');

var app = express();

//Database connection
mongoose.connect('mongodb://holow:sniperest@ds231460.mlab.com:31460/obonob');

//Email setup
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'obonob.app@gmail.com',
        pass: '3Qt#z#%@Zuaju8q9'
    }
});
app.set('mail-transporter', transporter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public/images', 'logo.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Allow access connection to backend from different servers
/*app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});*/

app.use('/api/', appRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/notifications', notificationsRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});


module.exports = app;
