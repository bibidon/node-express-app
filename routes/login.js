const async = require('async'),
  User = require('models/user').User,
  HttpError = require('error').HttpError;

exports.get = function(req, res) {
  res.render('login');
};

exports.post = function(req, res, next) {
  const username = req.body.username,
    password = req.body.password;

  async.waterfall([
    (callback) => User.findOne({username: username}, callback),
    (user, callback) => {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          next(new HttpError(403, 'Invalid password'));
        }
      } else {
        const user = new User({username: username, password: password});
        user.save((err) => {
          if (err) return next(err);
          callback(null, user);
        });
      }
    }
  ], (err, user) => {
    if (err) return next(err);
    req.session.user = user.id;
    res.send({});
  });
};
