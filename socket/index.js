const config = require('config'),
      cookieParser = require('cookie-parser'),
      async = require('async'),
      sessionStore = require('libs/sessionStore'),
      HttpError = require('error').HttpError,
      User = require('models/user').User;

function loadSession(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (!arguments.length) {
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser(session, callback) {
    if (!session.user) {
        // log.debug('Session %s is anonymous', session.id);
        return callback(null, null);
    }
    // log.debug('retrieving user', session.user);
    User.findById(session.user, (err, user) => {
        if (err) {
            return callback(err);
        }

        if (!user) {
            return callback(null, null);
        }
        // log.debug(`user findById result: ${user}`);
        callback(null, user);
    });
}

module.exports = function (server) {
    const io = require('socket.io').listen(server),
          secret = config.get('session:secret'),
          key = config.get('session:key');
    let handshake,
        parser;

    io.origins('localhost:*');
    io.use((socket, callback) => {
        handshake = socket.handshake;

        async.waterfall([
            callback => {
                parser = cookieParser(secret);
                parser(handshake, {}, function(err) {
                    if (err) return callback(err);

                    loadSession(handshake.signedCookies[key], callback);
                });
            },
            (session, callback) => {
                if (!session) {
                    callback(new HttpError(401, 'No session'));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            (user, callback) => {
                if (!user) {
                    callback(new HttpError(403, 'Anonymous session may not connect'));
                }

                handshake.user = user;
                callback(null);
            },
        ], (err) => {
            if (!err) {
                return callback(null, true);
            }

            if (err instanceof HttpError) {
                return callback(null, false);
            }

            callback(err);
        });
    });

    io.on('connection', socket => {
        const username = socket.handshake.user.username;

        socket.broadcast.emit('join', username);

        socket
            .on('message', (text, cb) => {
                socket.broadcast.emit('message', username, text);
                cb && cb();
            })
            .on('disconnect', () => {
                console.log('a user disconnected');
                socket.broadcast.emit('leave', username);
            });
    });

    return io;
};
