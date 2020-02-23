import {onMouseEvent} from "./mouse";
import {createLanguageEvent, onKeyboardEvent} from "./keyboard";

const http = require('http');
const WebSocket = require('ws');

const {
    PORT = 3000
} = process.env;

enum EventType {
    keyboard = 'keyboard',
    mouse = 'mouse',
}

console.log('starting Server');
const server = http.createServer();

const wss = new WebSocket.Server({server});

server.listen(PORT, () => console.log(`start listening ${PORT}`));

wss.on('connection', function (ws) {
    ws.on('message', function (message: string) {
        try {
            const data = JSON.parse(message);
            switch (data.eventType) {
                case EventType.mouse:
                    return onMouseEvent(data);
                case EventType.keyboard:
                    ws.send(JSON.stringify(createLanguageEvent()));
                    return onKeyboardEvent(data);
                default:
                    return console.warn('message.eventType is not specified!');
            }
        } catch (e) {
            throw e;
        }
    });
    ws.send(JSON.stringify(createLanguageEvent()));
});