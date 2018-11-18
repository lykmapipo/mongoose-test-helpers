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
const mongoose = require('mongoose');


/**
 * @function setup
 * @name setup
 * @alias open
 * @alias connect
 * @param {String} [url] valid mongodb conenction string. if not provided it 
 * will be obtained from process.env.MONGODB_URI
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object|Error} valid instance mongoose or error
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * setup(done);
 * setup(<url>, done);
 */
exports.open = exports.connect = exports.setup = function setup(url, done) {

  // normalize arguments
  const _url = _.isFunction(url) ? undefined : process.env.MONGODB_URI;
  const _done = _.isFunction(url) ? url : done;

  // connection options
  const _options = { useNewUrlParser: true };

  // establish mongoose connection
  mongoose.connect(_url, _options, _done);

};