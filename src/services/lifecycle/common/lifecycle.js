"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instantiation_1 = require("../../../core/instantiation/instantiation");
exports.ILifecycleMainService = instantiation_1.createDecorator('lifecycleMainService');
var LifecycleMainPhase;
(function (LifecycleMainPhase) {
    /**
     * The first phase signals that we are about to startup.
     */
    LifecycleMainPhase[LifecycleMainPhase["Starting"] = 1] = "Starting";
    /**
     * Services are ready and first window is about to open.
     */
    LifecycleMainPhase[LifecycleMainPhase["Ready"] = 2] = "Ready";
    /**
     * This phase signals a point in time after the window has opened
     * and is typically the best place to do work that is not required
     * for the window to open.
     */
    LifecycleMainPhase[LifecycleMainPhase["AfterWindowOpen"] = 3] = "AfterWindowOpen";
})(LifecycleMainPhase = exports.LifecycleMainPhase || (exports.LifecycleMainPhase = {}));
