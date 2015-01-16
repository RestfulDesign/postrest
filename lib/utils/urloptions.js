/*global module */

module.exports = (function(){
    "use strict";
    
    // build url options from object
    function urlOptions(o) {

        if (!o || typeof o !== 'object') return '';

        return Object.keys(o).reduce(function (a, b) {
            var c = b + '=' + o[b];
	        return !a ? '?' + c : a + '&' + c;
        }, '');
    }

    return urlOptions;
}());
