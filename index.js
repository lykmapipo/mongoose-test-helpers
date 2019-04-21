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


/* setup test environment */
process.env.NODE_ENV = 'test';
process.env.DEBUG = true;


/* dependencies */
const _ = require('lodash');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { parallel } = require('async');
const {
  connect: _connect,
  isInstance,
  isModel,
  disconnect,
  clear,
  drop,
  model,
  Schema
} = require('@lykmapipo/mongoose-common');


/* setup sinon */
require('chai').use(require('sinon-chai'));
require('sinon-mongoose');


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

  // establish mongoose connection
  _connect(_url, _done);

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
exports.disconnect = disconnect;


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
exports.clear = clear;


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
exports.drop = drop;


/**
 * @function create
 * @name create
 * @description Persist given model instances
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * create(user, done);
 * create(user, profile, done);
 * create(user, profile, done);
 */
exports.create = function create(...instances) {

  // collect provided instances
  let _instances = [].concat(...instances);

  // obtain callback
  const _done = _.last(_.filter([..._instances], function (instance) {
    return !isInstance(instance);
  }));

  // collect actual model instances
  _instances = _.filter([..._instances], function (instance) {
    return isInstance(instance);
  });

  // compact and ensure unique instances by _id
  _instances = _.uniqBy(_.compact([..._instances]), '_id');

  // map instances to save
  // TODO for same model use insertMany
  const connected =
    (mongoose.connection && mongoose.connection.readyState === 1);
  let saves = _.map([..._instances], function (instance) {
    if (connected && instance.save) {
      return function save(next) {
        const fn = (instance.post || instance.save);
        fn.call(instance, function afterSave(error, saved) {
          next(error, saved);
        });
      };
    }
  });

  // compact saves
  saves = _.compact([...saves]);

  // save
  parallel(saves, _done);

};


/**
 * @function createTestModel
 * @name createTestModel
 * @description Create a test model for testing
 * @param {Object} [schema] model schema definition
 * @param {...Function} [plugins] list of plugins to apply to schema
 * @return {Model} valid mongoose model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.4.0
 * @version 0.1.0
 * @example
 * 
 * const User = createTestModel();
 * const User = createTestModel({ name: { type: String } }, autopopulate);
 * 
 */
exports.createTestModel = function createTestModel(schema, ...plugins) {
  // ensure schema definition
  const definition = _.merge({}, {
    name: { type: String, searchable: true, index: true, fake: true }
  }, schema);

  // create schema
  const testModelSchema = new Schema(definition, { timestamps: true });

  // apply plugins
  _.forEach([...plugins], function (plugin) {
    testModelSchema.plugin(plugin);
  });

  // register dynamic model
  const testModel = model(testModelSchema);

  // return created model
  return testModel;
};


/**
 * @function mockModel
 * @name mockModel
 * @description Mock existing mongoose model
 * @param {Model} model valid mongoose model
 * @return {Object} valid mock of provided mongoose model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.5.0
 * @version 0.1.0
 * @example
 * 
 * const Mock = mockModel('User');
 * const Mock = mockModel(User);
 *
 * Mock.expects('find').chain('exec').yields(null, [{...}]);
 *
 * User.find((error, results) => {
 *   Mock.verify()
 *   Mock.restore()
 *   // assertions
 *   done(error, results);
 *  });
 * 
 */
exports.mockModel = model => {
  const mocked = isModel(model) ? sinon.mock(model) : undefined;
  return mocked;
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
 * const User = model('User');
 */
exports.getModel = model;
exports.model = model;