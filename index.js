'use strict';


/**
 * @module mongoose-test-helpers
 * @description Re-usable test helpers for mongoose
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @license MIT
 * @example
 * 
 * const { setup, clear, drop } = require('@lykmapipo/mongoose-test-helpers');
 * before(done => { setup(done) });
 * after(done => { clear(done) });
 * after(done => { drop(done) });
 * 
 */


/* setup test environment */
process.env.NODE_ENV = 'test';
process.env.DEBUG = true;
process.env.MONGODB_URI = 'mongodb://localhost/test';


/* dependencies */
const _ = require('lodash');
const { chai, faker, sinon, expect } = require('@lykmapipo/test-helpers');
const { parallel } = require('async');
const {
  connect: _connect,
  isConnected,
  isInstance,
  isModel,
  disconnect,
  clear,
  drop,
  model,
  createModel,
  enableDebug,
  disableDebug
} = require('@lykmapipo/mongoose-common');
const mongooseFaker = require('@lykmapipo/mongoose-faker');


/* setup sinon mongoose */
require('./lib/sinon_mongoose');


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
 * 
 * connect(done);
 * connect(<url>, done);
 * 
 */
exports.connect = (url, done) => {
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
 * 
 * disconnect(done);
 * 
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
 * 
 * clear('User', 'Profile', done);
 * clear(done);
 * 
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
 * 
 * drop(done);
 * 
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
 * 
 * create(user, done);
 * create(user, profile, done);
 * create(user, profile, done);
 * 
 */
exports.create = (...instances) => {

  // collect provided instances
  let _instances = [].concat(...instances);

  // obtain callback
  const _done = _.last(_.filter([..._instances], instance => {
    return !isInstance(instance);
  }));

  // collect actual model instances
  _instances = _.filter([..._instances], instance => {
    return isInstance(instance);
  });

  // compact and ensure unique instances by _id
  _instances = _.uniqBy(_.compact([..._instances]), '_id');

  // map instances to save
  // TODO for same model use insertMany
  const connected = isConnected();
  let saves = _.map([..._instances], instance => {
    if (connected && instance.save) {
      const save = next => {
        const fn = (instance.post || instance.save);
        fn.call(instance, (error, saved) => {
          next(error, saved);
        });
      };
      return save;
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
exports.createTestModel = (schema, ...plugins) => {
  // ensure schema definition
  const definition = _.merge({}, {
    name: {
      type: String,
      index: true,
      searchable: true,
      taggable: true,
      fake: f => f.name.findName()
    }
  }, schema);

  // obtain options
  const options = _.first([...plugins], _.isPlainObject);

  // register dynamic model
  const testModel = createModel(
    definition, { timestamps: true, ...options },
    ..._.filter([...plugins, mongooseFaker], _.isFunction)
  );

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
 * const Mock = mockModel(User);
 * const find = Mock.expects('find').yields(null, [{...}]);
 *
 * User.find((error, results) => {
 *   Mock.verify();
 *   Mock.restore();
 *   expect(find).to.have.been.calledOnce;
 *   expect(error).to.not.exist;
 *   expect(results).to.exist;
 *   expect(results).to.have.have.length(1);
 *   done(error, results);
 *  });
 * 
 */
exports.mockModel = model => {
  const mocked = isModel(model) ? sinon.mock(model) : undefined;
  return mocked;
};


/**
 * @function mockInstance
 * @name mockInstance
 * @description Mock provided model instance
 * @param {Object} instance valid model instance
 * @return {Object} valid mock of provided model instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.5.0
 * @version 0.1.0
 * @example
 * 
 * const mock = mockInstance(new User());
 * const save = mock.expects('save').yields(null, {...});
 *
 * user.save((error, results) => {
 *   Mock.verify();
 *   Mock.restore();
 *   expect(save).to.have.been.calledOnce;
 *   expect(error).to.not.exist;
 *   expect(result).to.exist;
 *   done(error, results);
 *  });
 * 
 */
exports.mockInstance = instance => {
  const mocked = isInstance(instance) ? sinon.mock(instance) : undefined;
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
 * 
 * const User = getModel('User');
 * const User = model('User');
 * 
 */
exports.getModel = model;
exports.model = model;


/* shortcuts */
exports.enableDebug = enableDebug;
exports.disableDebug = disableDebug;
exports.faker = faker;
exports.sinon = sinon;
exports.chai = chai;
exports.expect = expect;
