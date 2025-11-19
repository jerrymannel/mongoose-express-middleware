import { expect } from "chai";
import mongoose, { Schema } from "mongoose";
import MC from "../src/app";

var definition = {
	"name": { "type": String },
	"description": { "type": String },
	"age": { "type": Number }
}

var schema = new Schema(definition)
var modelName = "foobar1"
var options = {
	collectionName: "foobar",
	defaultFilter: {
		"age": { "$gte": 10 }
	}
}

var testCrud = new MC(modelName, schema, options)

describe("Methods Sanity Check", function () {

	describe("index", function () {
		it("Should be a function", function (done) {
			expect(testCrud.find).to.be.a("function")
			done()
		})
	})

	describe("show", function () {
		it("Should be a function", function (done) {
			expect(testCrud.findById).to.be.a("function")
			done()
		})
	})

	describe("create", function () {
		it("Should be a function", function (done) {
			expect(testCrud.create).to.be.a("function")
			done()
		})
	})

	describe("update", function () {
		it("Should be a function", function (done) {
			expect(testCrud.update).to.be.a("function")
			done()
		})
	})

	describe("destroy", function () {
		it("Should be a function", function (done) {
			expect(testCrud.deleteById).to.be.a("function")
			done()
		})
	})

	describe("deleteMany", function () {
		it("Should be a function", function (done) {
			expect(testCrud.deleteMany).to.be.a("function")
			done()
		})
	})

	describe("aggregate", function () {
		it("Should be a function", function (done) {
			expect(testCrud.aggregate).to.be.a("function")
			done()
		})
	})
})


