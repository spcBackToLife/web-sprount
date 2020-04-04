"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = (...info) => {
    console.log(`[*]run-info:`, ...info);
};
exports.runError = (...info) => {
    console.error(`[*]run-error:`, ...info);
};
/**
 * 仅限函数使用
 */
exports.funcLog = (showParams = false, showReturns = false) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor === undefined) {
            // 此为参数装饰器
            throw new Error('@FuncRunningLog-decorator can only be used to decorate a function');
        }
        const origin = target[propertyKey];
        // aop
        target[propertyKey] = function (...args) {
            console.log(`[*]run ${target.constructor.name}-${propertyKey} with params:`, showParams ? args : '');
            let result = origin.apply(this, args);
            if (showReturns) {
                console.log(`[*]run ${target.constructor.name}-${propertyKey} with return:`, `${result}`);
            }
            return result;
        };
        return target[propertyKey];
    };
};
