exports.post = function(req, res, next) {
    const io = req.app.get('io'), sid = req.session.id, clients = io.of('/').connected;
    let socket;

    req.session.destroy(err => {
        Object.keys(clients).forEach(clientId => {
            socket = clients[clientId];

            if (socket.handshake.session.id == sid) {
                socket.emit('logout');
                socket.disconnect();
            }
        });

        if (err) {
            return next(err);
        }

        res.redirect('/');
    });
};
