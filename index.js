var resolve = require('resolve'),
    path = require('path'),
    parse = require('css-parse'),
    fs = require('fs');

var ABS_URL = /^url\(|:\/\//,
    QUOTED = /^['"]|['"]$/g;

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

function resolveImport(opts, rule) {
    var name = rule.import.replace(QUOTED, ''),
        shimPath = opts.shim ? opts.shim[name] : null,
        alias = opts.alias ? opts.alias[name] : null;
    if (!isNpmImport(name)) {
        return null;
    }

    if (alias) {
        return path.join(opts.dir, alias);
    }

    var options = {
        basedir: opts.dir,
        extensions: ['.css'],
        packageFilter: processPackage(shimPath)
    };

    var file = resolve.sync(name, options);
    return path.normalize(file);
}

function getImport(scope, opts, rule) {
    var file = resolveImport(opts, rule);
    if (!file) {
        return [rule];
    }

    // Only include a file once
    if (isImported(scope, file)) {
        return [];
    }

    scope[file] = true;

    var importOpts = {
            dir: path.dirname(file),
            root: opts.root,
            prefilter: opts.prefilter
        },
        contents = fs.readFileSync(file, 'utf8');
    if (opts.prefilter) {
        contents = opts.prefilter(contents, file);
    }

    var styles = parse(contents, {
            position: true,
            source: path.relative(opts.root, file)
        }).stylesheet;

    // Resolve imports in the imported file
    resolveImports(scope, importOpts, styles);
    return styles.rules;
}

function processPackage(shimPath) {
    return function (package) {
        package.main = shimPath || package.style || 'index.css';
        return package;
    }
}

function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isImported(scope, name) {
    return (hasOwn(scope, name)
        || (scope.__parent__ && isImported(scope.__parent__, name)));
}
