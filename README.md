# rework-npm

[![NPM](https://nodei.co/npm/rework-npm.png?compact=true)](https://nodei.co/npm/rework-npm/)

[![Build Status](https://drone.io/github.com/conradz/rework-npm/status.png)](https://drone.io/github.com/conradz/rework-npm/latest)
[![Dependency Status](https://david-dm.org/conradz/rework-npm.png)](https://david-dm.org/conradz/rework-npm)

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

You can use source maps to show which file a definition originated from when
debugging in a browser. To include inline source maps, use
`.toString({ sourcemap: true })` on the rework object when generating the
output.

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

### `reworkNPM([opts])`

Creates a new plugin for rework that will import files from NPM.

If `opts` is a string, it is used as the `dir` option.

Valid options:

 * `dir`: The directory where the source file is located. If not specified, it
   uses the current directory.
 * `root`: The directory where all source files are located. This is used for
   source maps. All imported files will have file paths relative to this
   directory in the source maps. By default this uses the `dir` option.
 * `shim`: If you need to import packages that do not specify a `style`
   property in their `package.json` or provide their styles in `index.css`,
   you can provide a shim config option to access them. This is specified as a
   hash whose keys are the names of packages to shim and whose values are the
   path, relative to that package's `package.json` file, where styles can be
   found. Example: `shim: {'leaflet': 'dist/leaflet.css'}`
 * `alias`: You can provide aliases for arbitrary file paths using the same
   format as the `shim` option. `alias: {'tree': './deep/tree/index.css'}`
 * `prefilter`: If you need to prefilter input files, e.g. convert
   whitespace-sensitive CSS to normal CSS, you can give a prefilter function.
   Example: `prefilter: require('css-whitespace')`
