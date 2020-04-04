"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instantiation_1 = require("../../../core/instantiation/instantiation");
var WindowMode;
(function (WindowMode) {
    WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
    WindowMode[WindowMode["Normal"] = 1] = "Normal";
    WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
    WindowMode[WindowMode["Fullscreen"] = 3] = "Fullscreen";
})(WindowMode = exports.WindowMode || (exports.WindowMode = {}));
exports.IWindowsMainService = instantiation_1.createDecorator('windowsMainService');
