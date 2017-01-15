// var express = require('express');
// var router = express.Router();
//
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment');


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
            tags = [req.body.tag1, req.body.tag2, req.body.tag3], 
            post = new Post(currentUser.name, req.body.title, tags, req.body.post);console.log(tags);
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

    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('archive', {
                title: 'archive',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    
    app.get('/tags', function (req, res) {console.log("tag----index-----");
        Post.getTags(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tags', {
                title: 'tag',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    
    app.get('/tags/:tag', function (req, res) {console.log("tags----index-----");
        Post.getTag(req.params.tag, function (err, posts) {console.log("tags---back----");
            if (err) {    console.log("tags----ierr----");
                req.flash('error', err);
                return res.redirect('/');
            } console.log(req.params.tag);
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });console.log("tags---sssss----");
        });
    });

    app.get('/links', function (req, res) {
        res.render('links', {
            title: "friendly links",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });    
    });
    
    app.get('/search', function (req, res) {  console.log("index--------get");
        Post.search(req.query.keyword, function (err, posts) {console.log("index--------getback");
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }console.log("index--------gesssssssssst");console.log(req.query.keyword);console.log(posts);
            res.render('search', {
                title: "SEARCH:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
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
		Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post) {
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
    app.post('/us/:name/:day/:title', function (req, res) { 
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " "+
                    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };                             
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {  
           if (err) {  
               req.flash('error', err);
               return res.redirect('back');
           }  
            req.flash('success', 'comment success!');
            res.redirect('back');
        });
    });
	 
    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function(req, res) {
        var currentUser  = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function(err ,post) {
            if (err) {
                req.flash('error', err);
            }
            res.render('edit', {
                title: 'edit',
                post:  post,
                user:  req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/us/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                //error, return to article page
                return res.redirect(url);
            }
            req.flash('success', 'Modify success!');
            res.redirect(url);
        });
    });

    app.get('/remove/:name/:day/:title', checkLogin);console.log("gg---------------");
    app.get('/remove/:name/:day/:title', function (req, res) {console.log("00---------------");
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }console.log("-----------------");
            req.flash('success', 'delete success!');
            res.redirect('/');
        });
    });

    app.use(function (req, res) {console.log("--------404---------");
        res.render("404");
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
