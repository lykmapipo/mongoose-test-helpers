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
// const { waterfall } = require('async');
const mongoose = require('mongoose');
// const { MissingSchemaError } = mongoose.Error;


/**
 * @function connect
 * @name connect
 * @description Opens the default mongoose connection
 * @param {String} [url] valid mongodb conenction string. if not provided it 
 * will be obtained from process.env.MONGODB_URI
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object|Error} valid instance mongoose or error
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
 * @return {Object|Error} valid instance mongoose or error
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
 * @function drop
 * @name drop
 * @description Deletes the given database, including all collections, 
 * documents, and indexes
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object|Error} valid instance mongoose or error
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