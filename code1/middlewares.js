function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

module.exports = {
  isAuthenticated,
};
