#!/usr/bin/env node
"use strict";
let program = require('commander');
let http = require('http');
let parseurl = require('parseurl');
let fs = require('fs');
let path = require('path');

let nowAddr = process.cwd();



program.version('0.1.0')
  .option('-p,--port <n>', 'set port')
  .parse(process.argv);

let port = program.port || '12321';
let requestPath = '';

let absolutePath = filePath => path.resolve(nowAddr, './'+filePath);

let checkPathIsFile = filePath => {
  let stat = fs.statSync(filePath);
  return stat.isFile();
}

let checkFileExit = filePath => fs.existsSync(filePath);

let extMap = {
  json: 'application/json',
  js: 'text/javascript',
  css: 'text/css',
  html: 'text/html'
}

let readFile = ( res, filePath ) => {
  console.log('\n\t[FILE] ' + requestPath);
  let ext = /\.([^\.]+)$/.exec(filePath);
  ext = ext[1].toLowerCase();
  let ctp = extMap[ext] || 'text/plain';
  res.writeHead(200, {'Content-Type': ctp});
  res.end(fs.readFileSync(filePath));
}

let readDir = ( res, filePath, requestNotExists ) => {
  console.log('\n\t[Dir] ' + (requestNotExists?'[NotExist] ':'') + requestPath + (requestNotExists? ' -> '+filePath.replace(nowAddr, ''): ''));

  let dirArr = fs.readdirSync(filePath);
  let dirList = [], fileList = [];
  dirArr.map(item => {
    let stat = fs.statSync(path.resolve(filePath, './'+item));
    if(stat.isFile()) {
      fileList.push(item);
    }else{
      dirList.push(item);
    }
  })
  let reHTML = `
    <style>
    body {
      margin: 0;
    }
    div {
      padding: 2px 6px;
    }
    .path {

      line-height: 36px;
      font-size: 18px;
      font-weight: bold;
    }
    .divTitle {
      height: 24px;
      line-height: 24px;
      font-size: 14px;
      color: #fff;
      background: #999;
    }
    </style>
    <div class="path">${requestPath} -> ${filePath.replace(nowAddr, '') || '/'}</div>
    <div class="divTitle">Dir List:</div>
    <div>
      ${
        dirList.map(item=>{
          return `<div><a href="./${item}/">${ item }</a></div>`;
        }).join('')
      }
    </div>
    <div class="divTitle">File List:</div>
    <div>
      ${
        fileList.map(item=>{
          return `<div><a href="./${item}">${ item }</a></div>`;
        }).join('')
      }
    </div>
  `;
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(reHTML);
}


let httpServerFun = (req, res) => {
  let url = parseurl(req);
  url.path = url.path.replace(/\?.*$/, '');
  requestPath = url.path;
  let temPath = absolutePath(url.path);

  if(!/\/[^/]+\.[^/]+$/.test(temPath) && !checkFileExit(temPath)) {
    temPath = path.resolve(temPath, './index.html');
  }


  let isFileExist = checkFileExit(temPath);
  if(isFileExist) {
    if(checkPathIsFile(temPath)) {
      readFile(res, temPath);
    }else{
      readDir(res, temPath);
    }
  }else{
    while(!isFileExist) {
      temPath = path.resolve(temPath, '../');
      isFileExist = checkFileExit(temPath);
    }
    readDir(res, temPath, true);
  }
}

http.createServer(httpServerFun).listen(port);

console.log('\n\n---\tLos');
console.log('\n\t-port:\t'+port);
console.log('\n\t-addr:\t'+nowAddr);
console.log('\n\t-path:\thttp://127.0.0.1:'+port);


