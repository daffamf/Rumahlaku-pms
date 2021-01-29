
var express = require('express');
var session = require('express-session');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')

module.exports = function (pool) {

  router.get('/',isLoggedIn, function (req, res, next) {
    console.log(req.session.user)
    res.render('index', {
      user: req.session.user
    });
  });  
  router.get('/',isLoggedIn, function (req, res, next) {
    console.log(req.session.user)
    res.render('index', {
      user: req.session.user
    });
  });  

  router.get('/kategori=jual',isLoggedIn, function (req, res, next) {
    console.log(req.session.user)
    res.render('jual', {
      user: req.session.user
    });
  });  


  router.get('/kategori=sewa',isLoggedIn, function (req, res, next) {
    console.log(req.session.user)
    res.render('sewa', {
      user: req.session.user
    });
  });  

  router.get('/upload',isLoggedIn, function (req, res, next) {
    console.log(req.session.user)
    res.render('upload', {
      user: req.session.user
    });
  });  

  router.get('/cover', function (req, res, next) {
    res.render('cover');
  });
  router.get('/login', function (req, res, next) {
    res.render('login');
  });

  router.get('/Detail', function (req, res, next) {
    res.render('Detail');
  });
  router.get('/compere', function (req, res, next) {
    res.render('compere');
  });

  
  router.get('/register', function (req, res, next) {
    res.render('register', { info: req.flash('info') }); //get
  });

  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      res.redirect('/cover')
    })
  });
  

  
  return router
}