var mongodb = require('./db');

function Comment(name, day, title, comment) {
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
}

module.exports = Comment;

//save a msg of
Comment.prototype.save = function (callback) {  console.log("callback-------");
	var name = this.name,
		day = this.day,
		title = this.title,
		comment = this.comment;  console.log(name);  console.log(comment);
	//open db
	mongodb.open(function (err, db) {console.log("db open");
		if (err) {  console.log("-----------0 ");
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function (err, collection) {  console.log("-----------1");console.log(collection);
			if (err) {console.log("-----------2");
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
			}, function (err) {  console.log("-----------3");
				mongodb.close();
				if (err) {console.log("-----------4");
					return callback(err);
				}console.log("-----------5");
				callback(null);
			});
		});
	});
};