exports.isAuthenticated = function(req, res, next) {
    // Redirect to login if they aren't logged in
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        next();
    }
};
