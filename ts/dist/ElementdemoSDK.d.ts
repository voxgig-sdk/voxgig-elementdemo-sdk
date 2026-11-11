import { ElementEntity } from './entity/ElementEntity';
import { GroupEntity } from './entity/GroupEntity';
import { IsotopeEntity } from './entity/IsotopeEntity';
import { SeriesEntity } from './entity/SeriesEntity';
export type * from './ElementdemoTypes';
import { inspect } from 'node:util';
import type { Context, Feature } from './types';
import { config } from './Config';
import { ElementdemoEntityBase } from './ElementdemoEntityBase';
import { Utility } from './utility/Utility';
import { BaseFeature } from './feature/base/BaseFeature';
import * as sekreto from './feature/secrets/sekreto';
declare const stdutil: Utility;
type DirectResult = {
    ok: false;
    err: any;
    status?: undefined;
    headers?: undefined;
    data?: undefined;
} | {
    ok: boolean;
    status: number;
    headers: any;
    data: any;
    err?: any;
};
declare class ElementdemoSDK {
    _mode: string;
    _options: any;
    _utility: Utility;
    _features: Feature[];
    _rootctx: Context;
    _secrets?: any;
    constructor(options?: any);
    options(): any;
    utility(): any;
    secrets(): any;
    prepare(fetchargs?: any): Promise<any>;
    direct(fetchargs?: any): Promise<DirectResult>;
    _rawRequest(fetchargs?: any): Promise<DirectResult>;
    graphql(query: string, variables?: any, ctrl?: any): Promise<any>;
    Element(entopts?: Record<string, any>): ElementEntity;
    Group(entopts?: Record<string, any>): GroupEntity;
    Isotope(entopts?: Record<string, any>): IsotopeEntity;
    Series(entopts?: Record<string, any>): SeriesEntity;
    static test(testoptsarg?: any, sdkoptsarg?: any): ElementdemoSDK;
    tester(testopts?: any, sdkopts?: any): ElementdemoSDK;
    toJSON(): {
        name: string;
    };
    toString(): string;
    [inspect.custom](): string;
}
declare const SDK: typeof ElementdemoSDK;
export { stdutil, config, sekreto, BaseFeature, ElementdemoEntityBase, ElementdemoSDK, SDK, };
export type { DirectResult };
