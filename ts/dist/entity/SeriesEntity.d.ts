import { ElementdemoEntityBase } from '../ElementdemoEntityBase';
import type { ElementdemoSDK } from '../ElementdemoSDK';
import type { Control } from '../types';
import type { Series, SeriesLoadMatch, SeriesListMatch } from '../ElementdemoTypes';
declare class SeriesEntity extends ElementdemoEntityBase<Series> {
    constructor(client: ElementdemoSDK, entopts: any);
    make(this: SeriesEntity): SeriesEntity;
    load(this: any, reqmatch?: SeriesLoadMatch, ctrl?: Control): Promise<SeriesEntity>;
    list(this: any, reqmatch?: SeriesListMatch, ctrl?: Control): Promise<SeriesEntity[]>;
}
export { SeriesEntity };
