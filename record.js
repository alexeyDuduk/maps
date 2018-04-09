const { exec }  = require('child_process');
const path      = require('path');

let start = (hash, key, resolve, reject) => {

    const fileName  = 'phantom.js';
    const framerate = 1;
    const duration  = 30;//240;
    const destPath  = 'videos/';
    const videoName = `video-${hash}.mp4`;
    const fullPath  = path.join(destPath, videoName);
    const port = process.env.PORT || 9996;

    let command = [
        `phantomjs ${fileName} ${hash} ${key} ${port}`,
        `| ffmpeg -y -c:v png -f image2pipe -framerate ${framerate} -t ${duration}`,
        //'-analyzeduration 2147483647 -probesize 2147483647',
        `-i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart -r 25`,
        `${fullPath}`
    ].join(' ');
    // phantomjs phantom.js 1 g1VvrKDyBQx0OPVAtfFsSLmK8duD1wzWueKy1UuH-FZomXLCvQRV662-ywNkLwyHh1y0pJF4MgPL4VfdfRfKbYq0jItDPU1vFJDw7KGTHPAM2P43IvPpQ7woaJudzH91tLOXWWuGgxlgYTV7UJPOrQ.. | ffmpeg -y -c:v png -f image2pipe -r 30 -t 30 -analyzeduration 2147483647 -probesize 2147483647 -i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart f:\turvo\esri-maps\maps\videos\video-1.mp4

    //command = `cp data/points-${hash}.json ${fullPath}`;

    console.log('working...');
    console.time('rendering time');

    let child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`rendering error: ${error}`);
            return;
        }
        console.log('done!');
        console.timeEnd('rendering time');
        resolve({fullPath});
    });

    child.stdout.on('data', data => console.log(data));
    child.stderr.on('data', data => console.log(data));
    child.on('close', code => reject({code}));
};

module.exports = (hash, key) => new Promise((resolve, reject) => start(hash, key, resolve, reject));
