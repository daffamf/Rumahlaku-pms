const isLoggedIn = function (req, res, next) {
  console.log(req.session)
  if (req.session.user) {
      next()
  } else {
      console.log('login')
      res.redirect('/login')
  }
}
module.exports = { isLoggedIn }