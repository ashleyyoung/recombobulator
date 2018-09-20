var jsonPatch = require('fast-json-patch')
var hoek = require('hoek')
var moment = require('moment')

class JSONPatchRecombobulator {


	/*
	* params: options.orderIndependentCollections
	
	* orderIndependentCollections: Used for flattening/unflattening. (Required)

	* Initializes class with orderIndependentCollections for flattening/unflattening

	 Ex:
	  var recombobulator = new Recombobulator({
      orderIndependentCollections: {
        'collection': { key: 'collectionId' }
      }
    })
	*/
  constructor(options){
    this.options = options
  }


  /*
  * params: options.oldObj, options.newObj

  * options.oldObj: The original object that you want to compare against. (Required)
  * options.newObj: The new object that you want to use to update the old object. (Required)

  * Flattens the old object and new object, then compares the result. 

  * Returns a diff object in the form of a patch doc.
  */
	compare(options) {

		var oldObj = this.flatten({
			obj: options.oldObj
		})

		var newObj = this.flatten({
			obj: options.newObj
		})

		return jsonPatch.compare(oldObj, newObj)
	}


	/*
	* params: options.obj, options.currentLocation

	* options.obj: obj is object you are flattening. When calling this function, you only need to provide obj as an argument. 
	* options.loc: Only used when the function recurses for maintaining the current path.

	* Uses the orderIndependentCollections object to determine what keys to use
	* to flatten arrays into objects. Arrays are transformed into objects by creating
	* objects out of their existing array elements, attaching those elements to their parent, and 
	* uniquely identifying them by a field with a unique value inside the element 
	* which is defined in orderIndependentCollections. 

	* A side effect of flattening is that dates will be stringified in this step in order to do a patch comparison with the output that does not result in
	* a malformed patch.

	 	Ex:

	   collection: [{
        collectionId: 'xxx-yyy-zzz'
      }]

     becomes

     collection: {
        'xxx-yyy-zzz': {
          collectionId: 'xxx-yyy-zzz'
        }
      }

  * Returns a flattened object.
	*/

	flatten(options) {

		var obj = options.obj
		var currentLocation = options.currentLocation

		if (Array.isArray(obj)) {

		  var collectionOptions = this.options.orderIndependentCollections[currentLocation]

		  if(collectionOptions && collectionOptions.key) {

		    obj = obj.reduce((memo, item) => {
		    	var key = moment.isDate(item[collectionOptions.key]) ? moment(item[collectionOptions.key]).toISOString() : `${item[collectionOptions.key]}`
		      memo[key] = this.flatten({
		      	obj: item,
		      	currentLocation: currentLocation
		      })
		      return memo
		    }, {})
		  }
		  else {
		    obj = obj.map(o => {
		      return this.flatten({
		      	obj: o, 
		      	currentLocation: currentLocation
		      })
		    })
		  }
		}
		else if (typeof obj === 'object' && obj !== null) {
		  Object.keys(obj).forEach(k => {
		    obj[k] = this.flatten({
		    	obj: moment.isDate(obj[k]) ? moment(obj[k]).toISOString() : obj[k], 
		    	currentLocation: `${currentLocation ? currentLocation + '.' : ''}${k}`})
		  })
		} 

		return obj
	}


	/*
	* params: options.obj, options.currentLocation

	* options.obj: obj is object you are flattening. When calling this function, you only need to provide obj as an argument. 
	* options.loc: Only used when the function recurses for maintaining the current path.

	* Remodels dates from strings that are modeled with isDate: true in orderIndependentCollections

  * Returns an array or object whose stringified dates have been converted back to real dates
	*/
	remodelDates(options) {

		var obj = options.obj
		var currentLocation = options.currentLocation
		var collectionOptions = this.options.orderIndependentCollections[currentLocation]

		if (Array.isArray(obj)) {
	    obj = obj.map(o => {
	      return this.remodelDates({
	      	obj: o, 
	      	currentLocation: currentLocation
	      })
	    })
		} else if (typeof obj === 'object' && obj !== null) {
		  Object.keys(obj).forEach(k => {
		    obj[k] = this.remodelDates({
		    	obj: obj[k], 
		    	currentLocation: `${currentLocation ? currentLocation + '.' : ''}${k}`})
		  })
		} else if ( collectionOptions && collectionOptions.isDate ) {

			if( Date.parse((obj)) ){
				obj = moment(obj).toDate()
			} else {
				console.log(`"${obj}" is not a valid date, and cannot be parsed.`)
			}
    } 

		return obj
	}

	/*
	* params: options.obj, options.parent

	* options.obj: obj is object you are unflattening. When calling this function, you only need to provide obj as an argument. 
	* options.parent: Only used when the function recurses for maintaining the current path.

	* Reverses the flattening process by pushing objects which were flattened
	* back onto their parent arrays.

		Ex:

			cats: {
        "3000": {
          birthDate: "3000"
        }
      }

      becomes

      cats: [{
        birthDate: "3000"
      }]

  * Returns an unflattened object.
	*/
	unflatten(options){

		var obj    = options.obj
		var parent = options.parent

		if(typeof obj === 'object') {

			var unflattenProp = (prop, path) => {

				var unflattenedLocalCollection = []

				Object.keys(prop).forEach(key => {

					unflattenedLocalCollection.push(this.unflatten({
						obj: prop[key], 
						parent: path
					}))
				})

				return unflattenedLocalCollection
			}

			var unflattenEach = (prop, path) =>{

				prop.forEach(newObj => {

					this.unflatten({
						obj: newObj, 
						parent: path
					})
				})
			}

			for(var property in obj){

				var path = (parent) ? `${parent}.${property}` : property;

				if(this.options.orderIndependentCollections[path] && this.options.orderIndependentCollections[path].key){

					obj[property] = unflattenProp(obj[property], path)
				} 

				else {

					if(Array.isArray(obj[property])){
						unflattenEach(obj[property], path)
					} 

					else if(typeof obj[property] === 'object' && !ArrayBuffer.isView(obj[property])) {

						obj[property] = this.unflatten({
							obj: obj[property], 
							parent: path
						})
					}
				}
			}
		} 		

		return obj;
	}



	/*
	* params: options.userOld, options.userNew, options.db, options.ignore

	* options.userOld: the old version of the object which will be updated
	* options.userNew: the new version of the object with changes which will be used to patch the old version
	* options.db: the version of the old document as it exists in the database
	* options.ignore: a regex which can be provided to skip patching specific patch paths

	* Compares the flattened old and new objects, generates a diff, applies the diff
	* and unflattens the result of applying the diff to the db/original object.
	 
	* Returns a patched object.
	*/
	apply(options) {

		var userOld = options.userOld
		var userNew = options.userNew
		var db      = options.db || userOld
		var ignore  = options.ignore

		var userDiff = this.compare({
			oldObj: hoek.clone(userOld), 
			newObj: hoek.clone(userNew) 
		})

		if(ignore){
			userDiff = userDiff.filter(patch => {
				return !patch.path.match(ignore)
			})
		}

		var flatDb = this.flatten({
			obj: hoek.clone(db)
		})

		jsonPatch.apply(flatDb, userDiff)

		return this.unflatten({
			obj: flatDb
		})
	}



}

module.exports = JSONPatchRecombobulator
