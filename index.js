var through = require('through');

var defaultPatterns = ['.tpl', '.mustache', '.hb', '.html'];

var defaultEngine = 'handlebars';

var defaultEngines = {
    handlebars: function (input, opts) {
        var handlebars = require('handlebars');

        var compilerOptions = opts.compilerOptions ?
            opts.compilerOptions : {};

        var compiled = handlebars.precompile(input, compilerOptions);
        var out = [
            'var hb = require("handlebars/runtime");',
            'module.exports = hb.template(' + compiled + ');'
        ];
        //'var templater = require("handlebars/runtime")["default"].template;' +
        return out.join("\n");
    },
    hogan: function(input, opts) {
        var hogan = require('jogan.js');
        var defOpts = {
            asString: 1,
            enableHelpers: 1,
            fixMethodCalls: 1
        };
        var hogOpts = opts.compilerOptions ? opts.compilerOptions : defOpts;
        var compiled = hogan.compile(input, hogOpts)
        var out = [
            'var hogan = require("hogan.js");',
            'var n = new hogan.Template(' + compiled + ');',
            'module.exports = function(data, partials) {',
            '  return n.render(data, partials);',
            '};'
        ];
        return out.join("\n");
    },
    mustache: function(input, opts) {
        var compiled = JSON.stringify(input);
        var out = [
           'var mustache = require("mustache");',
           'module.exports = function(data) {',
           '    var tpl = '+compiled+';',
           '    mustache.parse(tpl);',
           '    return mustache.render(tpl, data);',
           '};'
        ];
        return out.join("\n");
    }
};

function patternMatcher(search, patterns) {
    return patterns.find(function (el) {
        return search.endsWith(el);
    }) !== undefined;
}

module.exports = function (file, opts) {
    //check if user passes patterns to filter
    var patterns = opts.patterns ? opts.patterns : defaultPatterns;
    if (typeof patterns === "string") {
        patterns = [patterns];
    }
    //if is not an array
    if (!Array.isArray(patterns)) {
        throw new Error('Option patterns must be a string or an array!');
    }
    // if path doesnt matches, just pass through
    if (!patternMatcher(file, patterns)) return through();

    //read data and passes to compiler
    var input = '';
    var write = function (buffer) {
        input += buffer;
    }

    var end = function () {
        this.queue(compileTemplate(input));
        this.queue(null);
    }

    var compileTemplate = function (data) {
        var engine = opts.engine ? opts.engine : defaultEngine;
        //handle engines
        if (typeof engine === "string") {
            var engine = Object.keys(defaultEngines).find(function(key) {
                return strEngine.toLowerCase() === key;
            });
            if (engine) {
                return defaultEngines[engine](data, opts);
            }
        } else if (typeof engine === 'function') {
            //user is providing a custom function to compile and parse data
            return engine(data, opts.compilerOptions ? opts.compilerOptions : {});
        }
    }
    return through(write, end);
}