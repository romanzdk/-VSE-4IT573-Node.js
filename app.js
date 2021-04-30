"use strict";
import http from 'https';
import WebSocket from 'ws';
import { authorized, Middleware, delay } from './myutils.mjs';
import { createReadStream, readFileSync } from 'fs';
import { pipeline } from 'stream';
import { createGzip } from 'zlib';
import express from 'express';
import { setYOffset } from './businessLogic.mjs'

const app = express();
app.use(async(req, res, next) => {
    req.user = await authorized(req, res);
    next()
});
app.use((req, res, next) => {
    if (req.user) next()
});
app.use(express.static('client'));

const server = http.createServer({
        cert: readFileSync('tls/server.cert'),
        key: readFileSync('tls/server.key')
    },
    app
);

const wss = new WebSocket.Server({ server });
const mw = new Middleware;

mw.use((next, mes, ws, req) => {
    mes.from = req.user.username;
    if (mes.from) next();
});
mw.use(async next => {
    await delay(1000);
})
mw.use(setYOffset);
mw.use((next, mes, ws, req, wss) => {
    wss.clients.forEach(ws => ws.send(JSON.stringify(mes)))
});

wss.on('connection', async(ws, req) => {
    req.user = await authorized(req);
    ws.on('message', raw => {
        const message = JSON.parse(raw);
        mw.go(message, ws, req, wss);
        // message.from = user;
        // wss.clients.forEach(ws => ws.send(JSON.stringify(message)));
    })
});

server.listen(443, () => console.log('Server listening: ' + server.listening));