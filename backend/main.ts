import {app, BrowserWindow, Menu, Tray} from 'electron';
import {onMouseEvent} from "./mouse";
import {createLanguageEvent, onKeyboardEvent} from "./keyboard";

const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const {
    PORT = 3000
} = process.env;

enum EventType {
    keyboard = 'keyboard',
    mouse = 'mouse',
}

let tray = null;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js')
        }
    });
    mainWindow.loadFile('../index.html');

    mainWindow.webContents.openDevTools()
}

function ready() {
    tray = new Tray('keyboard-icon-dark.png');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Close', type: 'normal'}
    ]);
    tray.setToolTip('Remote server');
    tray.setContextMenu(contextMenu);
    tray.addListener('click', () => {
        createWindow()
    });
    createWindow();
}

app.on('ready', ready);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

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