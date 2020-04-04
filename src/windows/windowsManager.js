"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lifecycle_1 = require("../core/base/common/lifecycle");
const event_1 = require("../core/base/common/event");
const lifecycle_2 = require("../services/lifecycle/common/lifecycle");
const instantiation_1 = require("../core/instantiation/instantiation");
const log_1 = require("../utils/log");
const window_1 = require("./window");
let WindowsManager = class WindowsManager extends lifecycle_1.Disposable {
    constructor(lifecycleService, instantiationService) {
        super();
        this.lifecycleService = lifecycleService;
        this.instantiationService = instantiationService;
        this._onWindowReady = this._register(new event_1.Emitter());
        this.onWindowReady = this._onWindowReady.event;
        this._onWindowClose = this._register(new event_1.Emitter());
        this.onWindowClose = this._onWindowClose.event;
        console.log('ILifecycleMainService:', lifecycleService);
        console.log('instantiationService:', instantiationService);
        this.lifecycleService.when(lifecycle_2.LifecycleMainPhase.Ready).then(() => this.registerListeners());
    }
    registerListeners() {
        //TODO: @pikun
    }
    getWindowById(windowId) {
        const res = WindowsManager.WINDOWS.filter(window => window.id === windowId);
        if (res && res.length === 1) {
            return res[0];
        }
        return undefined;
    }
    open(openConfig) {
        const window = this.instantiationService.createInstance(window_1.TWindow, {});
        WindowsManager.WINDOWS.push(window);
        // TODO: @pikun
        return [window];
    }
};
WindowsManager.WINDOWS = [];
tslib_1.__decorate([
    log_1.funcLog()
], WindowsManager.prototype, "open", null);
WindowsManager = tslib_1.__decorate([
    tslib_1.__param(0, lifecycle_2.ILifecycleMainService),
    tslib_1.__param(1, instantiation_1.IInstantiationService)
], WindowsManager);
exports.WindowsManager = WindowsManager;
