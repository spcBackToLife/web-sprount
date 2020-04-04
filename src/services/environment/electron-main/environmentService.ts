import * as crypto from 'crypto';
import * as path from 'path';
import { memoize } from '../../../core/base/common/decorator';
import { isWindows } from '../../../core/base/common/platform';
import {
  IEnvironmentService,
} from '../common/environment';
import { app } from 'electron';
import * as upath from 'upath';

export const IPC_HANDLE_TYPE = {
  MAIN: 'main',
  RENDER: 'render',
};

function getIPCHandle(userDataPath: string, type: string): string {
  return isWindows
    ? getWin32IPCHandle(userDataPath, type)
    : getNixIPCHandle(userDataPath, type);
}

function getNixIPCHandle(userDataPath: string, type: string): string {
  return path.join(userDataPath, `${app.getVersion()}-${type}.sock`);
}

function getWin32IPCHandle(userDataPath: string, type: string): string {
  const scope = crypto
    .createHash('md5')
    .update(userDataPath)
    .digest('hex');
  return `\\\\.\\pipe\\${scope}-${app.getVersion()}-${type}-sock`;
}

export class EnvironmentService implements IEnvironmentService {

  _serviceBrand: undefined;

  @memoize
  get userDataPath(): string {
    // TODO: @pikun 当用户改变安装目录的时候，我们可能需要调整此目录？
    return upath.normalizeSafe(app.getPath('userData'));
  }

  // TODO: @pikun 当用户改变安装目录的时候，我们可能需要调整此目录？
  @memoize
  get appRoot(): string {
    return upath.normalize(app.getAppPath());
  }

  @memoize
  get execPath(): string {
    return this._execPath;
  }

  @memoize
  get mainIPCHandle(): string {
    return getIPCHandle(this.userDataPath, IPC_HANDLE_TYPE.MAIN);
  }

  constructor(
    private readonly _execPath: string,
  ) {}
}
