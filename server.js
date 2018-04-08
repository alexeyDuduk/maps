const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const uuid = require('uuid/v1');
const logger = require('morgan');
const path = require('path')

const promisify = require('./promisify');
const record = require('./record');
const mailer = require('./mailer');

const TEN_MB = 10 * 1024 * 1024;


const app = express();
app.use(bodyParser.json({ limit: TEN_MB, type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: TEN_MB, type: 'application/x-www-form-urlencoded', extended: true }));

//app.use('/api/data', express.static(path.resolve(__dirname, 'data')));
app.use(express.static(path.resolve(__dirname, 'dist')));
app.use(logger('dev'));

app.use('/api/render', (request, response) => {
    const { sendTo, data, key } = request.body;
    const serializedData = JSON.stringify(data);
    const hash = '1';

    console.log('SERVER: on request', hash, key);
    if (!fs.existsSync('./dist/data')){
        fs.mkdirSync('./dist/data');
    }
    promisify(fs.writeFile.bind(fs, `./dist/data/points-${hash}.json`, serializedData))
        .catch((e) => {
            response.writeHead(500);
            response.end(e.message);

            return Promise.reject(e);
        })
        .then(() => {
            console.log('SERVER: created file');

            response.writeHead(200);
            response.end();
        })
        .then(() => record(hash, key))
        .then(() => mailer({
            videoPath: `./videos/video-${hash}.mp4`,
            sendTo
        }))
        .then(() => {
            console.log('Done');
        })
        .catch(e => console.error(e));
});

const server = http.createServer(app);
const port = process.env.PORT || 9996;
server.listen(port, () => {
        console.log(`start listening server on port ${port}`);
})
.on('error', () => {
    console.log(`start listening server on port ${port}`);
});