const express = require('express'),
  createError = require('http-errors'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  log = require('libs/log')(module),
  routes = require('routes'),
  config = require('config'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  mongoose = require('libs/mongoose'),
  app = express();

const HttpError = require('error').HttpError;

const mode = app.get('env');

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set logger
if (mode === 'development') {
  app.use(logger('dev'));
} else {
  app.use(logger('default'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

const mongosoeStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  resave: false,
  saveUninitialized: false,
  store: mongosoeStore
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('middleware/sendHttpError'));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (typeof err === 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    log.error(err);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
