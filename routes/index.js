// var express = require('express');
// var router = express.Router();
//
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

var crypto = require('crypto'),
    User = require('../models/user.js');
    Post = require('../models/post.js');


module.exports = function(app) {
    app.get('/', function(req, res){
        Post.getAll(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
              title: 'HOME',
              user: req.session.user,
              posts: posts,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
            });
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req, res){
        res.render('reg', {
        title: 'register',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res){
	 
      var name = req.body.name,
          password = req.body.password,
          password_re = req.body['password-repeat'];

        //check the two pwd
      if (password_re != password) {
          req.flash('error', 'The two pass is not same!');
          return res.redirect('/reg');
      }
      console.log(req.body.password);
      //create md5 of pwd
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      var newUser = new User({
          name: req.body.name,
          password: password,
          email: req.body.email
      });
console.log(password);
      //check username exist or not
      User.get(newUser.name, function(err, user){
         if (err) {
             req.flash('error', err);
             return res.redirect('/');
         }

        if (user) {
            req.flash('error', 'username is exist!');
            return res.redirect('/reg');
        }

        //add new username
        newUser.save(function(err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user;
            req.flash('success', 'register success');
            res.redirect('/');
         });
       });
   });

    app.get('/log', checkNotLogin);
    app.get('/log', function(req, res){
        res.render('log', {
            title:'Login',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
     });

    app.post('/log', checkNotLogin);
    app.post('/log', function(req, res){
      //req.flash('errr', '����!');
      //create md5 of pwd
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      //check user exist or not
      User.get(req.body.name, function (err, user) {
          if (!user) {
              req.flash('errr', 'User not exist!');
              return res.redirect('/log');
          } else {
              //check pwd valid
              if (user.password != password) {
                  req.flash('error', 'Password error!');
                  return res.redirect('/log');
              }
              //save user info into session
              req.session.user = user;
              req.flash('success', 'Login success!');
              res.redirect('/');
          }
      })

  });

    app.get('/post', checkLogin);
    app.get('/post', function(req, res){
        res.render('post', {
            title: 'Post',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res){
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', 'Post success');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success', 'Logout success!');
        res.redirect('/');
    });

    app.get('/upload', checkLogin);
    app.get('/upload', function(req, res) {
        res.render('upload', {
            title: 'File upload',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/upload', checkLogin);
    app.post('/upload', function(req, res) {
        req.flash('success', 'File upload success！');
        res.redirect('/upload');
    });

	app.get('/us/:name', function(req, res) {
		//check user exist or not 
		User.get(req.params.name, function(err, user) {
			if (!user) {
				req.flash('error', 'User is not exist!');
				return res.redirect('/');
			}
			//search and return all article of the user
            Post.getAll(user.name, function(err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					posts: posts,
					user:  req.session.user,
					success:req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});
	
	app.get('/us/:name/:day/:title', function(req, res) {
		Post.getOne(req.params.name, req.params.day, req.params.title, function(err,
	post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('article', {
				title: req.params.title,
				post: post,
				user:req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	
    function  checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'The user is not login!');
            res.redirect('/log');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', 'The user has login!');
            res.redirect('back');
        }
        next();
    }
};
