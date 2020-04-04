"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 保存了原始类的构造函数，给其装饰更多属性。
class SyncDescriptor {
    constructor(ctor, staticArguments = [], supportsDelayedINstantiation = false) {
        this.ctor = ctor;
        this.staticArguments = staticArguments;
        this.supportsDelayedInstantiation = supportsDelayedINstantiation;
    }
}
exports.SyncDescriptor = SyncDescriptor;
