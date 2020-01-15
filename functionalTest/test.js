const request = require("request-promise")

const URL = "http://localhost:8080/foo"

request.get(`${URL}`)
	.then(_d => console.log(_d))
	.catch(_e => console.log(_e))
