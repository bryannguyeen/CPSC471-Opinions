import * as User from 'User';

const p = new User();

var http = require('http');

http.createServer(function (req, res)
{
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end(p.message());
}).listen(8080);
