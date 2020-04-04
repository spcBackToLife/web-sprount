"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReadyState;
(function (ReadyState) {
    /**
     * This window has not loaded any HTML yet
     */
    ReadyState[ReadyState["NONE"] = 0] = "NONE";
    /**
     * This window is loading HTML
     */
    ReadyState[ReadyState["LOADING"] = 1] = "LOADING";
    /**
     * This window is navigating to another HTML
     */
    ReadyState[ReadyState["NAVIGATING"] = 2] = "NAVIGATING";
    /**
     * This window is done loading HTML
     */
    ReadyState[ReadyState["READY"] = 3] = "READY";
})(ReadyState = exports.ReadyState || (exports.ReadyState = {}));
