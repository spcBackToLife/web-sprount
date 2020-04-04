import { createDecorator } from '../../../core/instantiation/instantiation';
import { Event, Emitter } from '../../../core/base/common/event';

export const ILifecycleMainService = createDecorator<ILifecycleMainService>('lifecycleMainService');

export enum LifecycleMainPhase {

	/**
	 * The first phase signals that we are about to startup.
	 */
	Starting = 1,

	/**
	 * Services are ready and first window is about to open.
	 */
	Ready = 2,

	/**
	 * This phase signals a point in time after the window has opened
	 * and is typically the best place to do work that is not required
	 * for the window to open.
	 */
	AfterWindowOpen = 3
}

export interface ShutdownEvent {

	/**
	 * Allows to join the shutdown. The promise can be a long running operation but it
	 * will block the application from closing.
	 */
	join(promise: Promise<void>): void;
}

export interface ILifecycleMainService {
  _serviceBrand: undefined;
  phase: LifecycleMainPhase; // 生命周期阶段
  readonly onBeforeShutdown: Event<void>;
  readonly onWillShutdown: Event<ShutdownEvent>;
  quit(fromUpdate?: boolean): Promise<boolean /* veto */>;
  kill(code?: number): void;
  when(phase: LifecycleMainPhase): Promise<void>;
}
