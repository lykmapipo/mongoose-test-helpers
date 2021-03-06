'use strict';

/* set environment */
process.env.NODE_ENV = 'test';

/* dependencies */
const {
  expect,
  connect,
  disconnect,
  clear,
  drop,
  getModel,
  createTestModel,
  mockModel,
  mockInstance,
  enableDebug,
  disableDebug,
} = require('..');

const MONGODB_URI = 'mongodb://127.0.0.1/test';

describe('mongoose-test-helpers', () => {
  beforeEach((done) => disconnect(done));

  afterEach((done) => drop(done));

  it('should be able to connect', () => {
    expect(connect).to.exist;
    expect(connect).to.be.a('function');
    expect(connect.length).to.be.equal(2);
  });

  it('should be able to disconnect', () => {
    expect(disconnect).to.exist;
    expect(disconnect).to.be.a('function');
    expect(disconnect.length).to.be.equal(2);
  });

  it('should be able to clear', () => {
    expect(clear).to.exist;
    expect(clear).to.be.a('function');
    expect(clear.length).to.be.equal(1);
  });

  it('should be able to get model silent', () => {
    expect(getModel).to.exist;
    expect(getModel).to.be.a('function');
    expect(getModel.length).to.be.equal(3);
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
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
      expect(instance.name).to.be.equal('test');
      done(error, instance);
    });
  });

  it('should be able to connect from process.env.MONGODB_URI', (done) => {
    process.env.MONGODB_URI = MONGODB_URI;
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('test');
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
      year: { type: Number, index: true, fake: true },
    });
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.path('age')).to.exist;
    expect(User.path('year')).to.exist;
  });

  it('should be able to create test model with schema and plugins', () => {
    const User = createTestModel(
      {
        name: { type: String, searchable: true, index: true, fake: true },
        age: { type: Number, index: true, fake: true },
        year: { type: Number, index: true, fake: true },
      },
      function (schema) {
        schema.statics.withTest = function withTest() {};
      }
    );
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.path('age')).to.exist;
    expect(User.path('year')).to.exist;
    expect(User.withTest).to.exist.and.to.be.a('function');
  });

  it('should be able to create mocked model', (done) => {
    const User = createTestModel();
    expect(User).to.exist;

    const Mock = mockModel(User);
    expect(Mock).to.exist;
    expect(Mock.verify).to.exist.and.to.be.a('function');
    expect(Mock.restore).to.exist.and.to.be.a('function');

    const data = [new User({ name: 'Test' })];
    const find = Mock.expects('find').yields(null, data);

    User.find((error, results) => {
      Mock.verify();
      Mock.restore();

      expect(find).to.have.been.calledOnce;
      expect(error).to.not.exist;
      expect(results).to.exist.and.be.eql(data);
      expect(results).to.have.have.length(1);

      done(error, results);
    });
  });

  it('should be able to create mocked instance', (done) => {
    const User = createTestModel();
    expect(User).to.exist;
    const user = new User({ name: 'Test' });
    expect(user).to.exist;

    const mock = mockInstance(user);
    expect(mock).to.exist;
    expect(mock.verify).to.exist.and.to.be.a('function');
    expect(mock.restore).to.exist.and.to.be.a('function');

    const save = mock.expects('save').yields(null, user);

    user.save((error, result) => {
      mock.verify();
      mock.restore();

      expect(save).to.have.been.calledOnce;
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result.name).to.exist.and.be.equal(user.name);

      done(error, result);
    });
  });

  it('should expose mongoose debuggin helpers', () => {
    expect(enableDebug).to.exist;
    expect(enableDebug).to.be.a('function');

    expect(disableDebug).to.exist;
    expect(disableDebug).to.be.a('function');
  });
});
