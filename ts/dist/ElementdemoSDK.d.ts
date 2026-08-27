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
declare const stdutil: Utility;
declare class ElementdemoSDK {
    _mode: string;
    _options: any;
    _utility: Utility;
    _features: Feature[];
    _rootctx: Context;
    constructor(options?: any);
    options(): any;
    utility(): any;
    prepare(fetchargs?: any): Promise<any>;
    direct(fetchargs?: any): Promise<Error | {
        ok: boolean;
        status: number;
        headers: any;
        data: any;
        err?: undefined;
    } | {
        ok: boolean;
        err: any;
        status?: undefined;
        headers?: undefined;
        data?: undefined;
    }>;
    _rawRequest(fetchargs?: any): Promise<Error | {
        ok: boolean;
        status: number;
        headers: any;
        data: any;
        err?: undefined;
    } | {
        ok: boolean;
        err: any;
        status?: undefined;
        headers?: undefined;
        data?: undefined;
    }>;
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
export { stdutil, config, BaseFeature, ElementdemoEntityBase, ElementdemoSDK, SDK, };
