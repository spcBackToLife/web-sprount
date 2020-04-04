import { app } from 'electron';
import { funcLog } from './utils/log';
import { IInstantiationService, ServicesAccessor } from './core/instantiation/instantiation';
import { ServiceCollection } from './core/instantiation/serviceCollection';
import { EnvironmentService } from './services/environment/electron-main/environmentService';
import { IEnvironmentService } from './services/environment/common/environment';
import { LifecycleService } from './services/lifecycle/electron-main/lifecycleMainService';
import { SyncDescriptor } from './core/instantiation/descriptors';
import { ILifecycleMainService } from './services/lifecycle/common/lifecycle';
import { InstantiationService } from './core/instantiation/instantiationService';
import { Application } from './application';

class ExpectedError extends Error {
	readonly isExpected = true;
}

class MainProcess {

  constructor() {

    this.initEnvironment();

    app.once('ready', () => this.startup());
  }

  @funcLog()
  private async startup(): Promise<void> {
    const instantiationService = this.createServices();
    // 其实需要的是一个对象去保存这个instance实例，做后续使用，在这里因为非初始化时即有，因此不宜做对象属性
    return instantiationService.createInstance(Application).startup();
  }

  @funcLog()
  private createServices(): IInstantiationService {
		const services = new ServiceCollection();
		// 环境服务
		const environmentService = new EnvironmentService(process.execPath);
		services.set(IEnvironmentService, environmentService);
		services.set(ILifecycleMainService, new SyncDescriptor(LifecycleService));
		return new InstantiationService(services, true);
	}

  private initEnvironment() {
    this.configureCommandlineSwitche();
  }

  /**
   * 设置一些chrome内核设置，用于开启或关闭某些功能以解决一些问题
   */
  private configureCommandlineSwitche() {
    app.commandLine.appendSwitch('disable-color-correct-rendering');
  }

  private quit(accessor: ServicesAccessor, reason?: ExpectedError | Error): void {
		//TODO: @pikun
	}
}


new MainProcess();
