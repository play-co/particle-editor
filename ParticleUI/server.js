var express = require('express');
var ws = require('nodejs-websocket');
var fs = require('fs');
var url = require('url');
var app = express();

var bodyParser = require('body-parser');

var IMAGE_FORMATS = [".png", ".jpg", ".gif", ".tif"];

var PROJECT_FOLDER = process.argv[2];

app.use( bodyParser.json() ); 
app.use(function(req, res, next) {
  var ref = req.header('Referer');
  if (ref) {
    var parsedUrl = url.parse(ref);
    res.header({
      'Access-Control-Allow-Origin': parsedUrl.protocol + '//' + parsedUrl.host,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
  }
  next();
});
if (PROJECT_FOLDER) {
  console.log("Starting up in project folder", PROJECT_FOLDER);
  app.use(express.static(PROJECT_FOLDER));
} else {
  console.log("No project folder found");
}
app.use(express.static('public'));
app.use(express.static('node_modules'));

app.post('/update', function(req, res) {
  res.send("ok");
  if (currentConnection) {
    currentConnection.sendText(JSON.stringify(req.body));
  } else {
    console.log("no connection");
  }
}); 

multiparty = require('connect-multiparty'),
multipartyMiddleware = multiparty(),

// Example endpoint 
app.post('/upload', multipartyMiddleware, function(req, res) {
    var file = req.files.file;
    console.log("moving file to", FILE_DIR + "/" + file.name);
    fs.rename(file.path, FILE_DIR + "/" + file.name, function() {
      res.send("file uploaded");
    });
});


app.get('/files', function(req, res) {
  var imageFiles = [];

  var queue = ["resources"];

  while (queue.length > 0) {
    var folder = queue.pop();

    var files = fs.readdirSync(PROJECT_FOLDER + '/' + folder);
    for (var i = 0; i < files.length; i++) {
      var stats = fs.statSync(PROJECT_FOLDER + '/' + folder + '/' + files[i]);
      if (stats.isFile()) {
        var ext = files[i].substring(files[i].length - 4);
        if (IMAGE_FORMATS.indexOf(ext) >= 0) {
          imageFiles.push(folder + '/' + files[i]);
        }
      } else if (stats.isDirectory()) {
        queue.push(folder + '/' + files[i]);
      }
    }
  }

  res.send(imageFiles);
});


var currentConnection = null;
// Scream server example: "hi" -> "HI!!!" 
var wsServer = ws.createServer(function (conn) {
    currentConnection = conn;
    conn.on("text", function (str) {
        console.log("Received "+str)
        //conn.sendText(str.toUpperCase()+"!!!")
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed", code, reason);
        currentConnection = null;
    })
    conn.on("error", function (code, reason) {
      conn.close();
      currentConnection = null;
      console.log("got connection error", code, reason)
    })
}).listen(8003, function() {
  console.log('Websocket listening at 8001'); 
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
