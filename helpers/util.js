const isLoggedIn = function (req, res, next) {
  console.log(req.session)
  if (req.session.user) {
      next()
  } else {
    
      res.redirect('/cover')
  }
}
module.exports = { isLoggedIn }