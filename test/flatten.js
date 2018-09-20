'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')
var moment        = require('moment')

describe('Flatten', function () {


  it('should flatten an array when given a key/value for the array', function (done) {
      
    var notFlattened = {
      collection: [{
        collectionId: 'xxx-yyy-zzz'
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' }
      }
    })

    var flattened = recombobulator.flatten({
      obj: notFlattened
    })

    var expected = {
      collection: {
        'xxx-yyy-zzz': {
          collectionId: 'xxx-yyy-zzz'
        }
      }
    }

    expect(flattened).to.equal(expected)
    done()
  })


  it('should flatten an array and a nested array when given key/value pairs for the arrays at each level', function (done) {
    
    var notFlattened = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
        'collection.nestedCollection': { key: 'id' } 
      }
    })

    var flattened = recombobulator.flatten({
      obj: notFlattened
    })

    var expected = {
      collection: {
        'xxx-yyy-zzz': {
          collectionId: 'xxx-yyy-zzz',
          nestedCollection: {
          '9': {
            id: 9,
            name: 'whatever'
            }
          }
        },

      }
    }

    expect(flattened).to.equal(expected)
    done()
  })

  it('should flatten an array with a date for a collection key', function (done) {
    
    var date = new Date();

    var notFlattened = {
      collection: [{
        date: date
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'date' }
      }
    })

    var flattened = recombobulator.flatten({
      obj: notFlattened
    })

    console.log('FLATTENED: ', flattened)

    var expected = {
      collection: {
        [moment(date).toISOString()]: {
          date: moment(date).toISOString()
        }
      }
    }
    
    expect(flattened).to.equal(expected)
    done()
  })



  it('should NOT flatten a nested array when NOT given key/value pairs for the nested array', function (done) {
    
    var notFlattened = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
      }
    })

    var flattened = recombobulator.flatten({
      obj: notFlattened
    })

    var expected = {
      collection: {
        'xxx-yyy-zzz': {
          collectionId: 'xxx-yyy-zzz',
          nestedCollection: [{
            id: 9,
            name: 'whatever'
          }]
        }
      }
    }

    expect(flattened).to.equal(expected)
    done()
  })

})