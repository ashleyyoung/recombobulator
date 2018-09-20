'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')

describe('Get Changes', function () {

  it('should get the update doc indicating the changes between the original version and the final version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: ["9"]
    }

    var modifyArrayElement = {
      a: "X",
      b: ["11"]
    }

    var rawDBVersion = {
      a: "X",
      b: [
        "9",
        "10"
      ]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {}
    })

    var options = {
      userOld: oldClientVersion,
      userNew: modifyArrayElement,
      db: rawDBVersion
    }


    var newUpdateDoc = recombobulator.apply(options)
    var expected = { 
      a: 'X', 
      b: [ '11', '10' ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })

})