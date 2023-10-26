"use strict"
const mongoose = require("mongoose");
const _ = require("lodash");
const lib = require("./lib");


async function find(req, res) {
	try {
		let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
		const sort = lib.getObject(req.query.sort);
		const select = req.query.select;
		const page = req.query.page > 0 ? parseInt(req.query.page) : 1;
		const limit = req.query.limit ? parseInt(req.query.limit) : 10;
		const skip = limit * (page - 1);
		const results = await this.model.find(filter).select(select).sort(sort).skip(skip).limit(limit).exec();
		res.status(200).json(results);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

async function findById(req, res) {
	try {
		if (!req.params.id) return res.status(400).json({ message: "Missing id" });
		let filter = {
			"_id": req.params.id
		};
		const select = req.query.select;
		let isObjectId = req.query.isObjectId ? true : false;
		if (isObjectId) filter._id = new ObjectId(req.params.id);
		let results = await this.model.findOne(filter).select(select).exec();
		res.status(200).json(results);
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

async function count(req, res) {
	try {
		let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
		let documentCount = await this.model.countDocuments(filter).exec();
		res.status(200).json({ count: documentCount });
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
};

async function create(req, res) {
	try {
		let doc = req.body;
		let result = await this.model.create(doc);
		res.status(200).json(result);
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
};

async function update(req, res) {
	if (!req.body || req.body == {}) return res.status(400).json({ message: "Missing payload" });

	let filter = {
		"_id": req.params.id
	}

	let isReplace = req.query.replace ? true : false;
	const options = {
		upsert: req.query.upsert ? true : false
	};

	let doc = req.body;
	let result = null;
	if (doc._id) delete doc._id;
	if (isReplace) {
		result = await this.model.replaceOne(filter, doc, options);
	} else {
		result = await this.model.updateOne(filter, doc, options);
	}

	if (!options.upsert) {
		if (result.matchedCount == 0) {
			return res.status(404).json({ message: "Document not found" });
		}
		if (result.modifiedCount == 0) return res.status(304).json({ message: "Document not modified" });
	}
	if (options.upsert && result.upsertedCount == 0) {
		return res.status(404).json({ message: "Document not found and upsert failed" });
	}

	res.status(200).json({ _id: req.params.id });

}

async function deleteById(req, res) {
	try {
		if (!req.params.id) return res.status(400).json({ message: "Missing id" });
		let filter = {
			"_id": req.params.id
		}
		await this.model.deleteOne(filter);
		res.end();
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

async function deleteMany(req, res) {
	try {
		if (!req.query.filter) return res.status(400).json({ message: "Missing filter" });
		let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
		await this.model.deleteMany(filter);
		res.end()
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
};

async function aggregate(req, res) {
	try {
		let pipeline = req.body;
		let result = await this.model.aggregate(pipeline);
		res.status(200).json(result)
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

function mongooseCrud(modelName, schema, options) {
	this.schema = schema
	this.options = options ? options : {};
	this.options.defaultFilter = this.options.defaultFilter ? this.options.defaultFilter : {}
	this.model = mongoose.model(modelName, this.schema)

	this.find = find.bind(this);
	this.findById = findById.bind(this);
	this.count = count.bind(this);
	this.create = create.bind(this);
	this.update = update.bind(this);
	this.deleteById = deleteById.bind(this);
	this.deleteMany = deleteMany.bind(this);
	this.aggregate = aggregate.bind(this);

	this.getFilter = lib.getFilter.bind(this);
}

mongooseCrud.prototype = {
	constructor: mongooseCrud,
	model: null,
	schema: null,
	options: null,
}

module.exports = mongooseCrud