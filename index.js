var resolve = require('resolve'),
    path = require('path'),
    parse = require('css-parse'),
    fs = require('fs');

var ABS_URL = /^url\(|:\/\//,
    QUOTED = /^\"|\"$/g;

module.exports = reworkNPM;

function reworkNPM(opts) {
    opts = opts || {};
    if (typeof opts === 'string') {
        opts = { dir: opts };
    }

    opts.dir = path.resolve(opts.dir || process.cwd());
    opts.root = opts.root || opts.dir;

    return function(style) {
        resolveImports({}, opts, style);
        return style;
    };
}

function isNpmImport(path) {
    // Do not import absolute URLs */
    return !ABS_URL.test(path);
}

function resolveImports(scope, opts, style) {
    var output = [];
    style.rules.forEach(function(rule) {
        if (rule.type === 'import') {
            var imported = getImport(scope, opts, rule);
            output = output.concat(imported);
        } else {
            output.push(rule);
        }

        if (rule.rules) {
            // Create child scope for blocks (such as @media)
            var childScope = { __parent__: scope };
            resolveImports(childScope, opts, rule);
        }
    });

    style.rules = output;
}

function resolveImport(dir, rule) {
    var name = rule.import.replace(QUOTED, '');
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

function getImport(scope, opts, rule) {
    var file = resolveImport(opts.dir, rule);
    if (!file) {
        return [rule];
    }

    // Only include a file once
    if (isImported(scope, file)) {
        return [];
    }

    scope[file] = true;

    var importDir = path.dirname(file),
        importOpts = { dir: importDir, root: opts.root },
        contents = fs.readFileSync(file, 'utf8'),
        styles = parse(contents, {
                position: true,
                source: path.relative(opts.root, file)
            }).stylesheet;

    // Resolve imports in the imported file
    resolveImports(scope, importOpts, styles);
    return styles.rules;
}

function processPackage(package) {
    package.main = package.style || 'index.css';
    return package;
}

function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isImported(scope, name) {
    return (hasOwn(scope, name)
        || (scope.__parent__ && isImported(scope.__parent__, name)));
}
