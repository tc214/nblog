var mongodb = require('./db');

function Comment(name, day, title, comment) {
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
}

module.exports = Comment;

//save a msg of
Comment.prototype.save = function (callback) {
	var name = this.name,
		day = this.day,
		title = this.title,
		comment = this.comment;
	//open db
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
			//search word and add comment obj to comments of it
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$push: {"comments": comment}
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