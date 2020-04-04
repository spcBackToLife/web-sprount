"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const lifecycle_1 = require("../../../core/base/common/lifecycle");
const event_1 = require("../../../core/base/common/event");
const platform_1 = require("../../../core/base/common/platform");
const async_1 = require("../../../core/base/common/async");
const log_1 = require("../../../utils/log");
const lifecycle_2 = require("../common/lifecycle");
class LifecycleService extends lifecycle_1.Disposable {
    constructor() {
        super();
        this.windowCounter = 0;
        this._phase = lifecycle_2.LifecycleMainPhase.Starting;
        this.phaseWhen = new Map();
        this.pendingQuitPromiseResolve = null;
        this.pendingWillShutdownPromise = null; // 当在退出中的时候，不再执行退出操作
        this._wasRestarted = false;
        this._quitRequested = false;
        this._onBeforeShutdown = this._register(new event_1.Emitter());
        this.onBeforeShutdown = this._onBeforeShutdown.event;
        this._onWillShutdown = this._register(new event_1.Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        this.pendingQuitPromise = null;
        log_1.info('lifecycle isntances');
        this.when(lifecycle_2.LifecycleMainPhase.Ready).then(() => this.registerListeners());
    }
    get phase() { return this._phase; }
    get wasRestarted() { return this._wasRestarted; }
    get quitRequested() { return this._quitRequested; }
    registerListeners() {
        electron_1.app.addListener('before-quit', () => this.beforeQuitListener());
        electron_1.app.addListener('window-all-closed', () => this.windowAllClosedListener());
        electron_1.app.once('will-quit', (e) => this.willQuitListener(e));
    }
    beforeQuitListener() {
        if (this._quitRequested) {
            return;
        }
        this._quitRequested = true;
        this._onBeforeShutdown.fire();
        // macOS: can run without any window open. in that case we fire
        // the onWillShutdown() event directly because there is no veto
        // to be expected.
        if (platform_1.isMacintosh && this.windowCounter === 0) {
            this.beginOnWillShutdown();
        }
    }
    windowAllClosedListener() {
        electron_1.app.quit();
    }
    willQuitListener(e) {
        e.preventDefault();
        const shutdownPromise = this.beginOnWillShutdown();
        shutdownPromise.finally(() => {
            electron_1.app.removeListener('before-quit', this.beforeQuitListener);
            electron_1.app.removeListener('window-all-closed', this.windowAllClosedListener);
            electron_1.app.quit();
        });
    }
    beginOnWillShutdown() {
        if (this.pendingWillShutdownPromise) {
            return this.pendingWillShutdownPromise;
        }
        const joiners = []; // 发出事件，搜集在结束前其余地方可能需要做什么，都放入joiners里一起做
        this._onWillShutdown.fire({
            join(promise) {
                if (promise) {
                    joiners.push(promise);
                }
            }
        });
        this.pendingWillShutdownPromise = Promise.all(joiners).then(() => undefined, log_1.runError);
        return this.pendingWillShutdownPromise;
    }
    set phase(value) {
        if (value < this.phase) {
            throw new Error('Lifecycle cannot go backwards');
        }
        if (this._phase === value) {
            return;
        }
        this._phase = value;
        const barrier = this.phaseWhen.get(this._phase);
        if (barrier) {
            barrier.open();
            this.phaseWhen.delete(this._phase);
        }
    }
    async when(phase) {
        if (phase <= this._phase) {
            return;
        }
        let barrier = this.phaseWhen.get(phase);
        if (!barrier) {
            barrier = new async_1.Barrier();
            this.phaseWhen.set(phase, barrier);
        }
        await barrier.wait();
    }
    kill(code) {
        electron_1.app.exit(code);
    }
    quit(fromUpdate) {
        if (this.pendingQuitPromise) {
            return this.pendingQuitPromise;
        }
        this.pendingQuitPromise = new Promise(resolve => {
            //TODO: @pikun doesn't understand here, need to be clear!
            console.log('quit before promise');
            this.pendingQuitPromiseResolve = resolve;
            // Calling app.quit() will trigger the close handlers of each opened window
            // and only if no window vetoed the shutdown, we will get the will-quit event
            console.log('quit after promise');
            electron_1.app.quit();
        });
        return this.pendingQuitPromise;
    }
}
tslib_1.__decorate([
    log_1.funcLog()
], LifecycleService.prototype, "registerListeners", null);
tslib_1.__decorate([
    log_1.funcLog()
], LifecycleService.prototype, "beforeQuitListener", null);
tslib_1.__decorate([
    log_1.funcLog()
], LifecycleService.prototype, "windowAllClosedListener", null);
tslib_1.__decorate([
    log_1.funcLog()
], LifecycleService.prototype, "willQuitListener", null);
tslib_1.__decorate([
    log_1.funcLog()
], LifecycleService.prototype, "beginOnWillShutdown", null);
exports.LifecycleService = LifecycleService;
