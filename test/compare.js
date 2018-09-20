'use strict'

var Code          = require('code')
var Lab           = require('lab')
var lab           = exports.lab = Lab.script()
var describe      = lab.describe
var it            = lab.it
var expect        = Code.expect
var Recombobulator = require('../lib/index.js')
var jsonPatch     = require('fast-json-patch')

describe('Compare', function () {


  it('should not have a patch result when the document has the same array data in a different order', function (done) {
    
    var before = {
      character: {
        name: 'Johhny'
      },
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }]
    }

    var changedOrder = {
      character: {
        name: 'Johhny'
      },
      collection: [{
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      },{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
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

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)
    expect(compareResult.length === 0).to.equal(true)
    done()
  })


  it('should result in an add operation when the document has a reordered array with a modified element', function (done) {
    
    var before = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }]
    }

    var changedOrder = {
      collection: [{
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      },{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whatever',
          color: 'blue'
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
        'collection.nestedCollection': { key: 'id' } 
      }
    })

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)

    var patch = [ { op: 'add',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/color',
      value: 'blue' } ]

    expect(jsonPatch.compare(compareResult, patch).length === 0).to.equal(true)
    done()

  })



  it('should result in a remove operation when the document has a reordered array with a modified element', function (done) {
    
    var before = {
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }]
    }

    var changedOrder = {
      collection: [{
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      },{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
        'collection.nestedCollection': { key: 'id' } 
      }
    })

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)

    var patch = [ { op: 'remove',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/name',
    } ]

    expect(jsonPatch.compare(compareResult, patch).length === 0).to.equal(true)
    done()

  })


  it('should result in a replace operation when the document has a reordered array with a modified element', function (done) {
    
    var before = {
   
      collection: [{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whatever'
        }]
      }, {
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      }]
    }

    var changedOrder = {
   
      collection: [{
        collectionId: 'aaa-bbb-ccc',
        status: 'submitted'
      },{
        collectionId: 'xxx-yyy-zzz',
        status: 'negotiating',
        nestedCollection: [{
          id: 9,
          name: 'whoever'
        }]
      }]
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' },
        'collection.nestedCollection': { key: 'id' } 
      }
    })

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)
    
    var patch = [ { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/name',
      value: 'whoever'
    } ]

    expect(jsonPatch.compare(compareResult, patch).length === 0).to.equal(true)
    done()

  })



  it('should result in a replace operation when the document has a reordered array within a reordered array with a modified element', function (done) {
    
    var before = {
   
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

    var changedOrder = {
   
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
              nameType: 'firstName',
              nameValue: 'Cary'
            },
            {
              nameType: 'lastName',
              nameValue: 'Persephone'
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

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)
    var patch = [ { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/names/lastName/nameValue',
      value: 'Persephone'
    } ]

    expect(jsonPatch.compare(compareResult, patch).length === 0).to.equal(true)
    done()

  })


  it('should result in an INCORRECT patch operation when the document has a reordered array within a reordered array IF there is NO collection key provided in the options', function (done) {
    
    var before = {
   
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

    var changedOrder = {
   
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
              nameValue: 'Jenkins'
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
        'collection.nestedCollection': { key: 'id' }
      }
    })

    var options = {
      oldObj: before,
      newObj: changedOrder
    }

    var compareResult = recombobulator.compare(options)

    var patch = [ { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/names/1/nameValue',
      value: 'Cary' },
    { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/names/1/nameType',
      value: 'firstName' },
    { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/names/0/nameValue',
      value: 'Jenkins' },
    { op: 'replace',
      path: '/collection/xxx-yyy-zzz/nestedCollection/9/names/0/nameType',
      value: 'lastName' } ]

    expect(jsonPatch.compare(compareResult, patch).length === 0).to.equal(true)
    done()

  })


  it('should not have a patch result when the comparing 2 docs with the same date', function (done) {
    
    var date = new Date();

    var before = {
      character: {
        name: 'Johhny'
      },
      date: date
    }

    var same = {
      character: {
        name: 'Johhny'
      },
      date: date
    }

    var recombobulator = new Recombobulator({
      orderIndependentCollections: {}
    })

    var options = {
      oldObj: before,
      newObj: same
    }

    var compareResult = recombobulator.compare(options)
    expect(compareResult.length === 0).to.equal(true)
    done()
  })



})