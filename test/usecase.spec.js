'use strict';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {
  connect,
  create,
  clear,
  drop,
  model
} = require(path.join(__dirname, '..'));


describe('use case', () => {

  const User = model('User', new Schema({ name: String }));
  before(done => connect(done));
  beforeEach(done => User.create({ name: 'Test User' }, done));

  it('should be able to clear using provided models', (done) => {
    clear(User, (error) => {
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

  it('should be able to clear using provided model names', (done) => {
    clear('User', (error) => {
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

  it('should be able to clear all models', (done) => {
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

  it('should be able to create models', (done) => {
    const a = new User({ name: 'A' });
    const b = new User({ name: 'B' });
    create(a, b, (error, results) => {
      const [a, b] = results;
      expect(error).to.not.exist;
      expect(a).to.exist;
      expect(b).to.exist;
      done(error, results);
    });
  });

  it('should be able to create models', (done) => {
    const a = new User({ name: 'A' });
    const b = new User({ name: 'B' });
    create([a, b], (error, results) => {
      const [a, b] = results;
      expect(error).to.not.exist;
      expect(a).to.exist;
      expect(b).to.exist;
      done(error, results);
    });
  });

  after(done => drop(done));
});