var resolve = require('resolve'),
    path = require('path'),
    css = require('css'),
    fs = require('fs');

module.exports = reworkNPM;

function reworkNPM(dir) {
    return function(style) {
        style.rules = resolveImports([], dir, style);
        return style;
    };
}

function isNpmImport(path) {
    // Do not import absolute URLs */
    return !/:\/\//.test(path);
}

function resolveImports(included, dir, style) {
    dir = dir || process.cwd();
    dir = path.resolve(dir);

    var processed = [];
    style.rules.forEach(function(rule) {
        if (rule.type !== 'import') {
            processed.push(rule);
        } else {
            var imported = getImport(included, dir, rule);
            processed = processed.concat(imported);
        }
    });

    return processed;
}

function resolveImport(dir, rule) {
    var name = rule.import.replace(/^\"|\"$/g, '');
    if (!isNpmImport(name)) {
        return null;
    }

    var options = {
        basedir: dir,
        extensions: ['.css'],
        packageFilter: processPackage
    };

    var file = resolve.sync(name, options);
    return path.normalize(file);
}

function getImport(included, dir, rule) {
    var file = resolveImport(dir, rule);
    if (!file) {
        return [rule];
    }

    // Only include a file once
    if (included.indexOf(file) !== -1) {
        return [];
    }

    included.push(file);

    var importDir = path.dirname(file),
        contents = fs.readFileSync(file, 'utf8'),
        styles = css.parse(contents).stylesheet;

    // Resolve imports in the imported file
    return resolveImports(included, importDir, styles);
}

function processPackage(package) {
    package.main = package.style || 'index.css';
    return package;
}