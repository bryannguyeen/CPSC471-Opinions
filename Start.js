var comment = require('./Comment');
var country = require('./Country');
var group = require('./Group');
var post = require('./Post');
var user = require('./User');
const mysql = require('mysql');



//CreateAccount
var x = 0;

const connection = mysql.createConnection (
  {

    switch(x){
        case 0:
/*      var server = http.createServer(function (request, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("Hello World\n");
      });

      // Listen on port 8000, IP defaults to 127.0.0.1
      server.listen(8000);

      // Put a friendly message on the terminal
      console.log("Server running at http://127.0.0.1:8000/");*/
        break;
      default:
        break;
    }
  }
);

/*
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
*/
