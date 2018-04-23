/*const express = require('express'),
  router = express.Router();

const ObjectId = require('mongodb').ObjectID;

const User = require('models/user').User,
  HttpError = require('error').HttpError;

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/users', (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    res.json(users);
  });
});

router.get('/user/:id', (req, res, next) => {
  const paramId = req.params.id,
    errorHandler = () => next(new HttpError(404, 'User not found'));
  let id;

  if (ObjectId.isValid(paramId)) {
    id = new ObjectId(paramId);
  } else {
    return errorHandler();
  }

  User.findById(id, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return errorHandler();
    }
    res.json(user);
  });
});

module.exports = router;*/

const router = require('express').Router(),
      checkAuth = require('middleware/checkAuth');

router.get('/', require('./frontpage').get);

router.get('/login', require('./login').get);
router.post('/login', require('./login').post);
router.post('/logout', require('./logout').post);

router.get('/chat', checkAuth, require('./chat').get);

module.exports = router;
