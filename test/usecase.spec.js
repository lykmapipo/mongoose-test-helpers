'use strict';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {
  connect,
  clear,
  drop,
  model
} = require(path.join(__dirname, '..'));


describe('use case', () => {

  const User = model('User', new Schema({ name: String }));
  before(done => connect(done));
  before(done => User.create({ name: 'Test User' }, done));

  it('should be able to clear all', (done) => {
    clear((error) => {
      if (error) {
        done(error);
      } else {
        setTimeout(() => {
          User.countDocuments((error, counts) => {
            expect(counts).to.equal(0);
            done(error, counts);
          });
        }, 1000);
      }
    });
  });

  after(done => drop(done));
});