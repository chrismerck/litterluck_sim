var ws = require("nodejs-websocket");
var http = require('http');
var N = 100; // number of nodes
var ival = 1000*15; // update interval in ms
var ival_rand = 1000*10; // random amount added to update interval
//The 'database' to hold all of the data; in GeoJSON format.
var db = { 	'type': 'FeatureCollection',
		'features': [] };	
for(i = 0; i < N; i++) {
	db['features'].push(
  	{  
		'type': 'Feature',
		'geometry': {
			'type': 'Point',
		  'coordinates': [-74.0+0.1*Math.random(),40.7+0.1*Math.random()]
		},
		'properties': {
			'uid': i,
			'temp': Math.random()*(85+20)-20,
			'stance': 'upright',
			'next_update': Date.now()+ival*Math.random(),
			'interval_value': ival + ival_rand*Math.random()
		}
	});
}

function dynamicData(port) {
	var server = ws.createServer(function (conn) {
		console.log("New connection")
		conn.on("text", function (str) {
			console.log("Received "+str)
		})
		conn.on("close", function (code, reason) {
			console.log("Connection closed")
  		})
  	// send simulated data
		setInterval(function () {
			now = Date.now();
			for (i = 0; i<N; i++) {
				dataProp = db["features"][i].properties;
				coordinates = db["features"][i].geometry.coordinates;
				if (dataProp.next_update < now) {
					dataProp.next_update += dataProp.interval_value;
					//Update temp with in a random value.
					dataProp.temp += 2*(Math.random()-0.5);
					if (dataProp.stance == 'upright') {
						if (Math.random() < 0.01) {
							dataProp.stance = 'fallen';
						}
					}
					if (dataProp.stance == 'fallen') {
						if (Math.random() < 0.01) {
							dataProp.stance = 'upright';
						}
					}
					//We only want to resend the "Feature" that is
					//being updated.
				try{
						conn.sendText(JSON.stringify(db['features'][i]) + '\r\n');
						} catch (e) {  
							}
				}
			}
		}, 1);
	}).listen(port);
}

function staticData() {
	var server = ws.createServer(function (conn) {
		//console.log("New connection");
		conn.on("text", function (str) {
			console.log("Received "+str)
		})
		conn.on("close", function (code, reason) {
			console.log("Connection closed")
  		})
	
		conn.sendText(JSON.stringify(db));
		
	}).listen(8001);
}

function static_html()
{
	var server = http.createServer(function(request, response){
		
		// Website you wish to allow to connect
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Request-Method', '*');
		response.writeHead(200, {'Content-Type':
'application/javascript'});
		response.write(JSON.stringify(db));
		response.end();
	});

	server.listen(8001);
}

dynamicData(8002);
static_html();

/*
var express = require('express');
var app = express();
app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next();
});
app.use(express.static('static'));
app.listen(8081);
*/
