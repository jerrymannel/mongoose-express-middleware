"use strict"
const mongoose = require("mongoose")
const log4js = require("log4js")
const Middleware = require("./Middleware")

function initLogger() {
	let version = require("./package.json").version
	let logger = log4js.getLogger(`[mongoose-express-middleware ${version}]`)
	logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
	return logger
}

function MongooseModel(_model, _schema, _options) {
	this.schema = _schema
	this.model = mongoose.model(_model, this.schema, _options.collectionName)
	let logger = _options.logger ? _options.logger : initLogger()

	Middleware.call(this, this.model, logger, _options.defaultFilter)

	this.create = this._create.bind(this)
	this.update = this._update.bind(this)
	this.index = this._index.bind(this)
	this.show = this._show.bind(this)
	this.destroy = this._destroy.bind(this)
	this.bulkShow = this._bulkShow.bind(this)
	this.bulkUpdate = this._bulkUpdate.bind(this)
	this.bulkDestroy = this._bulkDestroy.bind(this)
}

MongooseModel.prototype = {
	constructor: MongooseModel,
	model: null,
	schema: null
}

MongooseModel.prototype = Object.assign(Middleware.prototype, MongooseModel.prototype)

module.exports = MongooseModel