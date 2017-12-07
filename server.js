'use strict';

let parseurl = require('parseurl');
let path = require('path');
let fs = require('fs');

class Server {
	constructor(req, res, options) {
		this.req = req;
		this.res = res;
	
		options = options || {};

		this._getExtMap();

		this.defaultIndex = options.defaultIndex || ['index.html', 'index.htm'];
		this.rootDirAddress = options.root || process.cwd();
		this._parseUrl();
		this._targetFile();
	}


	_getExtMap() {
		this.extMap = {
			json: 'application/json',
			js: 'text/javascript',
			css: 'text/css',
		  	html: 'text/html'
		};
	}
	
	/*
	 * @params value : Need to be divided value
	 * @params parmasSplit [default '&']: Field separator
	 * @params valueSplit ['default '=']: Key value separator
	 * */
	_toParams(value, paramsSplit, valueSplit) {
		let params = {};
		value && value.split(valueSplit || '&').map(field => {
			let keyValue = field.split(valueSplit || '=');
			let key = keyValue[0], value = keyValue[1] || false;
			if (params[key] != null) {
				if (params[key].map) {
					params[key].push(value);
				} else {
					params[key] = [params[key], value];
				}
			} else {
				params[key] = value;
			}
		});
		return params;

	}

	_parseUrl() {
		let url = parseurl(this.req);
		this.location = {
			url: url,
			hash: url.hash,
			search: url.search,
			query: url.query
		};
		let pathSearch = {};
		let pathHash = '';

		let path = url.path.replace(/#(.*)$/, '');

		path = path.replace(/\?(.*)$/, '');

		this.location.path = path;
		this.location.queryParams = this._toParams(url.query);

	}


	_fileExists(filePath, fileName) {
		if (fileName) {
			filePath = path.resolve(this.rootDirAddress, './' + filePath, './' + fileName);
		} else {
			filePath= path.resolve(this.rootDirAddress, './' + filePath); 
		}
		this.fileAbsolutePath = filePath;
		return fs.existsSync(filePath);
	}

	_handle404(filePath) {
		this.res.writeHead(404);
		this.res.end();
	}

	_handleListDir(filePath) {}
	_handleReadFile() {
		let ext = /\.([^\.]+)$/.exec(this.fileAbsolutePath);
  		ext = ext[1].toLowerCase();

		if (this['_execFileType_' + ext]) {
			this['_execFileType_' + ext]();
		} else {
			let ctp = this.extMap[ext] || 'text/plain';
  			this.res.writeHead(200, {
				'Content-Type': ctp,
				'Server': 'los by echosoar'
			});
  			this.res.end(fs.readFileSync(this.fileAbsolutePath));
		}
	}

	_targetFile() {
		let filePath = this.location.path.replace(/^\//, ''); // transform /a/b.html/ to a/b.htm/
		if (/\/$/.test(filePath)) { // if filePath is a/b.html/ , transform to a/b.html
			filePath = filePath.replace(/\/$/, '');	
		}
		let filePathArr = filePath.split('/');
		let indexFile = false;
		// not exists file path , redirect to default  index
		if (!filePathArr.length || !/\.[a-z]+/i.test(filePathArr[filePathArr.length -1])) {
			for (let index = 0; index < this.defaultIndex.length; index ++) {
				if (this._fileExists(filePath, this.defaultIndex[index])) {
					indexFile = this.defaultIndex[index];
					break;
				}
			}	
		} else {
			if (this._fileExists(filePath)) {
				indexFile = filePathArr.pop();
			}
		}
		
		if (!indexFile) {
			// file is not exists
			if (this.notExists == 'readDir') {
				this._handleListDir(filePath);
			} else {
				this._handle404(filePath);
			}
		} else {
			this._handleReadFile();
		}	
	}
}


module.exports = Server;

