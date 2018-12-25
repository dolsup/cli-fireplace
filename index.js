#! /usr/bin/env node

var yauzl = require('yauzl');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var filename = 'fireplace.yaml';
var zippath = path.join(__dirname, 'data/fireplace.yaml.zip')
var filepath = path.join(__dirname, filename);
var playCmd = path.join(__dirname, 'node_modules/ascii-video-play-only/main.js');
var frameRate = Number(process.argv[1]) || Number(process.argv[2]) || 30; // $ cli-fireplace 10 // $ node index.js 10

if (typeof frameRate !== 'number' || isNaN(frameRate)) {
    console.warn('frameRate should be a number. (default = 30)');
    console.warn('Example: $ cli-fireplace 10');
    process.exit(1);
}

if (fs.existsSync(filepath)) {
    play();
} else {
    try {
        // unzip video file
        var writeStream = fs.createWriteStream(filepath);
        console.log('building a fire...');
        yauzl.open(zippath, function (err, zip) {
            if (err) throw err;
            zip.on('entry', function (entry) {
                zip.openReadStream(entry, function (err, readStream) {
                    if (err) throw err;
                    readStream.pipe(writeStream);
                    readStream.on('end', play);
                });
            });
        });
    } catch (e) {
        console.error(e);
        fs.unlinkSync(filepath);
        process.exit(1);
    }
}

function play() {
    var fire = spawn('node', [playCmd, 'play', filepath, '--frame_rate=' + frameRate], {
        stdio: 'inherit',
    });

    fire.on('close', function (code, signal) {
        if (code != 0) {
            console.warn('The fire went out with ' + signal);
            process.exit(code);
        } else {
            setImmediate(play);
        }
    });
}