"use strict";
import http from 'https';
import WebSocket from 'ws';
import { authorized } from './myutils.mjs';
import { createReadStream, readFileSync } from 'fs';
import { pipeline } from 'stream';
import { createGzip } from 'zlib';

const server = http.createServer({
    cert: readFileSync('tls/server.cert'),
    key: readFileSync('tls/server.key')
}, async(req, res) => {
    const user = await authorized(req, res);
    if (!user) return
    try {
        const fileStream = createReadStream('client' + (req.url == '/' ? "/index.html" : req.url))
        res.writeHead(200, {
            'Content-Type': 'text/html;charset=UTF-8',
            'Content-Encoding': 'gzip'
        });
        const gzip = createGzip();
        pipeline(fileStream, gzip, res, () => {});
    } catch {
        return res.writeHead(404).end();
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', async(ws, req) => {
    const user = (await authorized(req)).username;
    ws.on('message', raw => {
        const message = JSON.parse(raw);
        message.from = user;
        wss.clients.forEach(ws => ws.send(JSON.stringify(message)));
    })
});

server.listen(443, () => console.log('Server listening: ' + server.listening));