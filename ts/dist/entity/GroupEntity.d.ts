import { ElementdemoEntityBase } from '../ElementdemoEntityBase';
import type { ElementdemoSDK } from '../ElementdemoSDK';
import type { Control } from '../types';
import type { Group, GroupLoadMatch, GroupListMatch } from '../ElementdemoTypes';
declare class GroupEntity extends ElementdemoEntityBase<Group> {
    constructor(client: ElementdemoSDK, entopts: any);
    make(this: GroupEntity): GroupEntity;
    load(this: any, reqmatch?: GroupLoadMatch, ctrl?: Control): Promise<GroupEntity>;
    list(this: any, reqmatch?: GroupListMatch, ctrl?: Control): Promise<GroupEntity[]>;
}
export { GroupEntity };
