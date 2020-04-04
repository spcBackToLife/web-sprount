import { createDecorator } from '../../../core/instantiation/instantiation';

export const IEnvironmentService = createDecorator<IEnvironmentService>('environmentService');

export interface IEnvironmentService {
  _serviceBrand: undefined;

	execPath: string; // 应用执行路径
	appRoot: string; // 应用根目录
	userDataPath: string; // 用户运行数据缓存目录
	mainIPCHandle: string;
}
