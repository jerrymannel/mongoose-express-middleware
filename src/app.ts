import mongoose from "mongoose";
import type { Model, Schema, FilterQuery } from "mongoose";
import _ from "lodash";
import lib from "./lib";
import type { Request, Response } from "express";

interface Options {
	defaultFilter?: any;
	collectionName?: string;
}

class MongooseCrud {
	schema: Schema;
	options: Options;
	model: Model<any>;

	constructor(modelName: string, schema: Schema, options?: Options) {
		this.schema = schema;
		this.options = options ? options : {};
		this.options.defaultFilter = this.options.defaultFilter ? this.options.defaultFilter : {};
		this.model = mongoose.model(modelName, this.schema);
	}

	getFilter = lib.getFilter;

	find = async (req: Request, res: Response) => {
		try {
			let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
			const sort = lib.getObject(req.query.sort);
			const select = req.query.select as any;
			const page = req.query.page && Number(req.query.page) > 0 ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			const skip = limit * (page - 1);
			const results = await this.model.find(filter).select(select).sort(sort).skip(skip).limit(limit).exec();
			res.status(200).json(results);
		} catch (e: any) {
			res.status(500).json({ message: e.message });
		}
	};

	findById = async (req: Request, res: Response) => {
		try {
			if (!req.params.id) return res.status(400).json({ message: "Missing id" });
			let filter: FilterQuery<any> = {
				"_id": req.params.id
			};
			const select = req.query.select as any;
			let isObjectId = req.query.isObjectId ? true : false;
			if (isObjectId) filter._id = new mongoose.Types.ObjectId(req.params.id);
			let results = await this.model.findOne(filter).select(select).exec();
			res.status(200).json(results);
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	}

	count = async (req: Request, res: Response) => {
		try {
			let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
			let documentCount = await this.model.countDocuments(filter).exec();
			res.status(200).json({ count: documentCount });
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			let doc = req.body;
			let result = await this.model.create(doc);
			res.status(200).json(result);
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	};

	update = async (req: Request, res: Response) => {
		if (!req.params.id) return res.status(400).json({ message: "Missing id" });
		if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: "Missing payload" });

		let filter = {
			"_id": req.params.id
		}

		let isReplace = req.query.replace ? true : false;
		const options = {
			upsert: req.query.upsert ? true : false
		};

		let doc = req.body;
		let result: any = null;
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

	deleteById = async (req: Request, res: Response) => {
		try {
			if (!req.params.id) return res.status(400).json({ message: "Missing id" });
			let filter = {
				"_id": req.params.id
			}
			await this.model.deleteOne(filter);
			res.end();
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	}

	deleteMany = async (req: Request, res: Response) => {
		try {
			if (!req.query.filter) return res.status(400).json({ message: "Missing filter" });
			let filter = lib.getFilter(this.options.defaultFilter, req.query.filter);
			await this.model.deleteMany(filter);
			res.end()
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	};

	aggregate = async (req: Request, res: Response) => {
		try {
			let pipeline = req.body;
			let result = await this.model.aggregate(pipeline);
			res.status(200).json(result)
		} catch (e: any) {
			res.status(500).json({ message: e.message })
		}
	}
}

export default MongooseCrud;