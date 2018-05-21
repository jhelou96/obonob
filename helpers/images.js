var fs = require('fs');
var request = require('request');

/**
 * Helper class used to perform operations on images
 */
module.exports = {
    /**
     * Function used to download an image
     * @param url Image address
     */
    download: function(url, callback) {
        //Check if file exists
        var magic = {
            jpg: 'ffd8ffe0',
            png: '89504e47',
            gif: '47494638'
        };
        var options = {
            method: 'GET',
            url: url,
            encoding: null
        };
        request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var fileName;
                var magicNumberInBody = body.toString('hex', 0, 4);

                //Filename is based on timestamp to ensure uniqueness
                if (magicNumberInBody == magic.jpg) //Check if file is JPG
                    fileName = Date.now() + '.jpg';
                else if (magicNumberInBody == magic.png) //Check if file is PNG
                    fileName = Date.now() + '.png';
                else if (magicNumberInBody == magic.gif) //Check if file is GIF
                    fileName = Date.now() + '.png';
                else
                    return callback(new Error("Invalid image provided"));

                var stream = request(url).pipe(fs.createWriteStream('public/images/upload/' + fileName));
                stream.on('finish', function() {
                    return callback(null, fileName);
                });
            } else {
                return callback(new Error("Invalid image provided"));
            }
        });
    }
};