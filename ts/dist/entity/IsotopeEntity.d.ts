import { ElementdemoEntityBase } from '../ElementdemoEntityBase';
import type { ElementdemoSDK } from '../ElementdemoSDK';
import type { Control } from '../types';
import type { Isotope, IsotopeLoadMatch, IsotopeListMatch, IsotopeCreateData, IsotopeUpdateData, IsotopeRemoveMatch } from '../ElementdemoTypes';
declare class IsotopeEntity extends ElementdemoEntityBase<Isotope> {
    constructor(client: ElementdemoSDK, entopts: any);
    make(this: IsotopeEntity): IsotopeEntity;
    load(this: any, reqmatch?: IsotopeLoadMatch, ctrl?: Control): Promise<IsotopeEntity>;
    list(this: any, reqmatch?: IsotopeListMatch, ctrl?: Control): Promise<IsotopeEntity[]>;
    create(this: any, reqdata?: IsotopeCreateData, ctrl?: Control): Promise<IsotopeEntity>;
    update(this: any, reqdata?: IsotopeUpdateData, ctrl?: Control): Promise<IsotopeEntity>;
    remove(this: any, reqmatch?: IsotopeRemoveMatch, ctrl?: Control): Promise<IsotopeEntity>;
}
export { IsotopeEntity };
