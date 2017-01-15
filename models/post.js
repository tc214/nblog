var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, tags, post) {
	this.name = name;
	this.title = title;
	this.tags = tags;
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
		tags : this.tags,
		post: this.post,
		comments: [],
		pv: 0
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
					if (doc.post) {
						console.log(docs);
						doc.post = markdown.toHTML(doc.post);
					}
					
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
                if (err) {
					mongodb.close();
                   	return callback(err);				
				}
	            if (doc) {
		            //pv++
		            collection.update({
			            "name": name,
			            "time.day": day,
			            "title": title
		            }, {
			            $inc: {"pv": 1}
		            }, function (err) {
			            mongodb.close();
			            if (err) {
				            return callback(err);
			            }
		            });
		            //parse markdown to html
					if (doc) {
						doc.post = markdown.toHTML(doc.post);
						doc.comments.forEach(function (comment) {
							comment.content = markdown.toHTML(comment.content);
						});
						callback(null, doc);//return article found
					}
					
	            }
				
				
			});
		});
	});
};

//return content published (markdown format)
Post.edit = function(name, day, title, callback) {
	//open db
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//search according to username,date,title
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title,
			}, function (err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				//return an article found
				callback(null, doc);
			});
		});
	});
};

Post.update = function(name, day, title, post, callback) {
    //open db
    mongodb.open(function (err, db) {
	    if (err) {
		    return callback(err);
	    }
	    //read posts collection
	    db.collection('posts', function(err, collection) {
		    if (err) {
			    mongodb.close();
			    return callback(err);
		    }
		    //update content of the article
		    collection.update({
			    "name": name,
			    "time.day": day,
			    "title": title
		    }, {
			    $set: {post: post}
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

Post.remove = function (name, day, title, callback) {console.log("po-------------");
    //open db
	mongodb.open(function (err, db) {
		if (err) {
            return callback(err);
		}
		//read posts collection
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//search article and remove it according to username,date and title
			collection.remove({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				w: 1
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Post.getArchive = function (callback) {
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
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
                mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

//return all tags
Post.getTags = function (callback) {console.log("tags---------");
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
            if (err) {
	            mongodb.close();
	            return callback(err);
            }
			//find all value of the tag key
			collection.distinct("tags", function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};
//return all article containing special tag key
Post.getTag = function (tag ,callback) {   console.log("tag---------");
	mongodb.open(function (err, db) {
		if (err) {console.log("tag------err---");
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {console.log("tag----0000000-");
				mongodb.close();
				return callback(err);
			}
			collection.find({
				"tags": tag
			}, {
			    "name": 1,
				"time": 1,
				"title": 1
				}).sort({
				time: -1
			}).toArray(function (err, docs) {console.log("tag--------111111111-");
				mongodb.close();
				if (err) {console.log("tag----6666666cess-");
					return callback(err);
				}console.log("tag--------success-");
				callback(null ,docs);
			});
		});
	});
};
//return all info of article searched by title keyword
Post.search =  function (keyword, callback) {console.log("index---post--get");
	mongodb.open(function (err, db) {
		if (err){
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var pattern = new RegExp(keyword, "i");
			collection.find({
				"title": pattern
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}console.log("index---post--get------------999999999999");
				callback(null, docs);
			});
		});
	});
};


