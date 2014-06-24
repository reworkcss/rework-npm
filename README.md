# rework-npm

[![Build Status](https://travis-ci.org/conradz/rework-npm.svg?branch=master)](https://travis-ci.org/conradz/rework-npm)

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

Note that to get correct import paths you must set the `source` option to the
source file name when parsing the CSS source (usually with rework). If the
`source` path is relative, it is resolved to the `root` option (defaults to the
current directory). The `source` path is used to find the directory to start in
when finding dependencies.

## Example

```js
var rework = require('rework'),
    reworkNPM = require('rework-npm');

var output = rework('@import "test";', { source: 'my-file.css' })
    .use(reworkNPM())
    .toString();

console.log(output);
```

## Reference

### `reworkNPM([opts])`

Creates a new plugin for rework that will import files from NPM.

Valid options:

 * `root`: The root directory for the source files. This is used for source maps
   to make imported file names relative to this directory, and for finding the
   absolute path for the top level source file. Example: `root: 'src/client'`
 * `shim`: If you need to import packages that do not specify a `style`
   property in their `package.json` or provide their styles in `index.css`,
   you can provide a shim config option to access them. This is specified as a
   hash whose keys are the names of packages to shim and whose values are the
   path, relative to that package's `package.json` file, where styles can be
   found. Example: `shim: { 'leaflet': 'dist/leaflet.css' }`
 * `alias`: You can provide aliases for arbitrary file paths using the same
   format as the `shim` option. These files must be complete file paths,
   relative to the `root` directory. Example:
   `alias: { 'tree': './deep/tree/index.css' }`
 * `prefilter`: A function that will be called before an imported file is
   parsed. This function will be called with the file contents and the full file
   path. This option can be used to convert other languages such as SCSS to CSS
   before importing. Example: `prefilter: function(src, file) { return src; }`
