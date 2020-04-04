import { Disposable } from '../../../core/base/common/lifecycle';
import { registerSingleton } from '../../../core/instantiation/extensions';
import { IInstantiationService } from '../../../core/instantiation/instantiation';
import { IRenderService } from '../common/render';

export class RenderService extends Disposable implements IRenderService {
  _serviceBrand: undefined;

  constructor(
    @IInstantiationService
    public readonly instantiationService: IInstantiationService,
  ) {
    super();
  }

  // 用户可以重写此函数
  // @ts-ignore
  init(): Promise<any> {
    return Promise.resolve();
  }
}

registerSingleton(IRenderService, RenderService);
