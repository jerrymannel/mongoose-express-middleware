module.exports = {
	_filterParse: (filterParsed) => {
		var self = this
		for (var key in filterParsed) {
			if (self.IsString(filterParsed[key])) {
				filterParsed[key] = self.CreateRegexp(filterParsed[key])
			} else if (self.IsArray(filterParsed[key])) {
				filterParsed[key] = self.ResolveArray(filterParsed[key])
			} else if (self.IsObject(filterParsed[key])) {
				filterParsed[key] = self.FilterParse(filterParsed[key])
			}
		}
		return filterParsed
	},
	GetFilter: (_default, _filter) => {
		let filter = _filter ? _filter : {}
		if (typeof filter === "string") {
			try {
				filter = JSON.parse(filter)
				filter = this._filterParse(filter)
			} catch (err) {
				console.log("Failed to parse filter :" + err)
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