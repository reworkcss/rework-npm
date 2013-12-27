var test = require('tap').test,
    fs = require('fs'),
    rework = require('rework'),
    reworkNPM = require('./'),
    normalize = require('path').normalize;

test('Import relative source file', function(t) {
    var source = '@import "./test";',
        output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, '.test {\n  content: "Test file";\n}');
    t.end();
});

test('Import package', function(t) {
    var source = '@import "test";',
        output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, '.test {\n  content: "Test package";\n}');
    t.end();
});

test('Import package with custom style file', function(t) {
    var source = '@import "custom";',
        output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, '.custom {\n  content: "Custom package";\n}');
    t.end();
});

test('Import files imported from imported package', function(t) {
    var source = '@import "nested";',
        output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, '.test {\n  content: "From nested test package";\n}');
    t.end();
});

test('Import package in @media', function(t) {
    var source = [
        '@media (min-width: 320px) {',
        '  @import "test";',
        '}',
        '@media (min-width: 640px) {',
        '  @import "test";',
        '}'
    ].join('\n')

    var output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, [
        '@media (min-width: 320px) {',
        '  .test {',
        '    content: "Test package";',
        '  }',
        '}',
        '',
        '@media (min-width: 640px) {',
        '  .test {',
        '    content: "Test package";',
        '  }',
        '}'
    ].join('\n'));

    t.end();
});

test('Ignore import from @media if imported in outer scope', function(t) {
    var source =
        '@import "test";\n' +
        '@media (min-width: 320px) { @import "test"; }';

    var output = rework(source).use(reworkNPM('test')).toString();
    t.equal(output, [
        '.test {',
        '  content: "Test package";',
        '}',
        '',
        '@media (min-width: 320px) {',
        '',
        '}'
    ].join('\n'));

    t.end();
});

test('Skip absolute URLs', function(t) {
    var source = '@import "http://example.com/example.css";',
        output = rework(source).use(reworkNPM()).toString();
    t.equal(output, source);
    t.end();
});

test('Skip imports using url()', function(t) {
    var source = '@import url(test.css);',
        output = rework(source).use(reworkNPM()).toString();
    t.equal(output, source);
    t.end();
});

test('Include source maps', function(t) {
    var source = '@import "test";',
        output = rework(source)
            .use(reworkNPM('test'))
            .toString({ sourcemap: true });

    t.equal(output,
        '.test {\n  content: "Test package";\n}\n' +
        '/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozL' +
        'CJmaWxlIjoiZ2VuZXJhdGVkLmNzcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3Rl' +
        'c3QvaW5kZXguY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksdUJ' +
        'BQXVCIn0= */');
    t.end();
});

test('Include source file names in output', function(t) {
    var source = '@import "test";',
        output = rework(source)
            .use(reworkNPM('test'));

    var rule = output.obj.stylesheet.rules[0];
    t.equal(
        normalize(rule.position.source),
        normalize('node_modules/test/index.css'));
    t.end();
});

test('Use file names relative to root', function(t) {
    var source = '@import "test";',
        output = rework(source)
            .use(reworkNPM({ root: __dirname, dir: 'test' }));

    var rule = output.obj.stylesheet.rules[0];
    t.equal(
        normalize(rule.position.source),
        normalize('test/node_modules/test/index.css'));
    t.end();
});
