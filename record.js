const { exec }  = require('child_process');
const path      = require('path');

let start = (hash, key, resolve, reject) => {

    const fileName  = 'phantom.js';
    const framerate = 30;
    const duration  = 30;//240;
    const destPath  = 'videos/';
    const videoName = `video-${hash}.mp4`;
    const fullPath  = path.join(destPath, videoName);

    let command = [
        `phantomjs ${fileName} ${hash} ${key}`,
        `| ffmpeg -y -c:v png -f image2pipe -r ${framerate} -t ${duration}`,
        '-analyzeduration 2147483647 -probesize 2147483647',
        `-i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart`,
        `${fullPath}`
    ].join(' ');
    // phantomjs phantom.js f18eb830-3aa4-11e8-865e-55b7a8e7d166 9cxT4o-PgGm19tZp1pvEKKmN0d1y0zY_reNzxvdrhBPB_vKtx4Ef5ETo_I2HS31Vh6JPVZHCWjl9EnnQbvdh04l-u9_ghW4et7EgKa361B0ElCogo8VYLvFJT-HR57sDrD33tIuRUm6Pw-cYBmkkpg.. | ffmpeg -y -c:v png -f image2pipe -r 30 -t 30 -analyzeduration 2147483647 -probesize 2147483647 -i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart f:\turvo\esri-maps\maps\videos\video-1.mp4

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
