"use strict"
const _ = require("lodash");

let lib = {
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
	FilterParse: function (filterParsed) {
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
}

lib.getFilter = function (_default, _filter) {
	let defaultFilter = _default ? _default : {};
	let filter = _filter ? _filter : {};
	if (typeof filter === "string") {
		try {
			filter = JSON.parse(filter);
			filter = this.FilterParse(filter);
		} catch (err) {
			filter = {};
		}
	}
	return _.assign({}, defaultFilter, filter);
};

lib.getObject = function (_data) {
	let data = _data ? _data : {}
	if (typeof data === "string") {
		try {
			data = JSON.parse(data);
		} catch (err) {
			data = {};
		}
	}
	return data;
};

module.exports = lib;