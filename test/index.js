"use strict"
/* global describe:false, it: false */
var chai = require("chai")
var expect = chai.expect
var Mongoose = require("mongoose")
var MC = require("../")

var definition = {
	"name": { "type": String },
	"description": { "type": String },
	"age" : {"type" : Number}
}

var schema = Mongoose.Schema(definition)
var modelName = "foobar1"
var options = {
	collectionName: "foobar",
	defaultFilter: {
		"age": {"$gte": 10}
	}
}

var testCrud = new MC(modelName, schema, options)

describe("Methods Sanity Check", function () {

	describe("index", function () {
		it("Should be a function", function (done) {
			expect(testCrud.index).to.be.a("function")
			done()
		})
	})

	describe("show", function () {
		it("Should be a function", function (done) {
			expect(testCrud.show).to.be.a("function")
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
			expect(testCrud.destroy).to.be.a("function")
			done()
		})
	})

	describe("bulkShow", function () {
		it("Should be a function", function (done) {
			expect(testCrud.bulkShow).to.be.a("function")
			done()
		})
	})

	describe("bulkUpdate", function () {
		it("Should be a function", function (done) {
			expect(testCrud.bulkUpdate).to.be.a("function")
			done()
		})
	})

	describe("bulkDestroy", function () {
		it("Should be a function", function (done) {
			expect(testCrud.bulkDestroy).to.be.a("function")
			done()
		})
	})
})

