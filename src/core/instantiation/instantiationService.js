"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("./graph");
const instantiation_1 = require("./instantiation");
const descriptors_1 = require("./descriptors");
const serviceCollection_1 = require("./serviceCollection");
const async_1 = require("../base/common/async");
const util_1 = require("../../utils/util");
/**
 * 处理循环依赖错误
 */
class CyclicDependencyError extends Error {
    constructor(graph) {
        super('cyclic dependency between services');
        this.message = graph.toString();
    }
}
class InstantiationService {
    constructor(services = new serviceCollection_1.ServiceCollection(), strict = false, userObjs = {}, parent) {
        this._services = services;
        this._strict = strict;
        this._parent = parent;
        this._userObjs = userObjs;
        this._services.set(instantiation_1.IInstantiationService, this);
    }
    createChild(services) {
        return new InstantiationService(services, this._strict, this._userObjs, this);
    }
    /**
     * 反转函数
     */
    invokeFunction(fn, ...args) {
        let _done = false;
        try {
            const accessor = {
                get: (id) => {
                    if (_done) {
                        throw Error('service accessor is only valid during the invocation of its target method');
                    }
                    const result = this._getOrCreateServiceInstance(id);
                    if (!result) {
                        throw new Error(`[invokeFunction] unknown service '${id}'`);
                    }
                    return result;
                },
            };
            return fn.apply(undefined, [accessor, ...args]);
        }
        finally {
            _done = true;
        }
    }
    _getOrCreateServiceInstance(id) {
        const service = this._getServiceInstanceOrDescriptor(id);
        // 如果是装饰类，则去实例化，否则直接返回实例。
        return service instanceof descriptors_1.SyncDescriptor
            ? this._createAndCacheServiceInstance(id, service)
            : service;
    }
    _getServiceInstanceOrDescriptor(id) {
        const instanceOrDesc = this._services.get(id);
        if (!instanceOrDesc && this._parent) {
            return this._parent._getServiceInstanceOrDescriptor(id);
        }
        else {
            return instanceOrDesc;
        }
    }
    /**
     *
     * @param id
  - 实例化类并缓存直容器中
     * 实例化类并缓存直容器中
     */
    _createAndCacheServiceInstance(id, desc) {
        // 构建依赖关系有向图
        const graph = new graph_1.Graph(data => data.id.toString());
        let cycleCount = 0;
        const stack = [{ id, desc }]; // 放入需要实例化的服务
        // 向图中写入此服务以及此服务依赖所需实例化的依赖
        while (stack.length) {
            const item = stack.pop();
            graph.lookupOrInsertNode(item); // 向图里插入需要实例化的服务
            // a weak but working heuristic for cycle checks
            // 创建图的时候做循环依赖判断，构建图的时候放置循环依赖导致无限构建。
            // 此方法有一个弊端，如果是线性依赖到100个，则也会提示，因此，我们可以根据需求适当调整大小即可，比如100->150个依赖。
            // 但一般也用不完100
            if (cycleCount++ > 100) {
                console.log('cycleCount > 100');
                throw new CyclicDependencyError(graph);
            }
            for (const dependency of instantiation_1.serviceIdManager.getServiceDependencies(item.desc.ctor)) {
                const instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
                // 如果当前节点依赖的服务不存在于此服务集合中，并且此服务是必须要实例化的依赖，则报错。
                if (!instanceOrDesc && !dependency.optional) {
                    console.warn(`[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`);
                }
                // 如果此依赖服务还未实例化，则需要放入有向图中，去寻找它的依赖并实例化它。
                // 同时也需要将其作为一条依赖边画入有向图，表明`item`与此服务的依赖关系。
                if (instanceOrDesc instanceof descriptors_1.SyncDescriptor) {
                    const d = { id: dependency.id, desc: instanceOrDesc };
                    graph.insertEdge(item, d);
                    stack.push(d);
                }
            }
        }
        // 根据有向图依赖关系，依次实例化服务
        while (true) {
            const roots = graph.roots(); // roots是只有被依赖，没有依赖其他的元素。
            if (roots.length === 0) {
                if (!graph.isEmpty()) {
                    // 再次检测图里的循环依赖，这里我很疑问，前面构建图的时候已经检测了一次，为啥这里还需检测一次？
                    // 防止死循环？
                    console.log('期待这种情况出现：', graph);
                    throw new CyclicDependencyError(graph);
                }
                // 表示所有节点依赖服务均已实例化完毕
                break;
            }
            for (const { data } of roots) {
                const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation);
                this._setServiceInstance(data.id, instance);
                graph.removeNode(data);
            }
        }
        return this._services.get(id);
    }
    createInstance(ctorOrDescriptor, ...rest) {
        let result;
        if (ctorOrDescriptor instanceof descriptors_1.SyncDescriptor) {
            result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest));
        }
        else {
            result = this._createInstance(ctorOrDescriptor, rest);
        }
        return result;
    }
    // 存放至相应的instance池里。
    _setServiceInstance(id, instance) {
        if (this._services.get(id) instanceof descriptors_1.SyncDescriptor) {
            this._services.set(id, instance);
        }
        else if (this._parent) {
            this._parent._setServiceInstance(id, instance);
        }
        else {
            throw new Error('illegalState - setting UNKNOWN service instance');
        }
    }
    /**
     *
     * @param id
     * @param ctor
     * @param args
     * @param supportsDelayedInstantiation - 是否支持延迟实例化
     * 从具有注册还服务的intantiationService中去实例化，所以叫withowner
     */
    _createServiceInstanceWithOwner(id, ctor, args = [], supportsDelayedInstantiation) {
        if (this._services.get(id) instanceof descriptors_1.SyncDescriptor) {
            return this._createServiceInstance(ctor, args, supportsDelayedInstantiation);
        }
        else if (this._parent) {
            // 看父级有没有，如果顶层都没有，则报错，表示未注册此服务。
            return this._parent._createServiceInstanceWithOwner(id, ctor, args, supportsDelayedInstantiation);
        }
        else {
            throw new Error('illegalState - creating UNKNOWN service instance');
        }
    }
    /**
     *
     * @param ctor
     * @param args
  - 从当前服务池里找到服务，开始初始化
     * 从当前服务池里找到服务，开始初始化
     */
    _createServiceInstance(ctor, args = [], _supportsDelayedInstantiation) {
        if (!_supportsDelayedInstantiation) {
            // eager instantiation or no support JS proxies (e.g. IE11)
            // 不支持延迟实例化，则立即实例化
            return this._createInstance(ctor, args);
        }
        else {
            // 使用代理对象延迟实例化
            // Return a proxy object that's backed by an idle value. That
            // strategy is to instantiate services in our idle time or when actually
            // needed but not when injected into a consumer
            const idle = new async_1.IdleValue(() => this._createInstance(ctor, args));
            // 此处代理对象Proxy会在调用这个实例的时候做拦截，然后去idel.getValue()获得实例。
            return new Proxy(Object.create(null), {
                get(_target, prop) {
                    return idle.getValue()[prop];
                },
                set(_target, p, value) {
                    idle.getValue()[p] = value;
                    return true;
                },
            });
        }
    }
    _createInstance(ctor, args = []) {
        // args 只包含非注入的参数，即不是@xxx 开头的
        const serviceDependencies = instantiation_1.serviceIdManager
            .getServiceDependencies(ctor)
            .sort((a, b) => a.index - b.index);
        const serviceArgs = [];
        for (const dependency of serviceDependencies) {
            const service = this._getOrCreateServiceInstance(dependency.id);
            if (!service && this._strict && !dependency.optional) {
                throw new Error(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`);
            }
            serviceArgs.push(service);
        }
        // 标记第一注入服务是在参数中的位置
        const firstServiceArgPos = serviceDependencies.length > 0
            ? serviceDependencies[0].index
            : args.length;
        if (args.length !== firstServiceArgPos) {
            // 处理的是当普通参数与注入的参数位置冲突的时候，报错，表示不支持。
            // 只支持注入参数在普通参数的后面。
            console.error(`[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments, we only support 'normal params' before 'injected params'`);
        }
        const instance = new ctor(...[...args, ...serviceArgs]);
        return this.injectUserObjs(ctor.name, instance);
    }
    injectUserObjs(serviceName, instance) {
        if (serviceName === 'RenderService') {
            // 仅有此服务需要注册用户代码
            Object.keys(this._userObjs).forEach(obj => {
                const isClass = (object) => /^class\s/.test(Function.prototype.toString.call(object));
                if (isClass(this._userObjs[obj])) {
                    console.log('isClass:', obj);
                    // TODO: 挂载对象，但不可以在构造函数里自定义参数
                    instance.__proto__[util_1.lowerCaseFirst(obj)] = new this._userObjs[obj](instance);
                }
                else {
                    console.log('functions:', obj);
                    instance.__proto__[obj] = (...args) => {
                        return this._userObjs[obj](instance, ...args);
                    };
                }
            });
        }
        return instance;
    }
}
exports.InstantiationService = InstantiationService;
