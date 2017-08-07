const { exec }  = require('child_process');
const path      = require('path');
const notify    = require('notify-send');

const fileName  = 'phantom.js';
const framerate = 30;
const duration  = 240;
const destPath  = 'videos/';
const videoName = 'video.mp4';

let command = [
    `phantomjs ${fileName}`,
    `| ffmpeg -y -c:v png -f image2pipe -r ${framerate} -t ${duration}`,
    `-i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart`,
    `${path.join(destPath, videoName)}`
].join(' ');

let start = () => {
    console.log('working...');
    console.time('rendering time');

    let child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`rendering error: ${error}`);
            return;
        }
        console.log('done!');
        console.timeEnd('rendering time');
        notify.normal.notify('Track rendering finished');
    });

    child.stdout.on('data', data => console.log(data));
    child.stderr.on('data', data => console.log(data));
    child.on('close', code => console.log(`closing code: ${code}`));
};

start();
