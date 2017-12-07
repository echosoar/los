#!/usr/bin/env node
"use strict";
let program = require('commander');
let http = require('http');
let Server = require('./server.js');
let nowAddr = process.cwd();

program.version('0.1.0')
  .option('-p,--port <n>', 'set port')
  .parse(process.argv);

let port = program.port || '12321';

let httpServerFun = (req, res) => {
    new Server(req, res);
}
http.createServer(httpServerFun).listen(port);

console.log('\n\n---\tLos');
console.log('\n\t-port:\t'+port);
console.log('\n\t-addr:\t'+nowAddr);


