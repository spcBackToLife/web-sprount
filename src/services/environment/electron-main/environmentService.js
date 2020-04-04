"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const path = require("path");
const decorator_1 = require("../../../core/base/common/decorator");
const platform_1 = require("../../../core/base/common/platform");
const electron_1 = require("electron");
const upath = require("upath");
exports.IPC_HANDLE_TYPE = {
    MAIN: 'main',
    RENDER: 'render',
};
function getIPCHandle(userDataPath, type) {
    return platform_1.isWindows
        ? getWin32IPCHandle(userDataPath, type)
        : getNixIPCHandle(userDataPath, type);
}
function getNixIPCHandle(userDataPath, type) {
    return path.join(userDataPath, `${electron_1.app.getVersion()}-${type}.sock`);
}
function getWin32IPCHandle(userDataPath, type) {
    const scope = crypto
        .createHash('md5')
        .update(userDataPath)
        .digest('hex');
    return `\\\\.\\pipe\\${scope}-${electron_1.app.getVersion()}-${type}-sock`;
}
class EnvironmentService {
    constructor(_execPath) {
        this._execPath = _execPath;
    }
    get userDataPath() {
        // TODO: @pikun 当用户改变安装目录的时候，我们可能需要调整此目录？
        return upath.normalizeSafe(electron_1.app.getPath('userData'));
    }
    // TODO: @pikun 当用户改变安装目录的时候，我们可能需要调整此目录？
    get appRoot() {
        return upath.normalize(electron_1.app.getAppPath());
    }
    get execPath() {
        return this._execPath;
    }
    get mainIPCHandle() {
        return getIPCHandle(this.userDataPath, exports.IPC_HANDLE_TYPE.MAIN);
    }
}
tslib_1.__decorate([
    decorator_1.memoize
], EnvironmentService.prototype, "userDataPath", null);
tslib_1.__decorate([
    decorator_1.memoize
], EnvironmentService.prototype, "appRoot", null);
tslib_1.__decorate([
    decorator_1.memoize
], EnvironmentService.prototype, "execPath", null);
tslib_1.__decorate([
    decorator_1.memoize
], EnvironmentService.prototype, "mainIPCHandle", null);
exports.EnvironmentService = EnvironmentService;
