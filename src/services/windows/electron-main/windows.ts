import { createDecorator } from '../../../core/instantiation/instantiation';
import { Event } from '../../../core/base/common/event';
export interface IWindowState {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	mode?: WindowMode;
	display?: number;
}

export enum WindowMode {
	Maximized,
	Normal,
	Minimized, // not used anymore, but also cannot remove due to existing stored UI state (needs migration)
	Fullscreen
}



export interface IWindow {
	readonly id: number;
	readonly win: Electron.BrowserWindow | null;

	readonly isReady: boolean;
	ready(): Promise<IWindow>;

	send(channel: string, ...args: any[]): void;
	sendWhenReady(channel: string, ...args: any[]): void;

	close(): void;

	dispose(): void;
}

export const IWindowsMainService = createDecorator<IWindowsMainService>('windowsMainService');

export interface IWindowsCountChangedEvent {
	readonly oldCount: number;
	readonly newCount: number;
}

export interface IWindowsMainService {
	_serviceBrand: undefined;
	readonly onWindowReady: Event<IWindow>;

	getWindowById(windowId: number): IWindow | undefined;

	open(openConfig: IOpenConfiguration): IWindow[];
}


export interface IOpenConfiguration {
	readonly contextWindowId?: number;
}
