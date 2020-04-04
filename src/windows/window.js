"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lifecycle_1 = require("../core/base/common/lifecycle");
const windows_1 = require("../services/windows/electron-main/windows");
const windows_2 = require("../services/windows/common/windows");
const electron_1 = require("electron");
exports.defaultWindowState = function (mode = windows_1.WindowMode.Normal) {
    return {
        width: 1276,
        height: 795,
        mode
    };
};
const RUN_TEXTMATE_IN_WORKER = false;
class TWindow extends lifecycle_1.Disposable {
    constructor(config) {
        super();
        this.whenReadyCallbacks = [];
        // create browser window
        this.createBrowserWindow(config);
    }
    close() {
        if (this._win) {
            this._win.close();
        }
    }
    sendWhenReady(channel, ...args) {
        if (this.isReady) {
            this.send(channel, ...args);
        }
        else {
            this.ready().then(() => this.send(channel, ...args));
        }
    }
    send(channel, ...args) {
        if (this._win) {
            this._win.webContents.send(channel, ...args);
        }
    }
    setReady() {
        this._readyState = windows_2.ReadyState.READY;
        // inform all waiting promises that we are ready now
        while (this.whenReadyCallbacks.length) {
            this.whenReadyCallbacks.pop()(this);
        }
    }
    ready() {
        return new Promise(resolve => {
            if (this.isReady) {
                return resolve(this);
            }
            // otherwise keep and call later when we are ready
            this.whenReadyCallbacks.push(resolve);
        });
    }
    get isReady() {
        return this._readyState === windows_2.ReadyState.READY;
    }
    get id() {
        return this._id;
    }
    get win() {
        return this._win;
    }
    restoreWindowState(state) {
        // TODO: @pikun
        return exports.defaultWindowState();
    }
    createBrowserWindow(config) {
        this.windowState = this.restoreWindowState(config.state);
        const options = {
            width: this.windowState.width,
            height: this.windowState.height,
            backgroundColor: "#ffffff",
            minWidth: TWindow.MIN_WIDTH,
            minHeight: TWindow.MIN_HEIGHT,
            show: true,
            title: 'electron',
            webPreferences: {
                // By default if Code is in the background, intervals and timeouts get throttled, so we
                // want to enforce that Code stays in the foreground. This triggers a disable_hidden_
                // flag that Electron provides via patch:
                // https://github.com/electron/libchromiumcontent/blob/master/patches/common/chromium/disable_hidden.patch
                backgroundThrottling: false,
                nodeIntegration: true,
                nodeIntegrationInWorker: RUN_TEXTMATE_IN_WORKER,
                webviewTag: true
            }
        };
        this._win = new electron_1.BrowserWindow(options);
        console.log('__dirname:', __dirname);
        // this._win.loadURL(`file://${__dirname}/main-window/index.html`);
        this._win.loadURL('http://localhost:8080');
        this._win.webContents.openDevTools();
        this._id = this._win.id;
    }
    dispose() {
        super.dispose();
        this._win = null;
    }
}
exports.TWindow = TWindow;
TWindow.MIN_WIDTH = 200;
TWindow.MIN_HEIGHT = 120;
