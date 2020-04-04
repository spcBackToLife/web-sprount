"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RenderChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        // 暂时不支持
        throw new Error(`Not support listen event currently: ${event}`);
    }
    // TODO: 暂时不支持调用对象中的对象的函数，只支持1层
    call(_, command, arg) {
        let obj = this.service; // 执行对象
        let execFunc = command; // 执行对象中的函数名
        const funcNameArray = command.split('.');
        const execObjFunction = funcNameArray.length > 1; // 执行对象函数
        if (execObjFunction) {
            obj = this.service[funcNameArray[0]];
            execFunc = funcNameArray[1];
        }
        if (obj.__proto__.hasOwnProperty(execFunc)) {
            return obj[execFunc](...arg);
        }
        throw new Error(`command not found: ${command}`);
    }
}
exports.RenderChannel = RenderChannel;
