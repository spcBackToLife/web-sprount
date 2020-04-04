// 保存了原始类的构造函数，给其装饰更多属性。
export class SyncDescriptor<T> {
  readonly ctor: any;
  readonly staticArguments: any[];
  readonly supportsDelayedInstantiation: boolean;

  constructor(
    ctor: new (...args: any[]) => T,
    staticArguments: any[] = [],
    supportsDelayedINstantiation: boolean = false
  ) {
    this.ctor = ctor;
    this.staticArguments = staticArguments;
    this.supportsDelayedInstantiation = supportsDelayedINstantiation;
  }
}

export interface SyncDescriptor0<T> {
	ctor: any;
	bind(): SyncDescriptor0<T>;
}

export interface SyncDescriptor1<A1, T> {
	ctor: any;
	bind(a1: A1): SyncDescriptor0<T>;
}
