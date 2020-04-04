import { ipcMain as ipc, app } from 'electron';
import { Disposable } from '../../../core/base/common/lifecycle';
import { Event, Emitter } from '../../../core/base/common/event';
import { isMacintosh, isWindows } from '../../../core/base/common/platform';
import { Barrier } from '../../../core/base/common/async';
import { info, funcLog, runError } from '../../../utils/log';
import { ILifecycleMainService, LifecycleMainPhase, ShutdownEvent } from '../common/lifecycle';

export class LifecycleService extends Disposable implements ILifecycleMainService {

  _serviceBrand: undefined;

  private windowCounter = 0;

  private _phase: LifecycleMainPhase = LifecycleMainPhase.Starting;
  get phase(): LifecycleMainPhase { return this._phase; }

  private phaseWhen = new Map<LifecycleMainPhase, Barrier>();
  private pendingQuitPromiseResolve: { (veto: boolean): void } | null = null;

  private pendingWillShutdownPromise: Promise<void> | null = null; // 当在退出中的时候，不再执行退出操作

  private _wasRestarted: boolean = false;
	get wasRestarted(): boolean { return this._wasRestarted; }

	private _quitRequested = false;
	get quitRequested(): boolean { return this._quitRequested; }

  private readonly _onBeforeShutdown = this._register(new Emitter<void>());
	readonly onBeforeShutdown: Event<void> = this._onBeforeShutdown.event;

	private readonly _onWillShutdown = this._register(new Emitter<ShutdownEvent>());
  readonly onWillShutdown: Event<ShutdownEvent> = this._onWillShutdown.event;

  private pendingQuitPromise: Promise<boolean> | null = null;

  constructor() {
		super();
		info('lifecycle isntances');
		this.when(LifecycleMainPhase.Ready).then(() => this.registerListeners());
  }

  @funcLog()
  private registerListeners(): void {

		app.addListener('before-quit', () => this.beforeQuitListener());

		app.addListener('window-all-closed', () => this.windowAllClosedListener());

		app.once('will-quit', (e) => this.willQuitListener(e));
  }

  @funcLog()
  private beforeQuitListener() {
		if (this._quitRequested) {
			return;
		}
		this._quitRequested = true;
		this._onBeforeShutdown.fire();

		// macOS: can run without any window open. in that case we fire
		// the onWillShutdown() event directly because there is no veto
		// to be expected.
		if (isMacintosh && this.windowCounter === 0) {
			this.beginOnWillShutdown();
		}
  }

  @funcLog()
  private windowAllClosedListener() {
		app.quit();
  }

  @funcLog()
  private willQuitListener(e: any) {
		e.preventDefault();
		const shutdownPromise = this.beginOnWillShutdown();
		shutdownPromise.finally(() => {
			app.removeListener('before-quit', this.beforeQuitListener);
			app.removeListener('window-all-closed', this.windowAllClosedListener);
			app.quit();
		});
	}

  @funcLog()
  private beginOnWillShutdown(): Promise<void> {
		if(this.pendingWillShutdownPromise) {
			return this.pendingWillShutdownPromise;
		}

		const joiners: Promise<void>[] = [];// 发出事件，搜集在结束前其余地方可能需要做什么，都放入joiners里一起做
		this._onWillShutdown.fire({
			join(promise) {
				if(promise) {
					joiners.push(promise);
				}
			}
		});
		this.pendingWillShutdownPromise = Promise.all(joiners).then(() => undefined, runError);
		return this.pendingWillShutdownPromise;
  }

  set phase(value: LifecycleMainPhase) {
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

  async when(phase: LifecycleMainPhase): Promise<void> {
		if (phase <= this._phase) {
			return;
		}

		let barrier = this.phaseWhen.get(phase);
		if (!barrier) {
			barrier = new Barrier();
			this.phaseWhen.set(phase, barrier);
		}

		await barrier.wait();
  }

  kill(code?: number): void {
		app.exit(code);
  }

  quit(fromUpdate?: boolean): Promise<boolean> {
		if (this.pendingQuitPromise) { return this.pendingQuitPromise; }

		this.pendingQuitPromise = new Promise(resolve => {
			//TODO: @pikun doesn't understand here, need to be clear!
			console.log('quit before promise');
			this.pendingQuitPromiseResolve = resolve;
			// Calling app.quit() will trigger the close handlers of each opened window
			// and only if no window vetoed the shutdown, we will get the will-quit event
			console.log('quit after promise');
			app.quit();
		});

		return this.pendingQuitPromise;

	}
}
