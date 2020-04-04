"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 1. 存储已注册的服务装饰器
 * 2. 提供查询方法
 */
var serviceIdManager;
(function (serviceIdManager) {
    serviceIdManager.serviceIds = new Map();
    serviceIdManager.DI_TARGET = '$di$target';
    serviceIdManager.DI_DEPENDENCIES = '$di$dependencies';
    function getServiceDependencies(ctor) {
        return ctor[serviceIdManager.DI_DEPENDENCIES] || [];
    }
    serviceIdManager.getServiceDependencies = getServiceDependencies;
})(serviceIdManager = exports.serviceIdManager || (exports.serviceIdManager = {}));
/**
 * id 是函数，函数上有2个属性，`type属性`的`类型`表示服务类型
 * toString()会被重写，返回服务的名字(string).
 * 此函数用于存储服务依赖
 * 依赖关系存储对象本身身上的2个字段：DI_DEPENDENCIES、DI_TARGET
 * DI_DEPENDENCIES：是个数组，表示他所依赖的内容
 * DI_TARGET：是对象本身
 * */
function storeServiceDependency(id, target, // 被注入服务的那个对象本身
index, // 被注入服务的服务序号，一般会在constructor里注入，指的就是给constructor传参的参数index，比如：constructor(service: service1) 则service的index=0
optional) {
    if (target[serviceIdManager.DI_TARGET] === target) {
        target[serviceIdManager.DI_DEPENDENCIES].push({ id, index, optional });
    }
    else {
        target[serviceIdManager.DI_DEPENDENCIES] = [{ id, index, optional }];
        target[serviceIdManager.DI_TARGET] = target;
    }
}
function createDecorator(serviceId) {
    console.log('createDecorator::::', serviceId);
    if (serviceIdManager.serviceIds.has(serviceId)) {
        // 放置服务装饰器多次构造
        return serviceIdManager.serviceIds.get(serviceId);
    }
    const id = function (target, key, index) {
        if (arguments.length !== 3) {
            // 此为参数装饰器
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        console.log('save dependence:', id, target);
        // 存储依赖关系
        storeServiceDependency(id, target, index, false);
    };
    id.toString = () => serviceId;
    console.log('id:', id);
    serviceIdManager.serviceIds.set(serviceId, id);
    return id;
}
exports.createDecorator = createDecorator;
/**
 * 创建实例化服务的装饰器
*/
exports.IInstantiationService = createDecorator('instantiationService');
