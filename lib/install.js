var https = require('https');
var fs = require('fs');
var os = require('os');
var path = require('path');

var infoByOS = {
    darwin: {
        src: "https://raw.githubusercontent.com/imagemin/pngquant-bin/v1.0.1/vendor/osx/pngquant",
        dest: "../vendor/osx/pngquant"
    },
    win32: {
        src: "https://raw.githubusercontent.com/imagemin/pngquant-bin/v1.0.1/vendor/win/pngquant.exe",
        dest: "../vendor/win32/pngquant.exe"
    }
};

var info = infoByOS[os.platform()];
if (!info) {
    console.error("Cannot determine info for platform=", os.platform());
    process.exit(-1);
}

function download(src, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(src, function (response) {
        if (response.statusCode !== 200) {
            console.error("No data from server - statusCode=", response.statusCode);
            process.exit(-1);
        } else {
            response.pipe(file);
            file.on('finish', function () {
                file.close(function () {
                    fs.chmod(dest, 0755, cb);
                });
            });
        }
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        cb(err);
    });
};

var dest = path.join(__dirname, info.dest);
download(info.src, dest, function (err) {
    if (err) {
        console.error("Error: ", err);
        process.exit(-1);
    }
});
