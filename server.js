'use strict';

let parseurl = require('parseurl');

class Server {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.info = {};

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
}


module.exports = Server;

