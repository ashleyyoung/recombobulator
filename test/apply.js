'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')

describe('Apply', function () {

  var recombobulator = new Recombobulator({
    orderIndependentCollections: {}
  })

  it('should modify an array element in the existing db version', function (done) {

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

  it('should modify an array element and default db version to user old version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: ["9"]
    }

    var modifyArrayElement = {
      a: "X",
      b: ["11"]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {}
    })

    var options = {
      userOld: oldClientVersion,
      userNew: modifyArrayElement
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: 'X', 
      b: [ '11'] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })


  it('should modify an object within an array', function (done) {

    let date = "2018-08-14T17:00:59.927"
    let date2 = "2018-08-14T17:10:29.345"

    var oldClientVersion = {
      a: "X",
      b: [
        {
          name: "first",
          date: date
        }
      ]
    }

    var modifyArrayElement = {
      a: "X",
      b: [
        {
          name: "first",
          date: date2
        }
      ]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {}
    })

    var options = {
      userOld: oldClientVersion,
      userNew: modifyArrayElement
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: 'X', 
      b: [
        {
          name: "first",
          date: date2
        }
      ]
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })


  it('should remove an array element from the existing db version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: [9,10]
    }

    var removeArrayElement = {
      a: "X",
      b: [10]
    }

    var rawDBVersion = {
      a: "X",
      b: [
        9,
        10
      ]
    }

    var options = {
      userOld: oldClientVersion,
      userNew: removeArrayElement,
      db: rawDBVersion
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {}
    })

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { a: "X", b: [ 10 ] }
    
    expect( newUpdateDoc ).to.equal( expected )
    done()
  })



  it('should add array elements to the existing db version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: [9]
    }

    var addArrayElement = {
      a: "X",
      b: [
        9,
        11,
        13
      ]
    }

    var rawDBVersion = {
      a: "X",
      b: [
        9,
        10
      ]
    }

    var options = {
      userOld: oldClientVersion,
      userNew: addArrayElement,
      db: rawDBVersion
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: "X", 
      b: [ 9,11,13,10 ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })



  it('should add an array element to the existing db version that has an array of objects', function (done) {

    var oldClientVersionObjectArray = {
      a: "X",
      b: [
        {a: "9"}
      ]
    }

    var addObjectArrayElement = {
      a: "X",
      b: [
        {a: "9"},
        {c: "11"}
      ]
    }

    var rawDBVersionObjectArray = {
      a: "X",
      b: [
        {a: "9"},
        {b: "10"}
      ]
    }

    var options = {
      userOld: oldClientVersionObjectArray,
      userNew: addObjectArrayElement,
      db: rawDBVersionObjectArray
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: "X", 
      b: [ {a:"9"}, {c:"11"}, {b:"10"} ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })



  it('should remove an array element from the existing db version that has an array of objects', function (done) {

    var oldClientVersionObjectArray = {
      a: "X",
      b: [
        {a: "9"}
      ]
    }

    var removeObjectArrayElement = {
      a: "X",
      b: [ ]
    }

    var rawDBVersionObjectArray = {
      a: "X",
      b: [
        {a: "9"},
        {b: "10"}
      ]
    }

    var options = {
      userOld: oldClientVersionObjectArray,
      userNew: removeObjectArrayElement,
      db: rawDBVersionObjectArray
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: "X", 
      b: [ {b:"10"} ] 
    }

    expect( newUpdateDoc ).to.equal( expected )

    done()
  })



  it('should modify an array element on the existing db version that has an array of objects', function (done) {

    var oldClientVersionObjectArray = {
      a: "X",
      b: [
        {a: "9"}
      ]
    }

    var modifyObjectArrayElement = {
      a: "X",
      b: [
        {a: "10"}
      ]
    }


    var rawDBVersionObjectArray = {
      a: "X",
      b: [
        {a: "10"}
      ]
    }

    var options = {
      userOld: oldClientVersionObjectArray,
      userNew: modifyObjectArrayElement,
      db: rawDBVersionObjectArray
    }

    var newUpdateDoc = recombobulator.apply(options)
    
    var expected = { 
      a: "X", 
      b: [ {a:"10"} ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })



  it('should duplicate an array element on the existing db version that has an array of objects', function (done) {


    var rawDBVersionObjectArray = {
      a: "X",
      b: [
        {d: "9"},
        {c: "9"}
      ]
    }

    var oldClientVersionObjectArray = {
      a: "X",
      b: [
        {d: "9"}
      ]
    }

    var duplicateObjectArrayElement = {
      a: "X",
      b: [
        { d: "9" },
        { c: "10" }
      ]
    }

    var options = {
      userOld: oldClientVersionObjectArray,
      userNew: duplicateObjectArrayElement,
      db: rawDBVersionObjectArray
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: "X", 
      b: [ 
        { d: "9" }, 
        { c: "10" },
        { c: "9"}
      ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })

  it('should remove a non-array element from the existing db version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: ["9"]
    }

    var removeNonArrayElement = {
      b: ["9"]
    }


    var rawDBVersion = {
      a: "X",
      b: [
        "9",
        "10"
      ]
    }

    var options = {
      userOld: oldClientVersion,
      userNew: removeNonArrayElement,
      db: rawDBVersion
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      b: [ '9','10' ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })

  it('should modify a non-array element on the existing db version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: ["9"]
    }

    var modifyNonArrayElement = {
      a: "Y",
      b: ["9"]
    }

    var rawDBVersion = {
      a: "X",
      b: [
        "9",
        "10"
      ]
    }

    var options = {
      userOld: oldClientVersion,
      userNew: modifyNonArrayElement,
      db: rawDBVersion
    }

    var newUpdateDoc = recombobulator.apply(options)
    var expected = { a: "Y", b: [ "9","10"] }
    expect( newUpdateDoc ).to.equal( expected )
    done()
  })

  it('should remove a non-array element from the existing db version', function (done) {

    var oldClientVersion = {
      a: "X",
      b: ["9"]
    }

    var addNonArrayElement = {
      a: "X",
      b: ["9"],
      c: "CaCaw"
    }

    var rawDBVersion = {
      a: "X",
      b: [
        "9",
        "10"
      ]
    }

    var options = {
      userOld: oldClientVersion,
      userNew: addNonArrayElement,
      db: rawDBVersion
    }

    var newUpdateDoc = recombobulator.apply(options)
    var expected = { a: "X", b: [ "9","10"], c: "CaCaw" }
    expect( newUpdateDoc ).to.equal( expected )
    done()
  })


  it('should reattach the missing rawDB fields to the payload and patch the rawDb doc with only the fields changed in the payload', function (done) {
    
    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' }
      }
    })

    var rawDb = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating'
      }],
      personalData: {
        id: '123',
        address: 'Colorado'
      }
    }

    var userOld = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating'
      }]
    }

    var userNew = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'submitted'
      }]
    }

    var expected = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'submitted'
      }],
      personalData: {
        id: '123',
        address: 'Colorado'
      }
    }

    var options = {
      userOld: userOld,
      userNew: userNew,
      db: rawDb
    }

    var newUpdateDoc = recombobulator.apply(options)
    expect(newUpdateDoc).to.equal(expected)
    done()
  })


  it('should result in a replace operation when the document has a reordered array within a reordered array with a modified element and the result should contain missing rawDb fields not found in the user version', function (done) {  

    var rawDb = {
   
      collection: [
      {
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          names: [
            {
              nameType: 'firstName',
              nameValue: 'Cary',
              phone: '123'
            },
            {
              nameType: 'lastName',
              nameValue: 'Jenkins',
              phone: '222'
            }
          ]
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }],
      personalData: {
        id: '123',
        address: 'Colorado'
      }
    }

    var userOld = {
   
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          names: [
            {
              nameType: 'firstName',
              nameValue: 'Cary'
            },
            {
              nameType: 'lastName',
              nameValue: 'Jenkins'
            }
          ]
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }]
    }

    var userNew = {
   
      collection: [{
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      },{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          names: [
            {
              nameType: 'lastName',
              nameValue: 'Persephone'
            },
            {
              nameType: 'firstName',
              nameValue: 'Cary'
            }
          ]        
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
        'collection.nestedCollection': { key: 'id' },
        'collection.nestedCollection.names': {key: 'nameType'} 
      }
    })

    var expected = {
   
      collection: [
      {
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          names: [
            {
              nameType: 'firstName',
              nameValue: 'Cary',
              phone: '123'
            },
            {
              nameType: 'lastName',
              nameValue: 'Persephone',
              phone: '222'
            }
          ]
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }],
      personalData: {
        id: '123',
        address: 'Colorado'
      }
    }

    var options = {
      userOld: userOld,
      userNew: userNew,
      db: rawDb
    }

    var newUpdateDoc = recombobulator.apply(options)
    expect(newUpdateDoc).to.equal(expected)
    done()
  })


  it('should ignore paths that match the provided "ignore" regex', function (done) {

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
      db: rawDBVersion,
      ignore: /\/b\//  //ignore patch path if it has /b/ in it 
    }

    var newUpdateDoc = recombobulator.apply(options)

    var expected = { 
      a: 'X', 
      b: [ '9', '10' ] 
    }

    expect( newUpdateDoc ).to.equal( expected )
    done()
  })



})
