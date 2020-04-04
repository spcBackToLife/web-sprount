import { Disposable } from '../core/base/common/lifecycle';
import { Emitter, Event as CommonEvent } from '../core/base/common/event';
import { IWindow, IWindowsMainService, IOpenConfiguration } from '../services/windows/electron-main/windows';
import { ILifecycleMainService, LifecycleMainPhase } from '../services/lifecycle/common/lifecycle';
import { IInstantiationService } from '../core/instantiation/instantiation';
import { funcLog } from '../utils/log';
import { TWindow } from './window';

export class WindowsManager extends Disposable implements IWindowsMainService {
  _serviceBrand: undefined;
  private static readonly WINDOWS: IWindow[] = [];

  private readonly _onWindowReady = this._register(new Emitter<IWindow>());
	readonly onWindowReady: CommonEvent<IWindow> = this._onWindowReady.event;

	private readonly _onWindowClose = this._register(new Emitter<number>());
  readonly onWindowClose: CommonEvent<number> = this._onWindowClose.event;

  constructor(
		@ILifecycleMainService private readonly lifecycleService: ILifecycleMainService,
		@IInstantiationService private readonly instantiationService: IInstantiationService
		) {
    super();
    console.log('ILifecycleMainService:', lifecycleService);
    console.log('instantiationService:', instantiationService);
		this.lifecycleService.when(LifecycleMainPhase.Ready).then(() => this.registerListeners());
  }

  private registerListeners(): void {
		//TODO: @pikun
  }

  getWindowById(windowId: number): IWindow | undefined {
		const res = WindowsManager.WINDOWS.filter(window => window.id === windowId);
		if (res && res.length === 1) {
			return res[0];
		}

		return undefined;
	}

	@funcLog()
	open(openConfig: IOpenConfiguration): IWindow[] {
		const window = this.instantiationService.createInstance(TWindow, {});
		WindowsManager.WINDOWS.push(window);
		// TODO: @pikun
		return [window];
	}
}
