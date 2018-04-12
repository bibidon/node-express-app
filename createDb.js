/*const MongoClient = require('mongodb').MongoClient,
  format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/chat', (err, database) => {
  if (err) {
    throw err;
  }

  const db = database.db('chat'),
    collection = db.collection('test_insert');

  collection.remove((err, affected) => {
    if (err) {
      throw err;
    }

    collection.insert({
      a: 2
    }, (err, docs) => {
      const cursor = collection.find({
        a: 2
      });

      cursor.toArray((err, results) => {
        console.dir(results);
        database.close();
      });
    });
  });
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const schema = mongoose.Schema({
  name: String
});
schema.methods.meow = function() {
  console.log(this.get('name'));
};

const Cat = mongoose.model('Cat', schema),
  kitty = new Cat({
    name: 'testKitty'
  });

console.log(kitty);

kitty
  .save()
  .then(
    kitty => kitty.meow(),
    err => console.log(err)
  )*/

/*const User = require('models/user').User,
  user = new User({
    username: 'Tester2',
    password: 'secret'
  });

user
  .save()
  .then(
    user => User.findOne({username: 'Tester'}, (err, tester) => console.log(tester)),
    err => console.error(err)
  )*/

const mongoose = require('libs/mongoose'),
  async = require('async');

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers
], function(err) {
  console.log(err);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  require('models/user');
  // TODO: deprecated, I think
  async.each(Object.keys(mongoose.models), (name, callback) => {
    mongoose.models[name].ensureIndexes(callback)
  }, callback);
}

function createUsers(callback) {
  const users = [{
    username: 'Vasya',
    password: 'supervasya'
  }, {
    username: 'Petya',
    password: '123'
  }, {
    username: 'admin',
    password: 'thetruehero'
  }];

  async.each(users, (u, callback) => {
    const user = new mongoose.models.User(u);
    user.save(callback);
  }, callback);
}