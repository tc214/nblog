var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
	this.name = name;
	this.title = title;
	this.post = post;
}

module.exports = Post;

//save a paper and info
Post.prototype.save = function (callback) {
	var date = new Date();
	//save some time format
	var time = {
		date:  date,
		year:  date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
	    day:   date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute:date.getFullYear() + "-" + (date.getMonth() + 1) + "-" +
			date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}

	// word to save
	var post = {
		name: this.name,
		time: time,
		title:this.title,
		post: this.post
	};
	//open DB
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//insert word into posts collection
			collection.insert(post, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//read article and it's info
Post.getAll = function (name, callback) {
	//open db
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//read post collection
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (name) {
				query.name = name;
			}
			//search article according to query
			collection.find(query).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				//parse markdown to html
				docs.forEach(function (doc) {
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null, docs);
			});
		});
	});
};

Post.getOne = function(name, day, title, callback) {
	//open db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function(err, collection) {
			if (err) {
               mongodb.close();
			   return callback(err);
		    }
			//search article according to user name, article name and date
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                   	return callback(err);				
				}
				//parse markdown to html
				doc.post = markdown.toHTML(doc.post);
				callback(null, doc);//return article found
			});
		});
	});
};