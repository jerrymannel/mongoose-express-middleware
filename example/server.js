"use strict"
const express = require("express")
const port = process.env.PORT || 8080

var mongoose = require("mongoose")
var mongooseCrud = require("../")

var definition = {
    "_id": { "type": String },
    "name": { "type": String },
    "description": { "type": String },
    "age": { "type": Number }
}

var schema = mongoose.Schema(definition)
var modelName = "foobar"
var options = {
    defaultFilter: {
        "age": { "$gte": 10 }
    }
}

var fooCrud = new mongooseCrud(modelName, schema, null);

function init() {
    var app = express()
    app.use(express.json())

    app.use((req, res, next) => {
        console.log(req.method, req.url)
        next()
    });

    app.get("/", fooCrud.find)
    app.get("/:id", fooCrud.findById)
    app.get("/utils/count", fooCrud.count)
    app.post("/", fooCrud.create)
    app.put("/:id", fooCrud.update)
    app.delete("/:id", fooCrud.deleteById)
    app.delete("/utils/deleteMany", fooCrud.deleteMany)
    app.post("/utils/aggregate", fooCrud.aggregate)

    app.listen(port, (err) => {
        if (!err) {
            console.log("Server started on port " + port)
        } else
            console.error(err)
    })
}

(async () => {
    await mongoose.connect("mongodb://localhost:30017/foobar");
    console.log("Connected to mongodb");
    init();
})();