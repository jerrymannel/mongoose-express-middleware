"use strict"

function Middleware(model, logger, defaultFilter) {
    this.model = model;
    this.logger = logger;
    this.defaultFilter = defaultFilter

		// ***************** MIDDLEWARE FUNCTIONS **************************
    this._count = function(req, res) {
			let filter = this.GetFilter(this.defaultFilter, req.query.filter)
			return this.model
				.find(filter)
				.count()
				.exec()
				.then(result => this.Okay(res, result))
				.catch(err => this.Error(res, err))
		}

		this._index = function(req, res) {
			let filter = this.GetFilter(this.defaultFilter, req.query.filter)
			let sort = this.GetSort(req.query.sort)
			let select = req.query.select ? req.query.select.split(",") : []
			let page = req.query.page ? req.query.page : 1
			let count = req.query.count ? req.query.count : 10
			let skip = count * (page - 1)
			
			let query = this.model.find(filter)
				.select(select.join(" "))

			query.sort(sort)
			if (count != -1) query.skip(skip).limit(count)
	        
			return query.exec()
				.then(result => this.Okay(res, result))
				.catch(err => this.Error(res, err))
		}

		this._show = function(req, res) {
	    let reqParams = params.map(req);
	    let select = req.query.select ? req.query.select.split(',') : [];
	    return this.model.findOne({'_id': req.params.id})
	    .select(select.join(' ')).exec()
		}

		this._create = function(req, res) {
			return new model(req.body).save()
				.then(result => this.Okay(res, result))
				.catch(err => this.Error(res, err))
		}
}

Middleware.prototype = {
	constructor: Middleware,
	model: null,
	logger: null,
	defaultFilter: null,
	// ***************** UTILITY FUNCTIONS **************************
	_filterParse: (filterParsed) => {
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
	GetFilter: (_default, _filter) => {
		let filter = _filter ? _filter : {}``
		if (typeof filter === "string") {
			try {
				filter = JSON.parse(filter)
				filter = this._filterParse(filter)
			} catch (err) {
				this.logger.error("Failed to parse filter :" + err)
				filter = {}
			}
		}
		for (let key in _default) filter[key] = _default[key]
		return filter
	},
	GetSort: (_sort) => {
		var sort = {}
		_sort ? _sort.split(",").map(el => el.split("-").length > 1 ? sort[el.split("-")[1]] = -1 : sort[el.split("-")[0]] = 1) : null
		return sort
	},
	Okay: (res, data) => {
		res.status(200).json(data)
	},
	Error: (res, err) => {
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
}

module.exports = Middleware;