import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import { onMouseEvent } from "./mouse";
import { createLanguageEvent, onKeyboardEvent } from "./keyboard";
const url = require('url');
const path = require('path');

const http = require('http');
const WebSocket = require('ws');
const nativeImage = require('electron').nativeImage;
const { networkInterfaces } = require('os');


function getIp() {
    const nets = networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

function getHost() {
    const interfaces = getIp();
    for (const prop in interfaces) {
        return interfaces[prop]
        break;
    }
}

enum EventType {
    keyboard = 'keyboard',
    mouse = 'mouse',
    password = 'password',
    alert = 'alert'
}

let tray = null;
let contextMenu = null;
let win = null;
let wss = null;
let server = null;

let params = {
    enabled: false,
    port: (process as any).env.PORT | 3000,
    host: getHost(),
    password: ''
}


ipcMain.on('variable-request', function (event, arg) {
    const respObj = {};
    arg.forEach(prop => {
        respObj[prop] = params[prop];
    });
    event.sender.send('variable-reply', respObj);
});

ipcMain.on('variable-change', function (event, arg) {
    arg.host = getHost();
    params = Object.assign(arg);
    event.sender.send('variable-reply', params);
    restartIfCan();
});

function restartIfCan() {
    if (wss !== null) {
        wss.close();
        wss = null;
    }
    if (server !== null) {
        server.close();
        server = null;
    }
    console.log('stopping server...')
    if (params.enabled) {
        startServer();
    }
}

function onTrayClick(menuItem, browserWindow, event) {
    if (menuItem.label === 'open') {
        createWindow();
    }
    if (menuItem.label === 'enabled') {
        params.enabled = !params.enabled
        win && win.webContents.send('variable-reply', { enabled: params.enabled });
        updateTray();
        restartIfCan();
    }
    if (menuItem.label === 'exit') {
        app.quit();
    }
};

function createWindow() {
    if (win !== null) {
        return;
    }
    const image = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAPkSURBVHhe7Zq7b9NAHMe/eaegpOVVdUA8KoYKhEAsMPAYkBADCw8JsbCwIiEGBv4CBibEzAALQiqwMCAeAyoDDCAQAnWAFphQgZI2ok2cxOH3vZxNWvqIHWOD7Y90ucvdOfb367vf2bETTQERJqnzyNL5CCiNAC/2A3UpJ1pVruC2hUFg/XlJZ1t1AdK5AY/kyNNpGTNZXeES7q5piJENINcH7PuhG4LB/ymQECOTOSC7QkwoASOrdEMw+D8FSEZSSgwgxgwwdDWw6RDMKvD6EDD5sGWCWQXyG4E9H3SjvwSzCux4ANR0OSExpTymv/hP8MsgY4L/Y9Am8tcBsQE6jyyxATr3nyKTXAOo1KoKggWvA4bvjePm3TGMvi+hXm+qQO05XPvbqXzSBe+gsnQ6gaEtfTh1dBAnjmzWLb/5w4BDJ+/jy9dZFFZm1MaJv6LePyiPJ7H8s4aBdT14cOuwbmkxxwCKnyob6MnLTU8Ima3U0VvIzjHBjgEc9jzzYRVPqI0aqdXCNoBznsM+7FAjtVrYBoy+n1JzPuxQI7Va2AbU6+Z/H/A6gRqp1cI2wLF2iZ1Jo4bUbEUlltW6M5+g+i1Bu1Z7FRjaO4yBfv0nxXLIJinDwMSu7ZjevEFVFcc/o//lGzSycntr7SGofsvwZWIGo09PqLI9ApyQrNXVQUwNbpAzYKjEMuvYZhFUPye4MiDRaGBadpyqGurfMSaWWcc2i6D6OcGVAWHClQHNVArFsc9o5LLqzxwmllnHNoug+jnBlQFmJq0CT6/s2JTgw8Qy69hmEVQ/J7hbBYhsxsBjzT2eAXUQ8yNxUP2WoOtVIEzE1wHq0yEcgjwIr9Ztr/s5wZUBnH9ertte93NC5GOAKwMYeb1ct73u5wRXBnDZYeDxat32up8T4usA9ekG2aGZzaDRk1eJ5QUPIqh+HRL5IOh+CixCpZbFdKUAs+mtt8mEiWK+jHzG0DXuaZ8CnhpA8bs3vcKV0xcAuTBTYdoLOMJF97kbl/H8486uTfhrBkyU1+DdpT3ihKg33UXlRUnKlV7ewNaLz9Bf+K4r3RHfDLVhG9AaB93BOXru+mUgJ0O0d0YqPEr8LflN/jb30S3tWu0psO3AHaxdnZMVxf2SQv71IEi53yarePvkmPpuG3D8zGOZG7PIZMI9K2o1U2JdD25fO6i+22r5/JyPkMMONVKrhW0AXx7g83M+Qg4r1EaN7S9KzBnvfG7O5+eTpaoaKnp2/NdQA7VQ0/x3A4gdA9rx5RUZH6Ayx6/IRI1wh/wOiA3QeWSJDdB5ZIkN0HlkiQ3QeWSJDdB5ZIkN0HlEAX4BQ+WfH5K4ldcAAAAASUVORK5CYII=');
    image.setTemplateImage(true);
    win = new BrowserWindow({
        width: 460,
        height: 250,
        webPreferences: {
            nodeIntegration: true
        },
        icon: image
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app/app.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.loadFile(`./index.html`)
    win.on('close', () => win = null);
    // win.setMenu(null);
}

function updateTray() {
    if (tray === null) {
        tray = new Tray(nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAM3SURBVHgB7d2BTRtXGMDx71AHYASyARvUnYBuEGeChgmgE9SdoGaDdIK6G6QT5DaoN3C+Z5vIAmMc331KIv9+0uPAZ5NT9Nd7cId1EQAAAAAAAAAAAAAAAMAw3TFPWq1Wl7m5znGTY5LjKsdlcA6WOT5ux79d13045kUHw9oG9T7HbyEkNvocDznmGVn/0pNeDCujakHdhaDYr89xn3E97Nu5N6yMahabWQpeM8u4bp8++CysjGqem7cBx2vL4rvdBy52v9jOVKLia02znT92H/gyY+WOaW7+Cjjdbc5cbXLahJVRXeXmn9icRoBTtVMTbzKu5eNSOA1RMVw7g7D+pe9xxvoUwmIc61nrIqP6NUTFeNZXadpS+HPAuG5aWNcB45p0uRT+Hy7bMK5lC2sVMLKLgALCooSwKCEsSgiLEsKihLAo8VPUWWzHKSbb8ZL7ON39gX2LcMzjWNW5ixO11x76xjGAYz7+mIewFFJCWJQQFiWERQlhUUJYlBAWJYRFCWFRQliUEBYlhEUJYVGi8s9mJgMu6k8O7RxyRf+1f9cxj8P7CilhKaSEsCghLEoIixLCooSwKFEZVrsdxknilbdKdQM45uOPeQgzFiWERQlhUUJYlBAWJYRFCWFRQliUEBYlhEUJYVFCWJQQFiWERQnv0qGEGYsSwqKEsCghLEoIixLCosQ53qTpR3R/YN8i3KTp6GO6O/SN48x8q//nISyFlBAWJYRFCWFRQliUEBYlhEUJYVFCWJQQFiWERQlhUUJYlHCTph+fmzRxPiyFlBAWJYRFCWFRQliUEBYlhEWJFtYyYFzLFlYfMK6PLaxFwLjWYf0dMK5Fu1Z4mZ98ynEZMFzfdd2bi/zQfnifBYxj3j6s7zds1mIkfY5fcrLq1+extrPW7wHDtBuf9+2TLydI84G2HFoSOdUsG3p4/KJ7ujeXxXlu3gYcb55Rvdt94NklnXzCNMxcHG/2NKpm77XCfOJtbtqT+4D92s/l77etPNMdemUui1exWRanOa4CNkG1Fe3P7S99ex0Ma1dGdhObd3Vcb4dTE+ehxdPH5tLfhxz/HQoKAAAAAAAAAAAAAAAAgO/aZ61W23X3F3rhAAAAAElFTkSuQmCC'));
        tray.setToolTip('Remote server');
    }
    if (contextMenu !== null) {
        contextMenu.destroy();
    }
    contextMenu = Menu.buildFromTemplate([
        { label: 'open', type: 'normal', click: onTrayClick },
        { label: 'enabled', type: 'checkbox', checked: params.enabled, click: onTrayClick },
        { label: 'exit', type: 'normal', click: onTrayClick }
    ])
    tray.setContextMenu(contextMenu);
}

function createalertEvent(message: String) {
    return {
        eventType: 'alert',
        message: message
    }
};

function startServer() {
    console.log('starting Server');
    server = http.createServer();

    wss = new WebSocket.Server({ server });

    server.listen(params.port, () => {
        console.log(`start listening`);
        console.dir(params);
    });

    wss.on('connection', function (ws) {
        let kickByPassTimer = setTimeout(() => {
            ws.send(JSON.stringify(createalertEvent('Wrong password!')));
            ws.terminate();
        }, 500);
        ws.on('message', function (message: string) {
            try {
                const data = JSON.parse(message);
                switch (data.eventType) {
                    case EventType.mouse:
                        return onMouseEvent(data);
                    case EventType.keyboard:
                        ws.send(JSON.stringify(createLanguageEvent()));
                        return onKeyboardEvent(data);
                    case EventType.password:
                        if ((data.password === params.password)) {
                            clearTimeout(kickByPassTimer);
                        }
                        break;
                    default:
                        return console.warn('message.eventType is not specified!', data);
                }
            } catch (e) {
                throw e;
            }
        });
        ws.send(JSON.stringify(createLanguageEvent()));
    });
}

app.on('ready', () => {
    updateTray();
    restartIfCan();
})

app.on('window-all-closed', e => e.preventDefault())
