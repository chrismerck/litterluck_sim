LitterLuck Data Simulator
=========================

Simulates data from dumpster monitors. The format used to represent the data is
GeoJSON.

Quick Start
----

Install node pre-requisites:

    npm install express nodejs-websocket

Edit the URL of the socket (found in static/index.html) to match
your webserver's address:

    var ws = new WebSocket("ws://your.server.com:8001");

Start the web/websocket server:

    node ll_source.js

View with a modern browser:

    http://your.server.com:8080/index.html

Tweaking
---

To change the number of nodes simulated,
in ll_source.js, change the value of the variable N.

Then exit node, and re-run:

    node ll_source.js

