'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')
var moment        = require('moment')


//consider implicit date remodeling
describe('Remodel Dates', function () {


  it('should remodel dates as utc dates from strings when given a model with date types', function (done) {
      
    var date = new Date()
    date = moment(date).toISOString()

    var datesArray = {
      dates: [{
        date: date,
        type: 'current date'
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'dates': { key: 'date' },
        'dates.date': { isDate: 'true' }
      }
    })

    var remodeledDates = recombobulator.remodelDates({
      obj: datesArray
    })

    var expected = {
      dates: [
        {
          date: moment(date).toDate(),
          type: 'current date'
        }
      ]
    }

    expect(remodeledDates).to.equal(expected)
    done()
  })

  it('should not remodel dates as utc dates from strings when given a model with date types', function (done) {
      
    var date = new Date()
    date = moment(date).toISOString()

    var datesArray = {
      dates: [{
        date: date,
        type: 'current date'
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'dates': { key: 'date' }
      }
    })

    var remodeledDates = recombobulator.remodelDates({
      obj: datesArray
    })

    var expected = {
      dates: [
        {
          date: date,
          type: 'current date'
        }
      ]
    }

    expect(remodeledDates).to.equal(expected)
    done()
  })

  it('should remodel non-utc dates as utc dates from strings when given a model with date types', function (done) {
      
    var date = "1995-12-25"

    var datesArray = {
      dates: [{
        date: date,
        type: 'current date'
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'dates': { key: 'date' },
        'dates.date': { isDate: 'true' }
      }
    })

    var remodeledDates = recombobulator.remodelDates({
      obj: datesArray
    })

    var expected = {
      dates: [
        {
          date: moment(date).toDate(),
          type: 'current date'
        }
      ]
    }

    expect(remodeledDates).to.equal(expected)
    done()
  })

  it('should not remodel a malformed date even when it has isDate on model', function (done) {
      
    var date = "not a real date"

    var datesArray = {
      dates: [{
        date: date,
        type: 'current date'
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'dates': { key: 'date' },
        'dates.date': { isDate: 'true' }
      }
    })

    var remodeledDates = recombobulator.remodelDates({
      obj: datesArray
    })

    var expected = {
      dates: [
        {
          date: "not a real date",
          type: 'current date'
        }
      ]
    }

    expect(remodeledDates).to.equal(expected)
    done()
  })


})