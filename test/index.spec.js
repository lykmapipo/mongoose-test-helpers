'use strict';


/* set environment */
process.env.NODE_ENV = 'test';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const MONGODB_URI = 'mongodb://localhost/mongoose-test-helpers';
const {
  connect,
  disconnect,
  clear,
  drop,
  getModel,
  createTestModel
} = require(path.join(__dirname, '..'));


describe('mongoose-test-helpers', () => {
  beforeEach(done => disconnect(done));
  afterEach(done => drop(done));

  it('should be able to connect', () => {
    expect(connect).to.exist;
    expect(connect).to.be.a('function');
    expect(connect.name).to.be.equal('connect');
    expect(connect.length).to.be.equal(2);
  });

  it('should be able to disconnect', () => {
    expect(disconnect).to.exist;
    expect(disconnect).to.be.a('function');
    expect(disconnect.name).to.be.equal('disconnect');
    expect(disconnect.length).to.be.equal(2);
  });

  it('should be able to clear', () => {
    expect(clear).to.exist;
    expect(clear).to.be.a('function');
    expect(clear.name).to.be.equal('clear');
    expect(clear.length).to.be.equal(0);
  });

  it('should be able to get model silent', () => {
    expect(getModel).to.exist;
    expect(getModel).to.be.a('function');
    expect(getModel.name).to.be.equal('model');
    expect(getModel.length).to.be.equal(3);
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
    expect(drop.name).to.be.equal('drop');
    expect(drop.length).to.be.equal(2);
  });

  it('should be able to connect on default test db', (done) => {
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('test');
      done(error, instance);
    });
  });

  it('should be able to connect on given url', (done) => {
    connect(MONGODB_URI, (error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('mongoose-test-helpers');
      done(error, instance);
    });
  });

  it('should be able to connect from process.env.MONGODB_URI', (done) => {
    process.env.MONGODB_URI = MONGODB_URI;
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('mongoose-test-helpers');
      delete process.env.MONGODB_URI;
      done(error, instance);
    });
  });

  it('should be able to clear provided models', (done) => {
    clear('User', (error) => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to clear models', (done) => {
    clear((error) => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to create default test model', () => {
    const User = createTestModel();
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
  });

  it('should be able to create default test model with plugins', () => {
    const User = createTestModel({}, function (schema) {
      schema.statics.withTest = function withTest() {};
    });
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.withTest).to.exist.and.to.be.a('function');
  });

  it('should be able to create test model with schema', () => {
    const User = createTestModel({
      name: { type: String, searchable: true, index: true, fake: true },
      age: { type: Number, index: true, fake: true },
      year: { type: Number, index: true, fake: true }
    });
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.path('age')).to.exist;
    expect(User.path('year')).to.exist;
  });

  it('should be able to create test model with schema and plugins', () => {
    const User = createTestModel({
      name: { type: String, searchable: true, index: true, fake: true },
      age: { type: Number, index: true, fake: true },
      year: { type: Number, index: true, fake: true }
    }, function (schema) {
      schema.statics.withTest = function withTest() {};
    });
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.path('age')).to.exist;
    expect(User.path('year')).to.exist;
    expect(User.withTest).to.exist.and.to.be.a('function');
  });

});