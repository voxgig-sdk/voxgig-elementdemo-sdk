import type { Context, FeatureOptions } from '../../types';
import type { ElementdemoSDK } from '../../ElementdemoSDK';
import { BaseFeature } from '../base/BaseFeature';
declare function renderElementCard(rec: any): string;
declare class ElementcardFeature extends BaseFeature {
    version: string;
    name: string;
    active: boolean;
    _client?: ElementdemoSDK;
    _options: any;
    init(ctx: Context, options: FeatureOptions): void | Promise<any>;
    render(rec: any): string;
    PreResult(this: any, ctx: any): void;
}
export { ElementcardFeature, renderElementCard, };
