export const info = (...info: any[]) => {
  console.log(`[*]run-info:`, ...info);
}

export const runError =  (...info: string[]) => {
  console.error(`[*]run-error:`, ...info);
}
/**
 * 仅限函数使用
 */
export const funcLog = (showParams = false, showReturns =false) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		if (descriptor === undefined) {
			// 此为参数装饰器
			throw new Error(
				'@FuncRunningLog-decorator can only be used to decorate a function'
			);
		}
		const origin = target[propertyKey];
		// aop
		target[propertyKey] = function(...args: any[]) {
				console.log(`[*]run ${target.constructor.name}-${propertyKey} with params:`, showParams ? args : '');
				let result = origin.apply(this, args)
				if (showReturns) {
					console.log(`[*]run ${target.constructor.name}-${propertyKey} with return:`, `${result}`);
				}
				return result;
		}
		return target[propertyKey];
	}
}
