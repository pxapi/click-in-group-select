import { fabric } from 'fabric';
export declare class ClickInGroupSelectPlugin {
    canvas: fabric.Canvas;
    private _cachedGroups;
    constructor(canvas: fabric.Canvas);
    init(canvas: fabric.Canvas): void;
    goIntoGroup(group: fabric.Group): void;
    goIntoObjectGroup(object: fabric.Object): void;
    groupBack(): void;
    goToRoot(): void;
    isOnRoot(): boolean;
    private goIntoRootGroup;
    private getCurrentGroup;
    private popCurrentGroup;
    private filterCachedObjects;
    private disableObjects;
    private restoreObjects;
    private ungroup;
    private checkGroupCanvas;
}
export interface CachedGroup {
    objects: Array<fabric.Object | null>;
}
export declare function replaceItemInArray(items: Array<unknown>, search: unknown, replaceWith: unknown): void;
