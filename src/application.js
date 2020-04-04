"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const instantiation_1 = require("./core/instantiation/instantiation");
const lifecycle_1 = require("./core/base/common/lifecycle");
const ipc_electron_main_1 = require("./core/base/parts/ipc/electron-main/ipc.electron-main");
const serviceCollection_1 = require("./core/instantiation/serviceCollection");
const windows_1 = require("./services/windows/electron-main/windows");
const lifecycle_2 = require("./services/lifecycle/common/lifecycle");
const descriptors_1 = require("./core/instantiation/descriptors");
const windowsManager_1 = require("./windows/windowsManager");
let Application = class Application extends lifecycle_1.Disposable {
    constructor(instantiationService, lifecycleMainService) {
        super();
        this.instantiationService = instantiationService;
        this.lifecycleMainService = lifecycleMainService;
    }
    async startup() {
        const electronIpcServer = new ipc_electron_main_1.Server(); // 用于注册通信频道
        const appInstantiationService = await this.createServices();
        appInstantiationService.invokeFunction(accessor => this.openFirstWindow(accessor, electronIpcServer));
    }
    async createServices() {
        const services = new serviceCollection_1.ServiceCollection();
        services.set(windows_1.IWindowsMainService, new descriptors_1.SyncDescriptor(windowsManager_1.WindowsManager));
        // TODO: 需要时添加
        return this.instantiationService.createChild(services);
    }
    openFirstWindow(accessor, electronIpcServer) {
        // Signal phase: ready (services set)
        // @ts-ignore
        this.lifecycleMainService.phase = lifecycle_2.LifecycleMainPhase.Ready;
        const windowsMainService = accessor.get(windows_1.IWindowsMainService);
        return windowsMainService.open({});
    }
};
Application = tslib_1.__decorate([
    tslib_1.__param(0, instantiation_1.IInstantiationService),
    tslib_1.__param(1, lifecycle_2.ILifecycleMainService)
], Application);
exports.Application = Application;
