"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const log_1 = require("./utils/log");
const serviceCollection_1 = require("./core/instantiation/serviceCollection");
const environmentService_1 = require("./services/environment/electron-main/environmentService");
const environment_1 = require("./services/environment/common/environment");
const lifecycleMainService_1 = require("./services/lifecycle/electron-main/lifecycleMainService");
const descriptors_1 = require("./core/instantiation/descriptors");
const lifecycle_1 = require("./services/lifecycle/common/lifecycle");
const instantiationService_1 = require("./core/instantiation/instantiationService");
const application_1 = require("./application");
class ExpectedError extends Error {
    constructor() {
        super(...arguments);
        this.isExpected = true;
    }
}
class MainProcess {
    constructor() {
        this.initEnvironment();
        electron_1.app.once('ready', () => this.startup());
    }
    async startup() {
        const instantiationService = this.createServices();
        // 其实需要的是一个对象去保存这个instance实例，做后续使用，在这里因为非初始化时即有，因此不宜做对象属性
        return instantiationService.createInstance(application_1.Application).startup();
    }
    createServices() {
        const services = new serviceCollection_1.ServiceCollection();
        // 环境服务
        const environmentService = new environmentService_1.EnvironmentService(process.execPath);
        services.set(environment_1.IEnvironmentService, environmentService);
        services.set(lifecycle_1.ILifecycleMainService, new descriptors_1.SyncDescriptor(lifecycleMainService_1.LifecycleService));
        return new instantiationService_1.InstantiationService(services, true);
    }
    initEnvironment() {
        this.configureCommandlineSwitche();
    }
    /**
     * 设置一些chrome内核设置，用于开启或关闭某些功能以解决一些问题
     */
    configureCommandlineSwitche() {
        electron_1.app.commandLine.appendSwitch('disable-color-correct-rendering');
    }
    quit(accessor, reason) {
        //TODO: @pikun
    }
}
tslib_1.__decorate([
    log_1.funcLog()
], MainProcess.prototype, "startup", null);
tslib_1.__decorate([
    log_1.funcLog()
], MainProcess.prototype, "createServices", null);
new MainProcess();
