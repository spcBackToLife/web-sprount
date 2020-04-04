/*
 * @Author: pikun
 * @Date: 2019-12-07 17:43:21
 * @LastEditTime: 2019-12-08 14:40:20
 * @Description:
 */
import { SyncDescriptor, SyncDescriptor0, SyncDescriptor1 } from './descriptors';
import { ServiceCollection } from './serviceCollection';

/**
 * 服务装饰器 -> 本质为一个函数
 * 重写函数toString -> 使其返回服务本身名字
 * 具有type字段，其值为空，其类型为服务类型T
 */
export interface ServiceIdentifier<T> {
  (...args: any[]): void;
  type: T;
}
/**
 * 1. 存储已注册的服务装饰器
 * 2. 提供查询方法
 */
export namespace serviceIdManager {
  export const serviceIds = new Map<string, ServiceIdentifier<any>>();

  export const DI_TARGET = '$di$target';
  export const DI_DEPENDENCIES = '$di$dependencies';

  export function getServiceDependencies(
    ctor: any
  ): { id: ServiceIdentifier<any>; index: number; optional: boolean }[] {
    return ctor[DI_DEPENDENCIES] || [];
  }
}

/**
 * id 是函数，函数上有2个属性，`type属性`的`类型`表示服务类型
 * toString()会被重写，返回服务的名字(string).
 * 此函数用于存储服务依赖
 * 依赖关系存储对象本身身上的2个字段：DI_DEPENDENCIES、DI_TARGET
 * DI_DEPENDENCIES：是个数组，表示他所依赖的内容
 * DI_TARGET：是对象本身
 * */
function storeServiceDependency(
  id: Function,
  target: Function, // 被注入服务的那个对象本身
  index: number, // 被注入服务的服务序号，一般会在constructor里注入，指的就是给constructor传参的参数index，比如：constructor(service: service1) 则service的index=0
  optional: boolean
): void {
  if ((target as any)[serviceIdManager.DI_TARGET] === target) {
    (target as any)[serviceIdManager.DI_DEPENDENCIES].push({ id, index, optional });
  } else {
    (target as any)[serviceIdManager.DI_DEPENDENCIES] = [{ id, index, optional }];
    (target as any)[serviceIdManager.DI_TARGET] = target;
  }
}

export function createDecorator<T>(serviceId: string): ServiceIdentifier<T> {
  console.log('createDecorator::::', serviceId);
  if(serviceIdManager.serviceIds.has(serviceId)) {
    // 放置服务装饰器多次构造
    return serviceIdManager.serviceIds.get(serviceId)!;
  }

  const id = <any> function(target: Function, key: string, index: number): any {
    if (arguments.length !== 3) {
      // 此为参数装饰器
      throw new Error(
        '@IServiceName-decorator can only be used to decorate a parameter'
      );
    }
    console.log('save dependence:', id, target);
    // 存储依赖关系
    storeServiceDependency(id, target, index, false);
  }
  id.toString = () => serviceId;
  console.log('id:', id);
  serviceIdManager.serviceIds.set(serviceId, id);
  return id;
}

/**
 * 服务获取接口
 */
export interface ServicesAccessor {
  get<T>(id: ServiceIdentifier<T>): T;
}

/**
 * 创建实例化服务的装饰器
*/
export const IInstantiationService = createDecorator<IInstantiationService>(
  'instantiationService'
);

type GetLeadingNonServiceArgs<Args> =
	Args extends [...BrandedService[]] ? []
	: Args extends [infer A1, ...BrandedService[]] ? [A1]
	: Args extends [infer A1, infer A2, ...BrandedService[]] ? [A1, A2]
	: Args extends [infer A1, infer A2, infer A3, ...BrandedService[]] ? [A1, A2, A3]
	: Args extends [infer A1, infer A2, infer A3, infer A4, ...BrandedService[]] ? [A1, A2, A3, A4]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, ...BrandedService[]] ? [A1, A2, A3, A4, A5]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, ...BrandedService[]] ? [A1, A2, A3, A4, A5, A6]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, ...BrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, infer A8, ...BrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7, A8]
	: never;

/**
 * 实例化服务类型
 */
export interface IInstantiationService {
  _serviceBrand: any;
  invokeFunction<R, TS extends any[] = []>(
    fn: (accessor: ServicesAccessor, ...args: TS) => R,
    ...args: TS
  ): R;
  createInstance<T>(descriptor: SyncDescriptor0 <T>): T;
  createInstance<A1, T>(descriptor: SyncDescriptor1<A1, T>, a1: A1): T;

  createInstance<A1, T>(ctor: IConstructorSignature1<A1, T>, first: A1): T;
  createInstance<A1, A2, T>(ctor: IConstructorSignature2<A1, A2, T>, first: A1, second: A2): T;
	createInstance<A1, A2, A3, T>(ctor: IConstructorSignature3<A1, A2, A3, T>, first: A1, second: A2, third: A3): T;
	createInstance<A1, A2, A3, A4, T>(ctor: IConstructorSignature4<A1, A2, A3, A4, T>, first: A1, second: A2, third: A3, fourth: A4): T;
	createInstance<A1, A2, A3, A4, A5, T>(ctor: IConstructorSignature5<A1, A2, A3, A4, A5, T>, first: A1, second: A2, third: A3, fourth: A4, fifth: A5): T;
	createInstance<A1, A2, A3, A4, A5, A6, T>(ctor: IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6): T;
	createInstance<A1, A2, A3, A4, A5, A6, A7, T>(ctor: IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7): T;
	createInstance<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7, eigth: A8): T;

  createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(t: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
	createInstance<Services extends BrandedService[], Ctor extends new (...services: Services) => any, R extends InstanceType<Ctor>>(t: Ctor): R;

  createChild(services: ServiceCollection): IInstantiationService;
}

export type BrandedService = { _serviceBrand: undefined };

export interface IConstructorSignature0<T> {
	new(...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature1<A1, T> {
	new(first: A1, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature2<A1, A2, T> {
	new(first: A1, second: A2, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature3<A1, A2, A3, T> {
	new(first: A1, second: A2, third: A3, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature4<A1, A2, A3, A4, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature5<A1, A2, A3, A4, A5, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature6<A1, A2, A3, A4, A5, A6, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7, ...services: { _serviceBrand: undefined; }[]): T;
}

export interface IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7, eigth: A8, ...services: { _serviceBrand: undefined; }[]): T;
}
