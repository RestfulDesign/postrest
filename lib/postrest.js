/*global require module */

module.exports = (function(){
    "use strict";
    

    var Connection = require('./connection');
    var Api = require('./api');
    var utils = require('./utils');
    var request = require('./request');

    Api.use(
        [
            require('./api/database')
        ]
    );
    
    function PostRest(url){
        if(!(this instanceof PostRest)){
            return new PostRest(url);
        }

        Api.load(this);
        
        this.connection = new Connection(url);
    }

    PostRest.prototype = {
        "resolver": utils.promise,
        "api": function (ns) {
	        if (!ns) return Api.list();

	        Api.load(this, ns);
        },
        "request": function(method, path, data, headers, callback) {
	        var options, resolver;

	        if(['GET','HEAD','DELETE','OPTIONS'].indexOf(method) >=0){
	            callback = headers;
	            headers = data;
	            data = undefined;
	        }

	        if(typeof callback !== 'function')
                resolver = new this.resolver();
	        
	        if(data && typeof data !== 'string') {
	            try {
		            data = JSON.stringify(data);
	            } catch (err) {
		            return resolver ? resolver.reject(err) : callback(err); 
	            }
	        }

	        options = utils.extend(true, {}, this.connection, {headers:headers});
	        
	        path = '/_db/' + this.connection.database + '/' + this.connection.schema + '/' + path;

	        //console.log(method,path,options,data);
            
	        request(method, path, options, data, resolver || callback);
	        
	        return resolver;
        }
    };

    ['get','put','post','patch','delete','head','options'].forEach(function(method){
        PostRest.prototype[method] = function(path,data,headers){
	        var option, callback = this.__callback;

	        if(this.__headers) {
	            headers = utils.extend(true,{},headers,this.__headers);
	        }
	        
	        if(this.__options) {
	            option = utils.url.options(this.__options);

	            path+= '&' + option.substr(1);
	        }
	        
	        return this.request(method.toUpperCase(), path, data, headers, callback);
        };
    });
    
    return PostRest;
    
})();
