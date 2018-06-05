// created by gpake
(function() {
    /**
     * 上传凭证算法实现参考
     * 请注意External Resources项中引用的第三方CryptoJS库
     */
    require("./crypto-js/hmac");
    require("./crypto-js/sha1");
    require("./crypto-js/core");
    const encBase64 = require("./crypto-js/enc-base64");
    const hmacSha1 = require("./crypto-js/hmac-sha1");



    module.exports = {
        upload: upload,
    }

    // 在整个程序生命周期中，只需要 init 一次即可
    // 如果需要变更参数，再调用 init 即可


    function updateConfigWithOptions(options) {
        if (!options.AccessKey) {
            console.error('七牛上传需要你的  AccessKey');
        }
        if (!options.SecretKey) {
            console.error('七牛上传需要你的  SecretKey');
        }
        if (!options.region) {
            console.error('七牛上传需要你的 bucket region');
        }
        if (!options.domain) {
            console.error('七牛上传需要你的  domain');
        }
        if (!options.putPolicy) {
            console.error('七牛上传需要你的  putPolicy');
        }
    }

    function upload(filePath, success, fail, options) {
        if (null == filePath) {
            console.error('上传文件路径错误');
            return;
        }
        if (options) {
            updateConfigWithOptions(options);
        } else {
            console.error('七牛上传参数不存在');
            return
        }


        var url = uploadURLFromRegionCode(options.region);
        var fileName = filePath.split('//')[1];
        if (options && options.key) {
            fileName = options.key;
        }
        var formData = {
            'token': getQiniuToken(options)
        };
        if (!options.qiniuShouldUseQiniuFileName) {
            formData['key'] = fileName
        }
        wx.uploadFile({
            url: url,
            filePath: filePath,
            name: 'file',
            formData: formData,
            success(res) {
                var data = JSON.parse(res.data)
                success({
                    file_name: data.key,
                    url: options.domain + '/' + data.key
                })
            },
            fail(error) {
                fail(error);
            }
        })
    }





    function getQiniuToken(options) {
        //SETP 1
        var timer = new Date().getTime();
        options.putPolicy.deadline += timer;
        var put_policy = JSON.stringify(options.putPolicy);
        // console && console.log("put_policy = ", put_policy);

        //SETP 2
        var encoded = _base64encode(_utf16to8(put_policy));
        // console && console.log("encoded = ", encoded);

        //SETP 3
        var hash = hmacSha1(encoded, options.SecretKey);
        var encoded_signed = hash.toString(encBase64);
        // console && console.log("encoded_signed=", encoded_signed)

        //SETP 4
        return options.AccessKey + ":" + _safe64(encoded_signed) + ":" + encoded;

    }


    function uploadURLFromRegionCode(code) {
        var uploadURL = null;
        switch (code) {
            case 'ECN':
                uploadURL = 'https://up.qbox.me';
                break;
            case 'NCN':
                uploadURL = 'https://up-z1.qbox.me';
                break;
            case 'SCN':
                uploadURL = 'https://upload-z2.qbox.me';
                break;
            case 'NA':
                uploadURL = 'https://up-na0.qbox.me';
                break;
            default:
                console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
        }
        return uploadURL;
    }
    /*
     * Interfaces:
     * b64 = base64encode(data);
     * data = base64decode(b64);
     */
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    function _base64encode(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    /* Interfaces:
     * utf8 = utf16to8(utf16);
     * utf16 = utf8to16(utf8);
     */
    function _utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function _safe64(base64) {
        base64 = base64.replace(/\+/g, "-");
        base64 = base64.replace(/\//g, "_");
        return base64;
    };
})();