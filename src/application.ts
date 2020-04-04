import { IInstantiationService, ServicesAccessor } from './core/instantiation/instantiation';
import { Disposable } from './core/base/common/lifecycle';
import { Server as ElectronIPCServer } from './core/base/parts/ipc/electron-main/ipc.electron-main';
import { ServiceCollection } from './core/instantiation/serviceCollection';
import { IWindow, IWindowsMainService } from './services/windows/electron-main/windows';
import { LifecycleMainPhase, ILifecycleMainService } from './services/lifecycle/common/lifecycle';
import { SyncDescriptor } from './core/instantiation/descriptors';
import { WindowsManager } from './windows/windowsManager';
export class Application extends Disposable {

  constructor(
    @IInstantiationService private readonly instantiationService: IInstantiationService,
    @ILifecycleMainService private readonly lifecycleMainService: ILifecycleMainService,) {
    super();
  }

  async startup(): Promise<void> {
    const electronIpcServer = new ElectronIPCServer(); // 用于注册通信频道
    const appInstantiationService = await this.createServices();
    appInstantiationService.invokeFunction(accessor => this.openFirstWindow(accessor, electronIpcServer));
  }

  private async createServices(): Promise<IInstantiationService> {
    const services = new ServiceCollection();
    services.set(IWindowsMainService, new SyncDescriptor(WindowsManager));
    // TODO: 需要时添加
		return this.instantiationService.createChild(services);
  }

  private openFirstWindow(accessor: ServicesAccessor, electronIpcServer: ElectronIPCServer): IWindow[] {

		// Signal phase: ready (services set)
		// @ts-ignore
		this.lifecycleMainService.phase = LifecycleMainPhase.Ready;

		const windowsMainService = accessor.get(IWindowsMainService);
		return windowsMainService.open({});
	}
}
