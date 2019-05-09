'use strict';


/* dependencies */
const {
  expect,
  connect,
  create,
  clear,
  createTestModel
} = require('..');


describe('use case', () => {

  const User = createTestModel();

  before(done => connect(done));

  beforeEach(done => User.fake().save(done));

  it('should be able to clear using provided models', done => {
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

  it('should be able to clear using provided model names', done => {
    clear(User.modelName, (error) => {
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

  it('should be able to clear all models', done => {
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

  it('should be able to create models', done => {
    const a = User.fake();
    const b = User.fake();
    create(a, b, (error, results) => {
      const [a, b] = results;
      expect(error).to.not.exist;
      expect(a).to.exist;
      expect(b).to.exist;
      done(error, results);
    });
  });

  it('should be able to create models', done => {
    const a = User.fake();
    const b = User.fake();
    create([a, b], (error, results) => {
      const [a, b] = results;
      expect(error).to.not.exist;
      expect(a).to.exist;
      expect(b).to.exist;
      done(error, results);
    });
  });

  after(done => clear(done));
});