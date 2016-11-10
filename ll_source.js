// TODO: Make the update of data independant of having a connection open.
// A possible way to do this is through events. Have the update function simply
// fire an event that there was an update and things can subscribe to that
// event and handle it.

var ws = require("nodejs-websocket");
var http = require('http');
var N = 100; // number of nodes
var ival = 1000*15; // update interval in ms
var ival_rand = 1000*10; // random amount added to update interval
//The 'database' to hold all of the data; in GeoJSON format.
var db = { 	'type': 'FeatureCollection',
		'features': [] };
/* Schema: histData: {
*		Asset#: {
			time#:	{
					temp:value,
					stance:value
				}
			}
		     }
*/
var histData = {};
for(i = 0; i < N; i++) {
	var temp = Math.random()*(85+20)-20;
	var stance = 'upright';
	var uid = i;
	db['features'].push(
  	{  
		'type': 'Feature',
		'geometry': {
			'type': 'Point',
		  'coordinates': [-74.0+0.1*Math.random(),40.7+0.1*Math.random()]
		},
		'properties': {
			'uid': uid,
			'temp': temp,
			'stance': stance,
			'next_update': Date.now()+ival*Math.random(),
			'interval_value': ival + ival_rand*Math.random()
		}
	});
	time = Date.now().toString();
	histData[uid] = { };
	histData[uid][time] = { 'temp': temp, 'stance':stance };
}

function updateData(id,now)
{
	var isUpdated = false;
	var dataProp = db["features"][id].properties;
	var coordinates = db["features"][id].geometry.coordinates;
	if (dataProp.next_update < now) {
		isUpdated = true;
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
		//Updating the historical records as well.
		histData[id][now] = { 'temp':dataProp.temp, 'stance':dataProp.stance};
	}
	return isUpdated;
	
}

function dynamicData(port) {
	var server = ws.createServer(function (conn) {
		console.log("New connection");
		conn.on("text", function (str) {
			console.log("Received "+str);
		});
		conn.on("close", function (code, reason) {
			console.log("Connection closed");
  		});
		setInterval(function() {
			for (i=0; i<N; i++) {
				currntTime = Date.now();
				isUpdated = updateData(i,currntTime);
				if(isUpdated){
					try {
						conn.sendText(JSON.stringify(db['features'][i]) + '\r\n' + JSON.stringify(histData[i]));
						} catch(e) {
					}
				}
			}
		}, 1)
	}).listen(port);
}

// On the connect of the client, sends the full historical data. Does not
// update it, that is left to dynamicData(), therefore is called only 1 time.
function historicalData(port)
{
	var server = ws.createServer(function (conn) {
		try {
			conn.sendText(JSON.stringify(histData));
		} catch(e) {
		}
	}).listen(port);
}

function staticHtml()
{
	var server = http.createServer(function(request, response) {
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
historicalData(8003);
staticHtml();
dynamicData(8002);
