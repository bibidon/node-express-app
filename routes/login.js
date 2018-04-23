const User = require('models/user').User,
      HttpError = require('error').HttpError,
      AuthError = require('models/user').AuthError;

exports.get = function (req, res) {
    res.render('login');
};

exports.post = function (req, res, next) {
    const username = req.body.username,
          password = req.body.password;

    User.authorize(username, password, (err, user) => {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        req.session.user = user.id;
        res.send({});
    });
};
