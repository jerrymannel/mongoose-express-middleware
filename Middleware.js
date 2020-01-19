"use strict"
const mongoose = require("mongoose")
const _ = require("lodash")

function Middleware(model, logger, defaultFilter) {
    this.model = model;
    this.logger = logger;
    this.defaultFilter = defaultFilter
}

function __updateCutomiser(objValue, srcValue){
	if (_.isArray(objValue)) {
     return srcValue;
  }
}

Middleware.prototype = {
	constructor: Middleware,
	model: null,
	logger: null,
	defaultFilter: null,
	// ***************** UTILITY FUNCTIONS **************************
	IsString: val => val && val.constructor.name === 'String',
	IsArray: arg => arg && arg.constructor.name === 'Array',
  IsObject: arg => arg && arg.constructor.name === 'Object',
	CreateRegexp: function (str) {
	  if (str.charAt(0) === '/' && str.charAt(str.length - 1) === '/') {
      var text = str.substr(1, str.length - 2).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      return new RegExp(text, 'i');
	  } else {
      return str;
	  }
	},
	ResolveArray: function (arr) {
    for (var x = 0; x < arr.length; x++) {
        if (this.IsObject(arr[x])) {
            arr[x] = this.FilterParse(arr[x]);
        } else if (this.IsArray(arr[x])) {
            arr[x] = this.ResolveArray(arr[x]);
        } else if (this.IsString(arr[x])) {
            arr[x] = this.CreateRegexp(arr[x]);
        }
    }
    return arr;
  },
	FilterParse: function(filterParsed){
		for (var key in filterParsed) {
			if (this.IsString(filterParsed[key])) {
				filterParsed[key] = this.CreateRegexp(filterParsed[key])
			} else if (this.IsArray(filterParsed[key])) {
				filterParsed[key] = this.ResolveArray(filterParsed[key])
			} else if (this.IsObject(filterParsed[key])) {
				filterParsed[key] = this.FilterParse(filterParsed[key])
			}
		}
		return filterParsed
	},
	GetFilter: function(_default, _filter){
		let filter = _filter ? _filter : {}
		this.logger.info(filter)
		if (typeof filter === "string") {
			try {
				filter = JSON.parse(filter)
				filter = this.FilterParse(filter)
			} catch (err) {
				this.logger.error("Failed to parse filter :" + err)
				filter = {}
			}
		}
		return _.assign({}, _default, filter);
	},
	GetSort: function(_sort){
		var sort = {}
		_sort ? _sort.split(",").map(el => el.split("-").length > 1 ? sort[el.split("-")[1]] = -1 : sort[el.split("-")[0]] = 1) : null
		return sort
	},
	Okay: (res, statusCode, data) => res.status(statusCode).json(data),
	Error: function(res, err){
		this.logger.debug(err)
		if (err.errors) {
			var errors = []
			Object.keys(err.errors).forEach(el => errors.push(err.errors[el].message))
			res.status(400).json({
				message: errors
			})
		} else {
			res.status(400).json({
				message: [err.message]
			})
		}
	},
	// ***************** MIDDLEWARE FUNCTIONS **************************
	_create: function(req, res) {
		if(_.isArray(req.body)) {
			let documents = req.body;
			documents.forEach(_d => {
				if(!_d._id) _d._id = new mongoose.Types.ObjectId();
			})
			let statusCode = 200
			let count = documents.length
			return Promise.all(documents.map(_d => {
				return new this.model(_d).save()
				.catch(_e => {
					statusCode = 207;
					count--;
					return {message: _e.message}
				})
			}))
			.then(result => {
				if(count == 0) statusCode = 400;
				this.Okay(res, statusCode, result)
			})
		}
		else {
			let doc = req.body;
			if(!doc._id) doc._id = new mongoose.Types.ObjectId();
			return new this.model(doc).save()
			.then(result => this.Okay(res, 200, result))
			.catch(err => this.Error(res, err))
		}
	},
  _count: function(req, res) {
		let filter = this.GetFilter(this.defaultFilter, req.query.filter)
		return this.model
			.find(filter)
			.count()
			.exec()
			.then(result => this.Okay(res, 200, result))
			.catch(err => this.Error(res, err))
	},
	_index: function(req, res) {
		this.logger.debug(`Count : ${req.query.count}`)
		let filter = this.GetFilter(this.defaultFilter, req.query.filter)
		this.logger.debug(`Filter : ${JSON.stringify(filter)}`)
		let query = this.model.find(filter)
		if(req.query.count != null) query.count()
		else {
			let sort = this.GetSort(req.query.sort)
			this.logger.debug(`Sort : ${JSON.stringify(sort)}`)
			
			let select = req.query.select ? req.query.select.split(",") : []
			select = select.join(" ")
			
			this.logger.debug(`Select : ${select}`)
			let page = req.query.page ? req.query.page : 1
			
			this.logger.debug(`Page : ${page}`)
			let limit = req.query.limit ? req.query.limit : 10
			
			this.logger.debug(`Limit : ${limit}`)
			let skip = limit * (page - 1)
			
			query.select(select)
			query.sort(sort)
			if (limit != -1) query.skip(skip).limit(parseInt(limit))
		} 
		return query.exec()
			.then(result => this.Okay(res, 200, result))
			.catch(err => this.Error(res, err))
	},
	_show: function(req, res) {
    let select = req.query.select ? req.query.select.split(',') : [];
    return this.model.findOne({'_id': req.params.id})
    .select(select.join(' '))
    .exec()
    .then(result => this.Okay(res, 200, result))
		.catch(err => this.Error(res, err))
	},
	_update: function (req, res) {
		if(!req.body || req.body == {}) return res.status(400).json({})
    return this.model.findById({'_id': req.params.id})
  		.exec()
  		.then(_d => _.mergeWith(_d, req.body, __updateCutomiser))
  		.then(_d => this.model.updateOne({'_id': req.params.id}, _d))
  		.then(() => this.model.findById({'_id': req.params.id}))
	    .then(result => this.Okay(res, 200, result))
			.catch(err => this.Error(res, err))
  },
	_destroy: function (req, res) {
    return this.model.deleteOne({'_id': req.params.id})
	    .then(doc => {
	    	if(doc.deletedCount == 0) this.Okay(res, 204, {})
	    	else this.Okay(res, 200, {})
	    })
	    .catch(err => this.Error(res, err))
  },
  _bulkShow: function (req, res) {
  	var ids = req.query.id ? req.query.id.split(',') : [];
  	this.logger.debug(`Filter : ${JSON.stringify({'_id': { "$in": ids }})}`)
  	let query = this.model.find({'_id': { "$in": ids }})
  	
  	let sort = this.GetSort(req.query.sort)
		this.logger.debug(`Sort : ${JSON.stringify(sort)}`)
		
		let select = req.query.select ? req.query.select.split(",") : []
		select = select.join(" ")
		this.logger.debug(`Select : ${select}`)
		
		return query.select(select).sort(sort).exec()
	    .then(doc => this.Okay(res, 200, doc))
	    .catch(err => this.Error(res, err))
  },
  _bulkUpdate: function (req, res) {
  	if(_.isArray(req.body)) {
  		let documents = req.body;
  		let promises = [];
  		let statusCode = 200
			let count = documents.length

    	return Promise.all(documents.map(_doc => {
    		if(!_doc._id) return null
    		return this.model.findById(_doc._id).exec()
      	.then(_d => _.mergeWith(_d, _doc, __updateCutomiser))
      	.then(_d => {
      		return this.model.updateOne({ _id: _d._id }, _d)
      		.then(() => this.model.findById(_d._id).exec())
      		.catch(_e => {
						statusCode = 207;
						count--;
						return {message: _e.message}
					})
      	})
    	}))
    	.then(result => {
				if(count == 0) statusCode = 400;
				this.Okay(res, statusCode, result)
			})
  	} else this.Error(res, {message: "An array of documents expected."})
  },
  _bulkDestroy: function (req, res) {
  	var ids = req.query.id ? req.query.id.split(',') : [];
  	return this.model.deleteMany({'_id': { "$in": ids }})
	    .then(doc => {
	    	if(doc.deletedCount == 0) this.Okay(res, 204, {})
	    	else this.Okay(res, 200, {})
	    })
	    .catch(err => this.Error(res, err))
  }
}

module.exports = Middleware;