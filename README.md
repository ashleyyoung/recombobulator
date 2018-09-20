# JSON Recombobulator

JSON Recombobulator is a library for intelligently determining the difference between two JSON objects. 

It was designed to allow partial objects to be sent to an end-user (perhaps for granular security purposes, but the reason isn't important), accept end-user modifications to the incomplete object, and then generate a new document representing the complete original data with user changes properly applied.

In addition to handling partial objects, the recombobulator also prevents changes to the original array item order. If changes to array order are required, then do not use the recombobulator.  

Output from the recombobulator can be used as-is, or it can be combined with a patch document generator (such as fast-json-patch) to create a PATCH document.

## How to Recombobulate

Initialize the recombobulator with an object containing a single property called ```orderIndependentCollections```. 

```orderIndependentCollections``` provides the recombobulator with the information it needs to break down and then restructure the updated object when apply() is called.

Creating the appropriate model to initialize the recombobulator requires crafting an ```orderIndependentCollections``` object. The ```orderIndependentCollections``` object provides the name of the unique identifier (key) in each array element.  

This is not a complete model of the data. Instead, it is just a set of key/value pairs for each array that may appear in the JSON object. The keys are paths to arrays in the document you want to recombobulate, and the values are objects which indicate the field to use in each array element to uniquely identify that element for flattening and unflattening.

#### Sample Recombobulator Initialization

Given an object that looks like this:
```
  var notFlattened = {
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
```

The recombobulator would need to be initialized like this:
```
  var Recombobulator = require('@caa/json-patch-recombobulator')

  var recombobulator = new Recombobulator({
    orderIndependentCollections: {
      'collection': { key: 'collectionId' },
      'collection.nestedCollection': { key: 'id' },
      'collection.nestedCollection.names': {key: 'nameType'} 
    }
  })
```

Once initialized, the recombobulator is invoked via the apply() method.

The apply() function takes a single object as an argument, and this object contains 4 possible properties. 
- ```userOld``` (the original version of the partial JSON object before user changes were made) * Required
- ```userNew``` (the updated version of the partial JSON object incorporating user changes) * Required
- ```db``` (the original version of the complete JSON object as stored in the database)
- ```ignore``` (a regular expression indicating properties to ignore (exclude) from the output)

Example:
```
  var recombobulator = new Recombobulator({
    orderIndependentCollections: {
      'collection': { key: 'collectionId' },
      'collection.nestedCollection': { key: 'id' },
      'collection.nestedCollection.names': {key: 'nameType'} 
    }
  })

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

  var options = {
    userOld: userOld,
    userNew: userNew,
    db: rawDb
  }
  
  console.log(Recombobulator.apply(options))
```

Result:
```
  {
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
```

This result can be used as-is in a database update or (PUT) operation, or as input along with the original rawDb object to generate a diff (PATCH) document with libraries like fast-json-patch https://github.com/Starcounter-Jack/JSON-Patch.

*Please note that the collectionId 'xxx-yyy-zzz' was present in the rawDb version and was restored in the final result, even though it was missing from the userOld and userNew objects.

### How it works

Within the apply() function, the recombobulator creates a diff between the flattened old version of the document which the user is modifying,```userOld```, and the flattened new version of the document which the user has modified, ```userNew```. 

This diff (let's call it diff1) is used to determine what the user acutally intended to update.

If the user provides an argument which contains the version of the original document as it is stored in the database ```db```, the diff between diff1 and this pristine document from the database is generated (we can call it diff2), and a final updated document is produced and unflattened.

Note that during flattening, all arrays specified in orderIndependentCollections are put back into their original order as it exists in the db version (or userOld, if db is not provided) so as not to confuse diff operations.

If a ```db``` option containing the version of the original document as it is stored in the database is provided then it is used as the reference for comparing to diff1.  The diff between diff1 and this pristine reference document from the database is generated, and a final document is produced and unflattened. 

If no ```db``` option is provided then userNew is used as the reference for comparsion to diff1.  The end result would be the same as userNew (unless the ignore option is provided).  Thus, it makes no sense to call apply without providing either ```db``` or ```ignore```.

The ```ignore``` parameter is optional.  It is a regular expression that can be provided to prevent a particular path/paths from being updated.  Any elements in the userNew object that match the specified regular expression path/paths will be ignored. 

Example for how to use ```ignore```:
```
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
  ignore: /\/b\//  
}

var newUpdateDoc = recombobulator.apply(options)

var expected = { 
  a: 'X', 
  b: [ '9', '10' ] 
}
```
The ```ignore``` param tells the recombobulator to look for paths in patch doc elements that match the regex provided, and remove elements of the patch document that do. In the example above where ```/b/``` was provided, the following element was filtered out, leaving an empty patch document. That is why no change was applied.
```
{ 
  op: 'replace', 
  path: '/b/0', 
  value: '11' 
 }
```
Please refer to the tests in /test for more examples.

## Prerequisites

node.js and npm

## Installing

Clone this repository to run locally, or import this module it into an existing project.

## Running the tests

"npm test" from the the index.js level of the project.

