#!/usr/bin/env node
"use strict";
let program = require('commander');
let LOS = require('./main.js');

let TestPlugin = require('./test/testPlugin');

new LOS({
  plugins: [
    TestPlugin
  ]
});


