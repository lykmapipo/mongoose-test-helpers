'use strict';


/* dependencies */
const path = require('path');
const expect = require('chai').expect;
const helpers = require(path.join(__dirname, '..'));


describe('helpers', () => {

  it('should expose setup', () => {
    const { setup } = helpers;
    expect(setup).to.exist;
    expect(setup).to.be.a('function');
    expect(setup.name).to.be.equal('setup');
    expect(setup.length).to.be.equal(2);
  });

});