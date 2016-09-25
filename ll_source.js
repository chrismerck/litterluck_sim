var ws = require("nodejs-websocket");

var N = 100; // number of nodes
var ival = 1000*15; // update interval in ms
var ival_rand = 1000*10; // random amount added to update interval
var db = [];

for (i = 0; i < N; i++) {
  db.push({'uid':i,'temp':Math.random()*(85+20)-20,'position':'upright',
    'lat':40.7+0.1*Math.random(), 'lon':-74.0+0.1*Math.random(),
    'next_update':Date.now()+ival*Math.random(),
    'ival':ival + ival_rand*Math.random()
  });
}
 
// Scream server example: "hi" -> "HI!!!" 
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
      if (db[i].next_update < now) {
        db[i].next_update += db[i].ival;
        /* temperature random walk */
        db[i].temp += 2*(Math.random()-0.5);
        /* simulate falling and restoring of assets */
        if (db[i].position == 'upright') {
          if (Math.random() < 0.01) {
            db[i].position = 'fallen';
          }
        } 
        if (db[i].position == 'fallen') {
          if (Math.random() < 0.1) {
            db[i].position = 'upright';
          }
        } 
        jobj = {};
        jobj.uid = db[i].uid;
        jobj.temp = db[i].temp;
        jobj.position = db[i].position;
        jobj.lat = db[i].lat;
        jobj.lon = db[i].lon;
        try {
          conn.sendText(JSON.stringify(jobj)+'\r\n');
        } catch (e) {
        }
      }
    }
  }, 1);
}).listen(8001);


var express = require('express');
var app = express();
app.use(express.static('static'));
app.listen(8080);

