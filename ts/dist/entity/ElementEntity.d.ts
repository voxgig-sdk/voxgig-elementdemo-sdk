import { ElementdemoEntityBase } from '../ElementdemoEntityBase';
import type { ElementdemoSDK } from '../ElementdemoSDK';
import type { Control } from '../types';
import type { Element, ElementLoadMatch, ElementListMatch, ElementCreateData, ElementUpdateData, ElementRemoveMatch } from '../ElementdemoTypes';
declare class ElementEntity extends ElementdemoEntityBase<Element> {
    constructor(client: ElementdemoSDK, entopts: any);
    make(this: ElementEntity): ElementEntity;
    load(this: any, reqmatch?: ElementLoadMatch, ctrl?: Control): Promise<ElementEntity>;
    list(this: any, reqmatch?: ElementListMatch, ctrl?: Control): Promise<ElementEntity[]>;
    create(this: any, reqdata?: ElementCreateData, ctrl?: Control): Promise<ElementEntity>;
    update(this: any, reqdata?: ElementUpdateData, ctrl?: Control): Promise<ElementEntity>;
    remove(this: any, reqmatch?: ElementRemoveMatch, ctrl?: Control): Promise<ElementEntity>;
}
export { ElementEntity };
