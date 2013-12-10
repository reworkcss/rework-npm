var test = require('tap').test,
    fs = require('fs'),
    rework = require('rework'),
    reworkNPM = require('./');

test('Process example file', function(t) {
    var source = fs.readFileSync('example/main.css', 'utf8'),
        expected = fs.readFileSync('example/output.css', 'utf8'),
        output = rework(source).use(reworkNPM('example'));

    t.equal(output.toString(), expected);
    t.end();
});
