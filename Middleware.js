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
		for (let key in _default) filter[key] = _default[key]
		return filter
	},
	GetSort: function(_sort){
		var sort = {}
		_sort ? _sort.split(",").map(el => el.split("-").length > 1 ? sort[el.split("-")[1]] = -1 : sort[el.split("-")[0]] = 1) : null
		return sort
	},
	Okay: function(res, data){
		res.status(200).json(data)
	},
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
		let doc = new this.model(req.body)
		if(!doc._id) doc._id = new mongoose.Types.ObjectId();
		this.logger.debug(doc)
		return doc.save()
			.then(result => {
				this.logger.info(result);
				this.Okay(res, result)
			})
			.catch(err => this.Error(res, err))
	},
  _count: function(req, res) {
		let filter = this.GetFilter(this.defaultFilter, req.query.filter)
		return this.model
			.find(filter)
			.count()
			.exec()
			.then(result => this.Okay(res, result))
			.catch(err => this.Error(res, err))
	},
	_index: function(req, res) {
		let filter = this.GetFilter(this.defaultFilter, req.query.filter)
		let query = this.model.find(filter)
		if(req.query.count == 'true') query.count()
		else {
			let sort = this.GetSort(req.query.sort)
			let select = req.query.select ? req.query.select.split(",") : []
			let page = req.query.page ? req.query.page : 1
			let count = req.query.count ? req.query.count : 10
			let skip = count * (page - 1)
			
			query.select(select.join(" "))
			query.sort(sort)
			if (count != -1) query.skip(skip).limit(count)
		} 
		return query.exec()
			.then(result => this.Okay(res, result))
			.catch(err => this.Error(res, err))
	},
	_show: function(req, res) {
    let select = req.query.select ? req.query.select.split(',') : [];
    return this.model.findOne({'_id': req.params.id})
    .select(select.join(' '))
    .exec()
    .then(result => this.Okay(res, result))
		.catch(err => this.Error(res, err))
	},
	_update: function (req, res) {
		if(!req.body || req.body == {}) return res.status(400).json({})
    return this.model.findById({'_id': req.params.id})
  		.exec()
  		.then(_d => _.mergeWith(_d, req.body, __updateCutomiser))
  		.then(_d => this.model.updateOne({'_id': req.params.id}, _d))
  		.then(() => this.model.findById({'_id': req.params.id}))
	    .then(result => this.Okay(res, result))
			.catch(err => this.Error(res, err))
  },
	_destroy: function (req, res) {
    return this.model.deleteOne({'_id': req.params.id})
	    .then(doc => {
	    	if(doc.deletedCount == 0) res.status(204).end()
	    	else this.Okay(res, {})
	    })
	    .catch(err => this.Error(res, err))
  },
  _bulkDestroy: function (req, res) {
  	var ids = req.params.id ? req.params.id.split(',') : [];
  	return this.model.deleteMany({'_id': { "$in": ids }})
	    .then(doc => {
	    	if(doc.deletedCount == 0) res.status(204).end()
	    	else this.Okay(res, {})
	    })
	    .catch(err => this.Error(res, err))
  },
}

module.exports = Middleware;