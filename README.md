# Example Plugin

This is a example plugin for integrating into the pxapi market place.

⚠️ Currently in Development.

## Quick Start

Use this repo as Template.

Install depencies:
```
npm install
```

Write your code in /src
```
import { fabric } from 'fabric';

export class MyHelloWorldPlugin {
  canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.init(canvas);
  }
  init(canvas: fabric.Canvas) {
    // Do your magic here
    // access all features of the current fabric canvas with canvas
  }
}

```

## Build Plugin
```
npm run-script build
```

## Test Plugin
Todo

## Publish Plugin
Todo
