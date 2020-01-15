"use strict"
const mongoose = require("mongoose")
const log4js = require("log4js")
const Middleware = require("./Middleware")

function initLogger() {
	let version = require("./package.json").version
	let logger = log4js.getLogger(`[mongoose-crud ${version}]`)
	logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
	return logger
}

function MongooseModel(_model, _schema, _options) {
	this.schema = _schema
	this.model = mongoose.model(_model, this.schema, _options.collectionName)
	let logger = _options.logger ? _options.logger : initLogger()
	
	Middleware.call(this, this.model, logger, _options.defaultFilter)
	console.log(typeof this._filterParse)
	console.log(typeof this._count)

	this.count = this._count.bind(this)
	this.index = this._index.bind(this)
	this.show = this._show.bind(this)
	this.create = this._create.bind(this)
}

MongooseModel.prototype = {
	constructor: MongooseModel,
	model: null,
	schema: null
}

module.exports = MongooseModel