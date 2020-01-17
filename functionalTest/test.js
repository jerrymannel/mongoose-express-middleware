var chai = require("chai")
var expect = chai.expect
var assert = chai.assert

const api = require("supertest")("http://localhost:8080/foo")

describe("Functional Checks", function () {

	describe("Payload without _id", function () {
		let _id = null;
		
		let payload = {
			"name": "Alice",
			"description": "Who the fuck is Alice?",
			"age": 20
		}

		let updatePayload = {
			"name": "Bob",
			"description": "Bob is a nice guy",
			"age": 30
		}

		it("Create should create an new document", function (done) {
			api.post("/")
			.send(payload)
			.end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				expect(res.body._id).to.be.a('string');
				expect(res.body.name).to.be.a('string');
				expect(res.body.description).to.be.a('string');
				expect(res.body.age).to.be.a('number');
				expect(res.body.name).to.be.equal(payload.name);
				expect(res.body.description).to.be.equal(payload.description);
				expect(res.body.age).to.be.equal(payload.age);
				_id = res.body._id;
				done()
			})
		})
	
		it("Count should return 1", function (done) {
			api.get("?count=true").end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.equal(1);
				done()
			})
		})

		it("Fetch should return 1 record", function (done) {
			api.get("/").end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done()
			})
		})

		it("Show should return data", function (done) {
			api.get(`/${_id}`).end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				expect(res.body._id).to.be.a('string');
				expect(res.body.name).to.be.a('string');
				expect(res.body.description).to.be.a('string');
				expect(res.body.age).to.be.a('number');
				expect(res.body.name).to.be.equal(payload.name);
				expect(res.body.description).to.be.equal(payload.description);
				expect(res.body.age).to.be.equal(payload.age);
				done()
			})
		})

		it("Update should update the document", function (done) {
			api.put(`/${_id}`)
			.send(updatePayload)
			.end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				expect(res.body._id).to.be.a('string');
				expect(res.body.name).to.be.a('string');
				expect(res.body.description).to.be.a('string');
				expect(res.body.age).to.be.a('number');
				expect(res.body.name).to.be.equal(updatePayload.name);
				expect(res.body.description).to.be.equal(updatePayload.description);
				expect(res.body.age).to.be.equal(updatePayload.age);
				_id = res.body._id;
				done()
			})
		})

		it("Destroy should delete the document", function (done) {
			api.delete(`/${_id}`).end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				done()
			})
		})

		it("Destroy should return 204", function (done) {
			api.delete(`/${_id}`).end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(204);
				expect(res.body).to.be.not.null;
				done()
			})
		})

	})

	describe("Payload with _id", function () {
		let payload = {
			"_id": "payload1",
			"name": "Alice",
			"description": "Who the fuck is Alice?",
			"age": 20
		}

		it("Create should create an new document", function (done) {
			api.post("/")
			.send(payload)
			.end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				expect(res.body._id).to.be.a('string');
				expect(res.body.name).to.be.a('string');
				expect(res.body.description).to.be.a('string');
				expect(res.body.age).to.be.a('number');
				expect(res.body.name).to.be.equal(payload.name);
				expect(res.body.description).to.be.equal(payload.description);
				expect(res.body.age).to.be.equal(payload.age);
				done()
			})
		})

		it("Count should return 1", function (done) {
			api.get("?count=true").end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.equal(1);
				done()
			})
		})

		it("Fetch should return 1 record", function (done) {
			api.get("/").end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done()
			})
		})

		it("Show should return data", function (done) {
			api.get(`/${payload._id}`).end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				expect(res.body._id).to.be.a('string');
				expect(res.body.name).to.be.a('string');
				expect(res.body.description).to.be.a('string');
				expect(res.body.age).to.be.a('number');
				expect(res.body.name).to.be.equal(payload.name);
				expect(res.body.description).to.be.equal(payload.description);
				expect(res.body.age).to.be.equal(payload.age);
				done()
			})
		})

		it("Destroy should delete the document", function (done) {
			api.delete(`/${payload._id}`).end(function(err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.not.null;
				done()
			})
		})

	})
});
