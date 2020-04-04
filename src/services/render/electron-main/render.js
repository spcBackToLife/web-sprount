"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lifecycle_1 = require("../../../core/base/common/lifecycle");
const extensions_1 = require("../../../core/instantiation/extensions");
const instantiation_1 = require("../../../core/instantiation/instantiation");
const render_1 = require("../common/render");
let RenderService = class RenderService extends lifecycle_1.Disposable {
    constructor(instantiationService) {
        super();
        this.instantiationService = instantiationService;
    }
    // 用户可以重写此函数
    // @ts-ignore
    init() {
        return Promise.resolve();
    }
};
RenderService = tslib_1.__decorate([
    tslib_1.__param(0, instantiation_1.IInstantiationService)
], RenderService);
exports.RenderService = RenderService;
extensions_1.registerSingleton(render_1.IRenderService, RenderService);
