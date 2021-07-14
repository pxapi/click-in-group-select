/*
  Double Click in a group selects clicked element in group
  Source https://github.com/fabricjs/fabric.js/issues/6776#issuecomment-783326800
  Author: @harm-less
*/
import { fabric } from 'fabric';
export class ClickInGroupSelectPlugin {
    constructor(canvas) {
        this._cachedGroups = [];
        this.canvas = canvas;
        this.init(canvas);
    }
    init(canvas) {
        const groupNavigator = this;
        // @ts-ignore
        canvas.on('mouse:dblclick', (event) => {
            const target = event.target;
            if (target && target.isType('group')) {
                groupNavigator.goIntoGroup(target);
            }
            else {
                groupNavigator.groupBack();
            }
        });
    }
    goIntoGroup(group) {
        this.checkGroupCanvas(group);
        const groupSequence = [group];
        let parentGroup = group.group;
        while (parentGroup) {
            groupSequence.unshift(parentGroup);
            parentGroup = parentGroup.group;
        }
        groupSequence.forEach((group) => {
            this.goIntoRootGroup(group);
        });
        this.canvas.requestRenderAll();
    }
    goIntoObjectGroup(object) {
        // todo: Potential performance improvement: It would be perfect if we could detect IF we have to go to the root or just go back to the commen parent and traverse back down
        this.goToRoot();
        if (object.group) {
            this.goIntoGroup(object.group);
        }
    }
    groupBack() {
        const highestGroup = this.popCurrentGroup();
        if (!highestGroup) {
            return;
        }
        const canvas = this.canvas;
        const activeSelection = new fabric.ActiveSelection(this.filterCachedObjects(highestGroup.objects), { canvas });
        canvas.setActiveObject(activeSelection);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newGroup = canvas.getActiveObject().toGroup();
        const previousGroupUnfiltered = this.getCurrentGroup();
        if (previousGroupUnfiltered) {
            replaceItemInArray(previousGroupUnfiltered.objects, null, newGroup);
        }
        const previousGroup = this.getCurrentGroup();
        this.restoreObjects(previousGroup ? this.filterCachedObjects(previousGroup.objects) : canvas.getObjects());
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
    goToRoot() {
        while (this._cachedGroups.length) {
            this.groupBack();
        }
    }
    isOnRoot() {
        return this._cachedGroups.length === 0;
    }
    goIntoRootGroup(group) {
        if (group.group) {
            throw new Error('Must be a root group');
        }
        const currentGroup = this.getCurrentGroup();
        if (currentGroup) {
            replaceItemInArray(currentGroup.objects, group, null);
        }
        this._cachedGroups.push({ objects: group.getObjects() });
        const canvas = this.canvas;
        const parentObjects = currentGroup
            ? this.filterCachedObjects(currentGroup.objects)
            : canvas.getObjects();
        // @ts-ignore
        this.disableObjects(parentObjects.filter((object) => object !== group));
        this.ungroup(group);
    }
    getCurrentGroup() {
        const groupLength = this._cachedGroups.length;
        return groupLength ? this._cachedGroups[groupLength - 1] : null;
    }
    popCurrentGroup() {
        return this._cachedGroups.pop();
    }
    filterCachedObjects(objects) {
        return objects.filter((value) => {
            return value !== null && value !== undefined;
        });
    }
    disableObjects(objects) {
        objects.forEach((object) => {
            object.opacity = 0.3;
            object.selectable = false;
            object.hasControls = false;
        });
    }
    restoreObjects(objects) {
        objects.forEach((object) => {
            object.opacity = 1;
            object.selectable = true;
            object.hasControls = true;
        });
    }
    ungroup(group) {
        const canvas = this.canvas;
        const items = group.getObjects();
        group._restoreObjectsState();
        canvas.remove(group);
        for (const object of items) {
            canvas.add(object);
        }
        canvas.discardActiveObject();
    }
    checkGroupCanvas(group) {
        if (!group.canvas) {
            throw new Error('Group not placed on any canvas');
        }
        if (group.canvas !== this.canvas) {
            throw new Error('Group not placed on the target canvas');
        }
    }
}
export function replaceItemInArray(items, search, replaceWith) {
    const foundIndex = items.findIndex((item) => item === search);
    items[foundIndex] = replaceWith;
}
