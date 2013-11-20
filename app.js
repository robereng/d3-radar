var http = require("http");
var express = require("express");
 
var app = express();
 
app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
});

// Set the view directory to /views
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
 
//the root request
app.get('/', function(request, response){
    response.render("index");
});

// get all records from the database
app.get('/getData', function(request, response){

	var dataNodes = [];

	var req = http.get('http://127.0.0.1:5984/radar/_all_docs?include_docs=true', function(res) {
	  	res.setEncoding('utf8');
	  	var data = '';
		res.on('data', function (chunk){
		    data += chunk;
		});

		res.on('end',function(){
			dataNodes = JSON.parse(data);	
			response.send(dataNodes);
		})
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

}); 

//the root request
app.get('/create', function(request, response){
    response.render("createBlock");
});

// create a new document in the DB
app.post("/createDocument", function(request, response) {

	if(request.body.name && request.body.description && request.body.date_added && request.body.type && request.body.stage){

		var options = {
		  host: "localhost",
		  port: 5984,
		  path: "/radar",
		  headers: {"content-type": "application/json"},
		  method: "POST"
		};

		var req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		});

		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		req.write(JSON.stringify({
		  "name":request.body.name,
		  "description":request.body.description,
		  "date_added":request.body.date_added,
		  "type": request.body.type,
		  "stage": request.body.stage 
		}));

		req.end();

		response.send({response: "ok"});
	}
	else{
		response.send({response: "fields missing"});
	}

});

// create a new document in the DB
app.post("/editDocument", function(request, response) {

	if(request.body.id && request.body.rev && request.body.name && request.body.description && request.body.date_added && request.body.type && request.body.stage){

		var options = {
		  host: "localhost",
		  port: 5984,
		  path: "/radar/" + request.body.id,
		  headers: {"content-type": "application/json"},
		  method: "PUT"
		};

		var req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		});

		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		req.write(JSON.stringify({
		  "_id": request.body.id,	
		  "_rev": request.body.rev,
		  "name":request.body.name,
		  "description":request.body.description,
		  "date_added":request.body.date_added,
		  "type": request.body.type,
		  "stage": request.body.stage 
		}));

		req.end();

		response.send({response: "ok"});
	}
	else{
		response.send({response: "fields missing"});
	}

});

//edit an existing document
app.get("/edit", function(request, response) {
	
	var dataNodes = [];

	var req = http.get('http://127.0.0.1:5984/radar/' + request.query.id, function(res) {
	  	res.setEncoding('utf8');
	  	var data = '';
		res.on('data', function (chunk){
		    data += chunk;
		});

		res.on('end',function(){
			dataNodes = JSON.parse(data);
			response.locals.tech = {id: dataNodes._id, rev: dataNodes._rev, date_added: dataNodes.date_added, name: dataNodes.name, description: dataNodes.description, stage: dataNodes.stage, type: dataNodes.type};
			response.render("editBlock");
		})
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
});
 
app.listen(3000);