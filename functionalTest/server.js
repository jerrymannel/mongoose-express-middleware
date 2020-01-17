"use strict"
const express = require("express")
const port = process.env.PORT || 8080

var Mongoose = require("mongoose")
var MC = require("../")
// var tests = require("./index.js")

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

var testCrud = new MC(modelName, schema, options)

Mongoose.connect("mongodb://localhost:27017/mongoose-crudder-test", { useNewUrlParser: true,
	useUnifiedTopology: true
}, err => {
    if (err) {
        console.error(err)
    } else {
        console.log(`Connected to mongoose-crudder-testDB`)
        init()
    }
})

function init() {
	var app = express()
	app.use(express.json())

	app.post("/foo", testCrud.create)
	app.get("/foo", testCrud.index)
	app.delete("/foo/bulkDelete", testCrud.bulkDestroy)
	app.get("/foo/:id", testCrud.show)
	app.put("/foo/:id", testCrud.update)
	app.delete("/foo/:id", testCrud.destroy)

	app.listen(port, (err) => {
    if (!err) {
        console.log("Server started on port " + port)
        // require("./index.js")().then(() => process.exit())
    } else
        console.error(err)
	})
}

