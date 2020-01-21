# mongoose-express-middleware
Express CRUD middleware for mongoose

[![Build Status](https://travis-ci.org/jerrymannel/mongoose-express-middleware.svg?branch=master)](https://travis-ci.org/jerrymannel/mongoose-express-middleware)
[![Known Vulnerabilities](https://snyk.io/test/github/jerrymannel/mongoose-express-middleware/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jerrymannel/mongoose-express-middleware?targetFile=package.json)

# Quickstart

Define your schema and create a new mongoose-express-middleware

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

1. [Quickstart](#Quickstart)
2. [Constructor](#Constructor)
3. [Methods](#Methods)
	* [create(`req`, `res`)](#MongooseExpressMiddleware.create(`req`,-`res`))
	* [update(`req`, `res`)](#MongooseExpressMiddleware.update(`req`,-`res`))
	* [index(`req`, `res`)](#MongooseExpressMiddleware.index(`req`,-`res`))
	* [show(`req`, `res`)](#MongooseExpressMiddleware.show(`req`,-`res`))
	* [destroy(`req`, `res`)](#MongooseExpressMiddleware.destroy(`req`,-`res`))
	* [bulkShow(`req`, `res`)](#MongooseExpressMiddleware.bulkShow(`req`,-`res`))
	* [bulkUpdate(`req`, `res`)](#MongooseExpressMiddleware.bulkUpdate(`req`,-`res`))
	* [bulkDestroy(`req`, `res`)](#MongooseExpressMiddleware.bulkDestroy(`req`,-`res`))


# Constructor

`var fooCrud = new MongooseExpressMiddleware(modelName, schema, options)`

The constructor takes 3 values, 

* **modelName**(_Required_): Name of the mongoose model.
* **schema**(_Required_): The schema object returned by `Mongoose.Schema()`
* **options*(_Optional_): An optional options object. This has two properties.
	* _collectionName_: [By default Mongoose uses the pluralised model name as the collection name](https://mongoosejs.com/docs/guide.html#collection). If you wish to override this, then provide your custom collection name here.
	* _defaultFilter_: A default filter to be applied to all `GET` calls.
	* _logger_: A logger object. By default this will use [log4js](https://www.npmjs.com/package/log4js)

# Methods

> All methods in two parameters. An express request object and an express response object

## MongooseExpressMiddleware.create(`req`, `res`)

Create a new document using the data in `req.body`.

E.g. `app.post("/foo", fooCrud.create)`

| Request | Response | Status Code | Condition |
|--|--|--|--|
| JSON | JSON | `200 OK` | Success
| JSON | JSON | `400 Bad Request` | Error in payload
| Array of JSON | Array of JSON | `200 OK` | Success
| Array of JSON | Array of JSON | `207 Multi-Status` | Some of the documents where inserted, some had errors. The response array has the same order of input array.
| Array of JSON | Array of JSON | `400 Bad Request` | All documents in the array had errors.


## MongooseExpressMiddleware.update(`req`, `res`)

Update a single document where the `:id` matches the `_id` of the document

E.g. `app.put("/foo/:id", fooCrud.update)`

## MongooseExpressMiddleware.index(`req`, `res`)

Displays the documents in the collection. URL parameters are used to influence the output generated.

E.g. `app.get("/foo", fooCrud.index)`

The following are URL params are available.

| Param | Type | Description |
|--|--|--|
| `filter` | JSON | Filter condition for the documents. This filter gets merged with _defaultFilter_ if one was defined when the MongooseExpressMiddleware object was instantiated.
| `count` | Boolean | Returns the count of the documents after applying the filter. When `count` is enabled only `filter` paramerter takes effect.
| `page` | Number | Specify the page number of the paginated data. Default _1_.
| `limit` | Number | Specify the number for documents per page. Default _10_.
| `select` | String | List of comma-separated attributes of the document to display. If the attribute is preceded by a "-", then the attribute is omitted.
| `sort` | String | The attributes on which the results have to be sorted. By default, the documents are sorted in ascending order. If the attribute is preceded by a "-", then the sorting is done in descending order.


## MongooseExpressMiddleware.show(`req`, `res`)

Display a single document where the `:id` matches the `_id` of the document.

E.g. `app.get("/foo/:id", fooCrud.show)`

| Param | Type | Description |
|--|--|--|
| `select` | String | List of comma-separated attributes of the document to display. If the attribute is preceded by a "-", then the attribute is omitted.

## MongooseExpressMiddleware.destroy(`req`, `res`)

Deletes a single document where the `:id` matches the `_id` of the document.

E.g. `app.delete("/foo/:id", fooCrud.destroy)`

If the document is found and deleted, then `200 OK` is returned. If no document gets deleted, then `204 No Content` is returned.

## MongooseExpressMiddleware.bulkShow(`req`, `res`)

Display multiple documents for the given set of _ids. This is a convenience function over `MongooseExpressMiddleware.index()` with `filter`.

E.g. `app.get("/foo/bulkShow", fooCrud.bulkShow)`

| Param | Type | Description |
|--|--|--|
| `id` | String | List of comma-separated ids of the document to display
| `select` | String | List of comma-separated attributes of the document to display. If the attribute is preceded by a "-", then the attribute is omitted.
| `sort` | String | The attributes on which the results have to be sorted. By default, the documents are sorted in ascending order. If the attribute is preceded by a "-", then the sorting is done in descending order.

## MongooseExpressMiddleware.bulkUpdate(`req`, `res`)

Update multiple documents in a single request. The request has to be an array, with each document having an `_id`. 

E.g. `app.put("/foo/bulkUpdate", fooCrud.bulkUpdate)`

The response is an array of updated documents in the same order of input request. If an `_id` can't be located, then the response would be `null` for that document

## MongooseExpressMiddleware.bulkDestroy(`req`, `res`)

Delete multiple documents for the given set of _ids. 

E.g. `app.delete("/foo/bulkDelete", fooCrud.bulkDestroy)`

| Param | Type | Description |
|--|--|--|
| `id` | String | List of comma-separated ids of the document to delete

If all the document were found and deleted, then `200 OK` is returned. If no documents get deleted, then `204 No Content` is returned.