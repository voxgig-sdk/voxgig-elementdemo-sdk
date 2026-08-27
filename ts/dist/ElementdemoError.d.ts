import { Context } from './Context';
declare class ElementdemoError extends Error {
    isElementdemoError: boolean;
    sdk: string;
    code: string;
    ctx: Context;
    status: number;
    get notFound(): boolean;
    constructor(code: string, msg: string, ctx: Context);
}
export { ElementdemoError };
