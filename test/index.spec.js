'use strict';


/* set environment */
process.env.NODE_ENV = 'test';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const { connect, disconnect, drop } = require(path.join(__dirname, '..'));
const MONGODB_URI = 'mongodb://localhost/mongoose-test-helpers';


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
    expect(disconnect.length).to.be.equal(1);
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
    expect(drop.name).to.be.equal('drop');
    expect(drop.length).to.be.equal(1);
  });

  it('should be able to establish connection on default test db', (done) => {
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('test');
      done(error, instance);
    });
  });

  it('should be able to establish connection on given url', (done) => {
    connect(MONGODB_URI, (error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('mongoose-test-helpers');
      done(error, instance);
    });
  });

  it(
    'should be able to establish connection from process.env.MONGODB_URI',
    (done) => {
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
});