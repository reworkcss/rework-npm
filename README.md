# rework-npm

[![NPM](https://nodei.co/npm/rework-npm.png?compact=true)](https://nodei.co/npm/rework-npm/)

[![Build Status](https://drone.io/github.com/conradz/rework-npm/status.png)](https://drone.io/github.com/conradz/rework-npm/latest)
[![Dependency Status](https://gemnasium.com/conradz/rework-npm.png)](https://gemnasium.com/conradz/rework-npm)

Import CSS styles from NPM modules using
[rework](https://github.com/visionmedia/rework).

This lets you use `@import` CSS using the same rules you use for `require` in
Node. Specify the CSS file for a module using the `style` field in
`package.json` and use `@import "my-module";`, or specify the file name in the
module, like `@import "my-module/my-file";`. You can also require files relative
to the current file using `@import "./my-file";`.

An `@import` will be processed so that the file referenced will have been
imported in the current scope at the point of the `@import`. If a file has been
previously imported in the current scope, that file will not be imported again.
New scopes are created in a block such as a `@media` block. Child blocks will
not duplicate imports that have been imported in the parent block, but may
duplicate imports that are imported in a sibling block (since they may not have
effect otherwise).

## Example

```js
var rework = require('rework'),
    reworkNPM = require('rework-npm');

var output = rework('@import "test"')
    .use(reworkNPM())
    .toString();

console.log(output);
```

## Reference

### `reworkNPM([dir])`

Creates a new plugin for rework that will import files from NPM. `dir` is the
directory of the source file. The current working directory will be used if no
directory is provided.
