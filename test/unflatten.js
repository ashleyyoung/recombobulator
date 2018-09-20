'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')
var moment        = require('moment')

describe('Unflatten', function () {

  it('should unflatten an array and a nested array when given key/value pairs for the arrays at each level', function (done) {
    
    var flattened = {
      cats: {
        'xxx-yyy-zzz': {
          catId: 'xxx-yyy-zzz',
          toys: {
          '9': {
            toyId: 9,
            name: 'whatever'
            }
          }
        }
      },
      dogs: {
        'aaa': {
          dogId: 'aaa',
          bones: {
            '6': {
              boneId: 6,
              name: 'cronut'
            },
            '7': {
              boneId: 7,
              name: 'pine needle'
            }
          }
        }
      },
      playDates: [{
        notes: {
          '9': {
            noteId: 9,
            message: 'hello'
          }, 
          '10': {
            noteId: 10,
            message: 'hello again'
          }
        }
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'cats': { key: 'catId' },
        'cats.toys': { key: 'toyId' },
        'dogs': { key: 'dogId' },
        'dogs.bones': { key: 'boneId' },
        'playDates.notes': {key: 'noteId' } 
      }
    })

    var unflattened = recombobulator.unflatten({
      obj: flattened
    })
    
    var expected = {
      cats: [{
        catId: 'xxx-yyy-zzz',
        toys: [{
          toyId: 9,
          name: 'whatever'
        }]
      }],
      dogs: [{
        dogId: 'aaa',
        bones: [{
          boneId: 6,
          name: 'cronut'
        },
        {
          boneId: 7,
          name: 'pine needle'
        }
        ]
      }],
      playDates: [{
        notes: [{
          noteId: 9,
          message: 'hello'
        }, {
          noteId: 10,
          message: 'hello again'
        }]
      }]
    }

    expect(unflattened).to.equal(expected)
    done()
  })


  it('should unflatten an array and a nested array when given key/value pairs for the arrays at each level', function (done) {
    
    var date = new Date()

    var flattened = {
      cats: {
        [date]: {
          birthDate: date
        }
      }
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'cats': { key: 'birthDate' }
      }
    })

    var unflattened = recombobulator.unflatten({
      obj: flattened
    })
    
    var expected = {
      cats: [{
        birthDate: date
      }]
    }

    expect(unflattened).to.equal(expected)
    done()
  })


  it('should unflatten an object keyed on date strings and convert valid date strings to dates', function (done) {
    
    var date = new Date()
    date = moment(date).toISOString()

    var flattened = {
      cats: {
        [date]: {
          birthDate: date,
          name: "Kitty"
        }
      }
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'cats': { key: 'birthDate' }
      }
    })

    var unflattened = recombobulator.unflatten({
      obj: flattened
    })
    
    var expected = {
      cats: [{
        birthDate: date,
        name: "Kitty"
      }]
    }

    expect(unflattened).to.equal(expected)
    done()
  })


  it('should unflatten an object keyed on date strings and convert valid date strings to dates when a specific dateFormat is provided', function (done) {
    
    var date = "2018-08-14T21:17:42Z"

    var flattened = {
      cats: {
        [date]: {
          birthDate: date,
          name: "Ada"
        }
      }
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'cats': { key: 'birthDate' }
      }
    })

    var unflattened = recombobulator.unflatten({
      obj: flattened
    })
    
    var expected = {
      cats: [{
        birthDate: date,
        name: "Ada"
      }]
    }

    expect(unflattened).to.equal(expected)
    done()
  })

})