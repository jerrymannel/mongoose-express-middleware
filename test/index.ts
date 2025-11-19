import { expect, use } from "chai";
import * as sinon from "sinon";
import sinonChai from "sinon-chai";
import mongoose, { Schema } from "mongoose";
import MC from "../src/app";
import type { Request, Response } from "express";

use(sinonChai);

describe("MongooseExpressMiddleware", function () {
	let modelStub: any;
	let crud: MC;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusStub: sinon.SinonStub;
	let jsonStub: sinon.SinonStub;
	let endStub: sinon.SinonStub;

	beforeEach(() => {
		const schema = new Schema({ name: String });
		crud = new MC("TestModel", schema);

		// Mock the mongoose model methods
		modelStub = {
			find: sinon.stub().returnsThis(),
			findOne: sinon.stub().returnsThis(),
			select: sinon.stub().returnsThis(),
			sort: sinon.stub().returnsThis(),
			skip: sinon.stub().returnsThis(),
			limit: sinon.stub().returnsThis(),
			exec: sinon.stub(),
			countDocuments: sinon.stub().returnsThis(),
			create: sinon.stub(),
			replaceOne: sinon.stub(),
			updateOne: sinon.stub(),
			deleteOne: sinon.stub(),
			deleteMany: sinon.stub(),
			aggregate: sinon.stub()
		};
		crud.model = modelStub as any;

		// Mock Express Request and Response
		req = {
			query: {},
			params: {},
			body: {}
		};
		statusStub = sinon.stub().returnsThis();
		jsonStub = sinon.stub().returnsThis();
		endStub = sinon.stub();
		res = {
			status: statusStub,
			json: jsonStub,
			end: endStub
		} as any;
	});

	afterEach(() => {
		sinon.restore();
		delete mongoose.models.TestModel;
	});

	describe("find", () => {
		it("should return results with default pagination", async () => {
			const mockResults = [{ name: "test" }];
			modelStub.exec.resolves(mockResults);

			await crud.find(req as Request, res as Response);

			expect(modelStub.find).to.have.been.called;
			expect(modelStub.limit).to.have.been.calledWith(10);
			expect(modelStub.skip).to.have.been.calledWith(0);
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith(mockResults);
		});

		it("should handle pagination params", async () => {
			req.query = { page: "2", limit: "20" };
			modelStub.exec.resolves([]);

			await crud.find(req as Request, res as Response);

			expect(modelStub.limit).to.have.been.calledWith(20);
			expect(modelStub.skip).to.have.been.calledWith(20);
		});

		it("should handle errors", async () => {
			const error = new Error("Database error");
			modelStub.exec.rejects(error);

			await crud.find(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
			expect(res.json).to.have.been.calledWith({ message: error.message });
		});
	});

	describe("findById", () => {
		it("should return document by id", async () => {
			req.params = { id: "123" };
			const mockResult = { name: "test" };
			modelStub.exec.resolves(mockResult);

			await crud.findById(req as Request, res as Response);

			expect(modelStub.findOne).to.have.been.calledWith({ _id: "123" });
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith(mockResult);
		});

		it("should return 400 if id is missing", async () => {
			await crud.findById(req as Request, res as Response);
			expect(res.status).to.have.been.calledWith(400);
			expect(res.json).to.have.been.calledWith({ message: "Missing id" });
		});

		it("should handle errors", async () => {
			req.params = { id: "123" };
			const error = new Error("Database error");
			modelStub.exec.rejects(error);

			await crud.findById(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});

	describe("count", () => {
		it("should return count", async () => {
			modelStub.exec.resolves(5);

			await crud.count(req as Request, res as Response);

			expect(modelStub.countDocuments).to.have.been.called;
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith({ count: 5 });
		});

		it("should handle errors", async () => {
			const error = new Error("Database error");
			modelStub.exec.rejects(error);

			await crud.count(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});

	describe("create", () => {
		it("should create document", async () => {
			req.body = { name: "test" };
			const mockResult = { _id: "123", name: "test" };
			modelStub.create.resolves(mockResult);

			await crud.create(req as Request, res as Response);

			expect(modelStub.create).to.have.been.calledWith(req.body);
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith(mockResult);
		});

		it("should handle errors", async () => {
			const error = new Error("Database error");
			modelStub.create.rejects(error);

			await crud.create(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});

	describe("update", () => {
		it("should update document", async () => {
			req.params = { id: "123" };
			req.body = { name: "updated" };
			modelStub.updateOne.resolves({ matchedCount: 1, modifiedCount: 1 });

			await crud.update(req as Request, res as Response);

			expect(modelStub.updateOne).to.have.been.called;
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith({ _id: "123" });
		});

		it("should replace document if replace query is present", async () => {
			req.params = { id: "123" };
			req.body = { name: "replaced" };
			req.query = { replace: "true" };
			modelStub.replaceOne.resolves({ matchedCount: 1, modifiedCount: 1 });

			await crud.update(req as Request, res as Response);

			expect(modelStub.replaceOne).to.have.been.called;
			expect(res.status).to.have.been.calledWith(200);
		});

		it("should return 400 if id is missing", async () => {
			await crud.update(req as Request, res as Response);
			expect(res.status).to.have.been.calledWith(400);
		});

		it("should return 400 if body is missing", async () => {
			req.params = { id: "123" };
			await crud.update(req as Request, res as Response);
			expect(res.status).to.have.been.calledWith(400);
		});

		it("should return 404 if document not found", async () => {
			req.params = { id: "123" };
			req.body = { name: "test" };
			modelStub.updateOne.resolves({ matchedCount: 0 });

			await crud.update(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(404);
		});
	});

	describe("deleteById", () => {
		it("should delete document", async () => {
			req.params = { id: "123" };
			modelStub.deleteOne.resolves({ deletedCount: 1 });

			await crud.deleteById(req as Request, res as Response);

			expect(modelStub.deleteOne).to.have.been.calledWith({ _id: "123" });
			expect(res.end).to.have.been.called;
		});

		it("should return 400 if id is missing", async () => {
			await crud.deleteById(req as Request, res as Response);
			expect(res.status).to.have.been.calledWith(400);
		});

		it("should handle errors", async () => {
			req.params = { id: "123" };
			const error = new Error("Database error");
			modelStub.deleteOne.rejects(error);

			await crud.deleteById(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});

	describe("deleteMany", () => {
		it("should delete many documents", async () => {
			req.query = { filter: JSON.stringify({ name: "test" }) };
			modelStub.deleteMany.resolves({ deletedCount: 5 });

			await crud.deleteMany(req as Request, res as Response);

			expect(modelStub.deleteMany).to.have.been.called;
			expect(res.end).to.have.been.called;
		});

		it("should return 400 if filter is missing", async () => {
			await crud.deleteMany(req as Request, res as Response);
			expect(res.status).to.have.been.calledWith(400);
		});

		it("should handle errors", async () => {
			req.query = { filter: JSON.stringify({ name: "test" }) };
			const error = new Error("Database error");
			modelStub.deleteMany.rejects(error);

			await crud.deleteMany(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});

	describe("aggregate", () => {
		it("should aggregate documents", async () => {
			req.body = [{ $match: { name: "test" } }];
			const mockResult = [{ _id: "123", count: 1 }];
			modelStub.aggregate.resolves(mockResult);

			await crud.aggregate(req as Request, res as Response);

			expect(modelStub.aggregate).to.have.been.calledWith(req.body);
			expect(res.status).to.have.been.calledWith(200);
			expect(res.json).to.have.been.calledWith(mockResult);
		});

		it("should handle errors", async () => {
			const error = new Error("Database error");
			modelStub.aggregate.rejects(error);

			await crud.aggregate(req as Request, res as Response);

			expect(res.status).to.have.been.calledWith(500);
		});
	});
});
