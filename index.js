var serialport = require('serialport');

/* Bean doesn't enumerate…
function getPorts(cb) {
  serialport.list(function (e, arr) {
    if (e) throw (e);
    else cb(null, arr.filter(function (port) {
      return port.locationId;
    }).map(function (port) {
      return port.comName;
    }));
  });
}

getPorts(function (e, arr) {
  if (e) throw e;
  else if (!arr.length) throw Error("No serial port found");
  else console.log(arr);
});
*/


var port = new serialport.SerialPort("/dev/cu.LightBlue-Bean").on('open', function () {
  console.log("OPEN!");
}).on('error', function (e) {
  console.warn("error:", e);
});

port.on('data', function (d) {
  console.log("said:", d.toString());
  //if (d.toString() === "I received:") _sendNumber();
});

var _n = 0;
port.on('open', function () {
  setInterval(_sendNumber, 1e3);
});
function _sendNumber() {
  port.write(String.fromCharCode(0x30+_n));
}
function sendNumber(n) {
  if (_n !== n) process.nextTick(_sendNumber);
  _n = n;
}


var http = require('http'),
    static = require('serve-static')('static/'),
    WebSocket = require('faye-websocket');
http.createServer(function (req, res) {
  var url = require('url').parse(req.url, true),
      path = url.pathname.split('/');
  if (req.url.indexOf('/api/') === 0) textResponse(res, 426, "Not HTTP…");
  else static(req, res, function (e) {
    if (e) textResponse(res, 500, e.stack);
    else textResponse(res, 404, "Not found.");
  });
}).on('upgrade', function (req, sock, body) {
  if (WebSocket.isWebSocket(req)) {
    var ws = new WebSocket(req, sock, body);
    function sendJSON(d) {
      ws.send(JSON.stringify(d));
    }
    console.log("ws opened");
    ws.on('message', function (evt) {
      var d = JSON.parse(evt.data);
      console.log("received:", d, d.a === +1);
      
      if (d.a === 0 && d.b === 0) sendNumber(0);
      else if (d.a === +1 && d.b === +1) sendNumber(4);
      else if (d.a === +1 && d.b === -1) sendNumber(2);
      else if (d.a === -1 && d.b === +1) sendNumber(3);
      else if (d.a === -1 && d.b === -1) sendNumber(1);
      else sendNumber(0);
    });
    ws.on('close', function (evt) {
      console.log("ws closed", evt.code, evt.reason);
    });
  } else textResponse(400, "WebSocket only.");
}).listen(8000, function () {
  console.log("listening on port", this.address().port);
});

function textResponse(res, code, str) {
    res.writeHead(code, {'content-type':"text/plain; charset=utf-8"});
    res.end(str);
}
