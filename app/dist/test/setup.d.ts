import type { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import type { Element, Isotope, Group, Series } from '../src/types.js';
export declare function createTestElement(overrides?: Partial<Element>): Element;
export declare function createTestIsotope(overrides?: Partial<Isotope>): Isotope;
export declare function createTestGroup(overrides?: Partial<Group>): Group;
export declare function createTestSeries(overrides?: Partial<Series>): Series;
export declare const TEST_ACCOUNT_ID = "acc01";
export declare const TEST_REFRESH_TOKEN = "rt-elementdemo-dev-refresh-token";
type InjectArgs = InjectOptions & {
    url: string;
};
type InjectResult = LightMyRequestResponse;
export declare function apiClient(app: FastifyInstance, accountId?: string, refreshToken?: string): {
    inject(opts: InjectArgs): Promise<InjectResult>;
    refreshes: () => number;
};
export {};
