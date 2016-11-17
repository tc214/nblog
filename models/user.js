var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

//save user info
User.prototype.save = function(callback) {
    //word of user to save
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    }

    //open db
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);//error, return err info
        }
        //read users set
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//error,return err info
            }
        
			//insert user info to users set
			collection.insert(user, {
				safe: true
			}, function(err, user){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user[0]);//success! err is null, return word of user after saved
			});
		});
    });
};

//get user info
User.get = function(name, callback) {
    //open db
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //read users set
        db.collection('users', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);;
            }

            //search the word of name
            collection.findOne({
                name: name
            }, function(err, user){
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user);
            });
        });
    });
};
