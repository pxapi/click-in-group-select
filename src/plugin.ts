/*
  Simple class which will integrate fabric plugins
*/
import { fabric } from 'fabric';

export class FabricPlugin {
  canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.init(canvas);
  }
  init(canvas: fabric.Canvas) {
    // Do your magic here
  }
}
