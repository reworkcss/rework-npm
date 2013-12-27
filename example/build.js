var rework = require('rework'),
    npm = require('../'),
    fs = require('fs'),
    path = require('path');

var file = path.join(__dirname, 'main.css'),
    outFile = path.join(__dirname, 'compiled.css'),
    source = fs.readFileSync(file, 'utf8'),
    opts = { source: path.relative(__dirname, file) },
    output = rework(source, opts)
        .use(npm(__dirname))
        .toString({ sourcemap: true });

fs.writeFileSync(outFile, output, 'utf8');
