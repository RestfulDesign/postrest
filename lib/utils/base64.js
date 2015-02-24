/*global module */

/* 
 * Copyright (c) 2015 RestfulDesign (restfuldesign.com), 
 * created by Anders Elo <anders @ restfuldesign com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
module.exports = (function () {
    "use strict";

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    // url encoder/decoder replacements
    var url = {
        '+': '-',
        '/': '_',
        '=': ''
    };

    var Base64 = {
        encode: function (buf) {
            var ret = [],
                x = 0,
                z, b1, b2;

            var len = buf.length;
            var code = buf.charCodeAt ? buf.charCodeAt.bind(buf) : function (i) {
                return buf[i]
            };

            for(var i = 0; i < len; i += 3) {
                // 24 bit triplet
                z = code(i) << 16 | (b1 = code(i + 1)) << 8 | (b2 = code(i + 2));
                // 4 x 6 bits 
                ret[x++] = b64[z >> 18];
                ret[x++] = b64[(z >> 12) & 0x3f];
                ret[x++] = b64[(z >> 6) & 0x3f];
                ret[x++] = b64[z & 0x3f];
            }

            // padding
            if(isNaN(b1)) {
                ret[x - 2] = b64[64];
                ret[x - 1] = b64[64];
            } else if(isNaN(b2)) {
                ret[x - 1] = b64[64];
            }

            return ret.join('');
        },
        decode: function (buf) {
            var ret = [],
                z, x, i, l, b1, b2, w = [];

            var len = buf.length;
            var code = buf.indexOf.bind(b64);

            for(i = 0; i < len; i++) {
                if(i % 4) {
                    b1 = code(buf[i - 1]);
                    b2 = code(buf[i]);
                    z = (b1 << i % 4 * 2) + (b2 >> 6 - i % 4 * 2);
                    w[i >>> 2] |= z << 24 - i % 4 * 8;
                }
            }

            for(i = 0, x = 0, l = w.length; i < l; i++) {
                ret[x++] = String.fromCharCode(w[i] >> 16);
                ret[x++] = String.fromCharCode((w[i] >> 8) & 0xff);
                ret[x++] = String.fromCharCode(w[i] & 0xff);
            }

            // padding
            if(b1 === 64) {
                ret.splice(-2, 2);
            } else if(b2 === 64) {
                ret.pop();
            }

            return ret.join('');
        },
        encodeURL: function (buf) {
            var encoded = this.encode(buf);

            for(var enc in url)
                encoded = encoded.split(enc).join(url[enc]);

            return encoded;
        },
        decodeURL: function (buf) {
            var data, pad;

            for(var enc in url) {
                if(url[enc])
                    data = buf.split(url[enc]).join(enc);
            }

            // padding 
            if((pad = data.length % 4)) {
                data = data.concat(Array(pad + 1).join(b64[64]));
            }

            return this.decode(data);
        }
    };

    return Base64;

}());