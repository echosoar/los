'use strict';

let parseurl = require('parseurl');
let path = require('path');

class Server {
	constructor(req, res, options) {
		this.req = req;
		this.res = res;
	
		options = options || {};

		this.defaultIndex = options.defaultIndex || ['index.html', 'index.htm'];
		this.rootDirAddress = option.root || process.cwd();
		this._parseUrl();
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
			filePath = path.resolve(filePath, './' + fileName);
		}
		filePath = path.resolve(this.rootDirAddress, './' + filePath); 
	}

	_targetFile() {
		let filePath = this.location.path.replace(/^\//, ''); // transform /a/b.html/ to a/b.htm/
		if (/\/$/.test(filePath) { // if filePath is a/b.html/ , transform to a/b.html
			filePath = filePath.replace(/\/$/, '');	
		}
		let filePathArr = filePath.split('/');
		let indexFile = false;
		// not exists file path , redirect to default  index
		if (!filePathArr.length || !/\.[a-z]+/i.test(filePathArr[filePathArr.length -1]) {
			for (let index = 0; index < this.defaultIndex.length; index ++) {
				if (this._fileExists(filePath, this.defaultIndex[index]) {
					indexFile = this.defaultIndex[index];
					break;
				}
			}	
		} else {
			if (this._fileExists(filePath)) {
				indexFile = filePathArr.pop();
			}
		}
		
	}
}


module.exports = Server;

