/*
  Double Click in a group selects clicked element in group
  Source https://github.com/fabricjs/fabric.js/issues/6776#issuecomment-783326800
  Author: @harm-less
*/
import { fabric } from 'fabric';

export class ClickInGroupSelectPlugin {
  canvas: fabric.Canvas;
	private _cachedGroups: Array<CachedGroup> = [];

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.init(canvas);
  }
  init(canvas: fabric.Canvas) {
    const groupNavigator = this;
    // @ts-ignore
    canvas.on('mouse:dblclick', (event) => {
      const target = event.target;
      if (target && target.isType('group')) {
        groupNavigator.goIntoGroup(target as fabric.Group);
      } else {
        groupNavigator.groupBack();
      }
  });
  }

	goIntoGroup(group: fabric.Group) {
		this.checkGroupCanvas(group);

		const groupSequence: Array<fabric.Group> = [group];
		let parentGroup: fabric.Group | undefined = group.group;
		while (parentGroup) {
			groupSequence.unshift(parentGroup);
			parentGroup = parentGroup.group;
		}
		groupSequence.forEach((group) => {
			this.goIntoRootGroup(group);
		});
		this.canvas.requestRenderAll();
	}

	goIntoObjectGroup(object: fabric.Object) {
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
		const activeSelection = new fabric.ActiveSelection(
			this.filterCachedObjects(highestGroup.objects),
			{canvas}
		);
		canvas.setActiveObject(activeSelection);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const newGroup = (canvas.getActiveObject() as any).toGroup();

		const previousGroupUnfiltered = this.getCurrentGroup();
		if (previousGroupUnfiltered) {
			replaceItemInArray(previousGroupUnfiltered.objects, null, newGroup);
		}

		const previousGroup = this.getCurrentGroup();
		this.restoreObjects(
			previousGroup ? this.filterCachedObjects(previousGroup.objects) : canvas.getObjects()
		);
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

	private goIntoRootGroup(group: fabric.Group) {
		if (group.group) {
			throw new Error('Must be a root group');
		}
		const currentGroup = this.getCurrentGroup();
		if (currentGroup) {
			replaceItemInArray(currentGroup.objects, group, null);
		}

		this._cachedGroups.push({objects: group.getObjects()});

		const canvas = this.canvas;
		const parentObjects = currentGroup
			? this.filterCachedObjects(currentGroup.objects)
			: canvas.getObjects();
    // @ts-ignore
		this.disableObjects(parentObjects.filter((object) => object !== group));

		this.ungroup(group);
	}

	private getCurrentGroup() {
		const groupLength = this._cachedGroups.length;
		return groupLength ? this._cachedGroups[groupLength - 1] : null;
	}
	private popCurrentGroup() {
		return this._cachedGroups.pop();
	}

	private filterCachedObjects(objects: Array<fabric.Object | null>): Array<fabric.Object> {
		return objects.filter(<TValue>(value: TValue | null | undefined): value is TValue => {
			return value !== null && value !== undefined;
		});
	}

	private disableObjects(objects: Array<fabric.Object>) {
		objects.forEach((object) => {
			object.opacity = 0.3;
			object.selectable = false;
			object.hasControls = false;
		});
	}

	private restoreObjects(objects: Array<fabric.Object>) {
		objects.forEach((object) => {
			object.opacity = 1;
			object.selectable = true;
			object.hasControls = true;
		});
	}

	private ungroup(group: fabric.Group) {
		const canvas = this.canvas;
		const items = group.getObjects();
		group._restoreObjectsState();
		canvas.remove(group);
		for (const object of items) {
			canvas.add(object);
		}

		canvas.discardActiveObject();
	}

	private checkGroupCanvas(group: fabric.Group) {
		if (!group.canvas) {
			throw new Error('Group not placed on any canvas');
		}
		if (group.canvas !== this.canvas) {
			throw new Error('Group not placed on the target canvas');
		}
	}

}

export interface CachedGroup {
	objects: Array<fabric.Object | null>;
}

export function replaceItemInArray(items: Array<unknown>, search: unknown, replaceWith: unknown) {
	const foundIndex = items.findIndex((item) => item === search);
	items[foundIndex] = replaceWith;
}
