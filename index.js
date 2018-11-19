'use strict';


/**
 * @module mongoose-test-helpers
 * @description Re-usable test helpers for mongoose
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @license MIT
 * @example
 * const { setup, cleanup } = require('@lykmapipo/mongoose-test-helpers');
 * before(done => { setup(done) });
 * after(done => { cleanup(done) });
 */


/* dependencies */
const _ = require('lodash');
const { waterfall } = require('async');
const mongoose = require('mongoose');


/**
 * @function connect
 * @name connect
 * @description Opens the default mongoose connection
 * @param {String} [url] valid mongodb conenction string. if not provided it 
 * will be obtained from process.env.MONGODB_URI
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * connect(done);
 * connect(<url>, done);
 */
exports.connect = function connect(url, done) {

  // ensure test database
  const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost/test');

  // normalize arguments
  const _url = _.isFunction(url) ? MONGODB_URI : url;
  const _done = _.isFunction(url) ? url : done;

  // connection options
  const _options = { useNewUrlParser: true };

  // establish mongoose connection
  mongoose.connect(_url, _options, _done);

};


/**
 * @function disconnect
 * @name disconnect
 * @description Close all mongoose connection
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * disconnect(done);
 */
exports.disconnect = function disconnect(done) {
  mongoose.disconnect(done);
};


/**
 * @function clear
 * @name clear
 * @description Clear provided collection or all if none give
 * @param {String[]|String} modelNames name of models to clear
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * clear('User', 'Profile', done);
 * clear(done);
 */
exports.clear = function clear(...modelNames) {

  // collect provided model names
  let _modelNames = [].concat(...modelNames);

  // obtain callback
  const _done = _.last([..._modelNames]);

  // collect actual model names
  _modelNames = _.dropRight([..._modelNames], 1);

  // collect from mongoose.modelNames();
  if (_.isEmpty(_modelNames)) {
    _modelNames = [...modelNames].concat(mongoose.modelNames());
  }

  // compact and ensure unique model names
  _modelNames = _.uniq(_.compact([..._modelNames]));

  // map modelNames to deleteMany
  let deletes = _.map([..._modelNames], function (modelName) {
    const Model = exports.getModel(modelName);
    if (Model && Model.deleteMany) {
      return function clear(next) {
        Model.deleteMany(function afterDeleteMany(error) {
          next(error);
        });
      };
    }
  });

  // compact deletes
  deletes = _.compact([...deletes]);

  // delete 
  waterfall(_.compact(deletes), _done());

};


/**
 * @function drop
 * @name drop
 * @description Deletes the given database, including all collections, 
 * documents, and indexes
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * drop(done);
 */
exports.drop = function drop(done) {

  // drop database if connection available
  const canDrop =
    (mongoose.connection && mongoose.connection.readyState === 1);
  if (canDrop && mongoose.connection.dropDatabase) {
    mongoose.connection.dropDatabase(function afterDropDatabase(error) {
      // back-off on error
      if (error) {
        done(error);
      }
      // disconnect 
      else {
        exports.disconnect(done);
      }
    });
  }
  // continue
  else {
    // disconnect
    exports.disconnect(done);
  }

};


/**
 * @function getModel
 * @name getModel
 * @description Try obtain already registered
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * const User = getModel('User');
 */
exports.getModel = function getModel(modelName) {

  //try obtain model
  try {
    const Model = mongoose.model(modelName);
    return Model;
  }

  //catch error
  catch (error) {

    //unknown model
    return undefined;

  }

};