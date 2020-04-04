import { Disposable } from '../core/base/common/lifecycle';
import { IWindow, IWindowState, WindowMode } from '../services/windows/electron-main/windows';
import { ReadyState } from '../services/windows/common/windows';
import { BrowserWindow } from 'electron';

export interface IWindowCreationOptions {
	state?: IWindowState;
}
export const defaultWindowState = function (mode = WindowMode.Normal): IWindowState {
	return {
		width: 1276,
		height: 795,
		mode
	};
};

const RUN_TEXTMATE_IN_WORKER = false;

export class TWindow extends Disposable implements IWindow {
  private static readonly MIN_WIDTH = 200;
	private static readonly MIN_HEIGHT = 120;

  private _readyState: ReadyState;
	private _id: number;
  private _win: Electron.BrowserWindow | null;
  private windowState: IWindowState;

  private readonly whenReadyCallbacks: { (window: IWindow): void }[];

  close(): void {
		if (this._win) {
			this._win.close();
		}
  }


	sendWhenReady(channel: string, ...args: any[]): void {
		if (this.isReady) {
			this.send(channel, ...args);
		} else {
			this.ready().then(() => this.send(channel, ...args));
		}
	}

	send(channel: string, ...args: any[]): void {
		if (this._win) {
			this._win.webContents.send(channel, ...args);
		}
	}

	setReady(): void {
		this._readyState = ReadyState.READY;

		// inform all waiting promises that we are ready now
		while (this.whenReadyCallbacks.length) {
			this.whenReadyCallbacks.pop()!(this);
		}
	}

	ready(): Promise<IWindow> {
		return new Promise<IWindow>(resolve => {
			if (this.isReady) {
				return resolve(this);
			}

			// otherwise keep and call later when we are ready
			this.whenReadyCallbacks.push(resolve);
		});
	}

	get isReady(): boolean {
		return this._readyState === ReadyState.READY;
	}

	get id(): number {
		return this._id;
	}


	get win(): Electron.BrowserWindow | null {
		return this._win;
	}

	constructor(
		config: IWindowCreationOptions,
	) {
		super();
		this.whenReadyCallbacks = [];

		// create browser window
		this.createBrowserWindow(config);

	}

	private restoreWindowState(state?: IWindowState): IWindowState {
		// TODO: @pikun
		return defaultWindowState();
	}

	private createBrowserWindow(config: IWindowCreationOptions): void {
		this.windowState = this.restoreWindowState(config.state);

		const options: Electron.BrowserWindowConstructorOptions = {
			width: this.windowState.width,
			height: this.windowState.height,
			backgroundColor: "#ffffff",
			minWidth: TWindow.MIN_WIDTH,
			minHeight: TWindow.MIN_HEIGHT,
			show: true,
			title: 'electron',
			webPreferences: {
				// By default if Code is in the background, intervals and timeouts get throttled, so we
				// want to enforce that Code stays in the foreground. This triggers a disable_hidden_
				// flag that Electron provides via patch:
				// https://github.com/electron/libchromiumcontent/blob/master/patches/common/chromium/disable_hidden.patch
				backgroundThrottling: false,
				nodeIntegration: true,
				nodeIntegrationInWorker: RUN_TEXTMATE_IN_WORKER,
				webviewTag: true
			}
		};

		this._win = new BrowserWindow(options);
		console.log('__dirname:', __dirname);
		// this._win.loadURL(`file://${__dirname}/main-window/index.html`);
		this._win.loadURL('http://localhost:8080');
		this._win.webContents.openDevTools();
		this._id = this._win.id;
	}

	dispose(): void {
		super.dispose();
		this._win = null;
	}
}
