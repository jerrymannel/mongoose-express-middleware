# mongoose-express-middleware
Express CRUD middleware for mongoose

[![Build Status](https://travis-ci.org/jerrymannel/mongoose-express-middleware.svg?branch=master)](https://travis-ci.org/jerrymannel/mongoose-express-middleware)
[![Known Vulnerabilities](https://snyk.io/test/github/jerrymannel/mongoose-express-middleware/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jerrymannel/mongoose-express-middleware?targetFile=package.json)

# Quick start

Define your schema and create a new mongose-crud

```js
var definition = {
	"_id": { "type": String },
	"name": { "type": String },
	"description": { "type": String },
	"age" : {"type" : Number}
}

var schema = Mongoose.Schema(definition)
var modelName = "foobar"
var options = {
	collectionName: "foobar",
	defaultFilter: {
		"age": {"$gte": 10}
	}
}

var fooCrud = new MongooseExpressMiddleware(modelName, schema, options)
```

Add the middleware to express

```js
var app = express()
app.use(express.json())

app.post("/foo", fooCrud.create)
app.get("/foo", fooCrud.index)
app.get("/foo/bulkShow", fooCrud.bulkShow)
app.put("/foo/bulkUpdate", fooCrud.bulkUpdate)
app.delete("/foo/bulkDelete", fooCrud.bulkDestroy)
app.get("/foo/:id", fooCrud.show)
app.put("/foo/:id", fooCrud.update)
app.delete("/foo/:id", fooCrud.destroy)

app.listen(8080)
```

# Table of contents

1. [Quick start](#Quick-start)
2. [Constructor](#Constructor)

# Constructor

`var fooCrud = new MongooseExpressMiddleware(modelName, schema, options)`

The constructor takes 3 values, 

* **modelName**(_Required_): Name of the mongoosle model.
* **schema**(_Required_): The schema object returned by `Mongoose.Schema()`
* **options*(_Optional_): An optional options object. This has two properties.
	* _collectionName_: [By default Mongoose uses the pluralized model name as the collection name](https://mongoosejs.com/docs/guide.html#collection). If you wish to override this, then provide your custom collection name here.
	* _defaultFilter_: A default filter to be applied to all `GET` calls.
	* _logger_: A logger object. By default this will use [log4js](https://www.npmjs.com/package/log4js)

# Middlewares

> All middlewares takes in two parameters. An express request object and an express response object

## MongooseExpressMiddleware.create(`req`, `res`)

## MongooseExpressMiddleware.update(`req`, `res`)

## MongooseExpressMiddleware.index(`req`, `res`)

## MongooseExpressMiddleware.show(`req`, `res`)

## MongooseExpressMiddleware.destroy(`req`, `res`)

## MongooseExpressMiddleware.bulkShow(`req`, `res`)

## MongooseExpressMiddleware.bulkUpdate(`req`, `res`)

## MongooseExpressMiddleware.bulkDestroy(`req`, `res`)
