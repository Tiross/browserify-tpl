var through = require('through');
var parser = require("node-html-parser");

var defaultPatterns = ['.tpl', '.mustache', '.hb', '.html'];

var defaultEngine = 'handlebars';

var isObject = function (a) {
    return (!!a) && (a.constructor === Object);
};

var defaultEngines = {
    handlebars: function (input, opts) {
        var handlebars = require('handlebars');
        var compilerOptions = opts.compilerOptions ?
            opts.compilerOptions : {};
        var out = ['var hb = require("handlebars/runtime");'];
        if (isObject(input)) {
            out.push('module.exports = {}');
            Object.keys(input).forEach(function(key) {
                var compiled = handlebars.precompile(input[key], compilerOptions);
                out.push('module.exports["'+key+'"] = hb.template('+compiled +');')
            });
        } else {
            var compiled = handlebars.precompile(input, compilerOptions);
            "module.exports = hb.template(" + compiled + ");";
        }
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

        var out = ['var hogan = require("hogan.js");'];
        if (isObject(input)) {
            out.push('module.exports = {}');
            out.push("var n = {};");
            Object.keys(input).forEach(function (key) {
                var compiled = hogan.compile(input[key], hogOpts);
                out.push('module.exports["' + key + '"] = function(data, partials) {');
                out.push('   var n = new hogan.Template(' + compiled + ');');
                out.push('   return n.render(data, partials);');
                out.push('};')
            });
        } else {
            var compiled = hogan.compile(input, hogOpts);
            out.push("var n = new hogan.Template(" + compiled + ");");
            out.push("module.exports = function(data, partials) {");
            out.push('  return n.render(data, partials);');
            out.push('};');
        }
        return out.join("\n");
    },
    mustache: function(input, opts) {
        var out = ['var mustache = require("mustache");'];
        if (isObject(input)) {
            out.push('module.exports = {}');
            Object.keys(input).forEach(function (key) {
                var compiled = JSON.stringify(input[key]);
                out.push('module.exports["'+key+'"] = function(data) {');
                out.push('    var tpl = ' + compiled + ';');
                out.push('    return mustache.render(tpl, data);');
                out.push('};');

            });
        } else {
            var compiled = JSON.stringify(input);
            out.push('module.exports = function(data) {');
            out.push('    var tpl = ' + compiled + ';');
            out.push('    mustache.parse(tpl);');
            out.push('    return mustache.render(tpl, data);');
            out.push('};');
        }
        return out.join("\n");
    }
};

function patternMatcher(search, patterns) {
    return patterns.find(function (el) {
        return search.endsWith(el);
    }) !== undefined;
}

function parseTemplate(content, opts) {
    var type = opts.type || "text/x-handlebars-template";
    var root = parser.parse(content, { script: true });
    var scripts = root.querySelectorAll("script");
    var templates = scripts.filter(function (element) {
        return element.attributes["type"].toLowerCase() === type.toLowerCase();
    });
    var partials = {};
    if (templates.length == 0) {
        partials = content;
    } else {
        templates.forEach(function (tpl) {
            partials[tpl.id] = tpl.innerHTML;
            tpl.set_content("");
        });
        partials.root = root.toString();
    }
    return partials;
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
        var partials = opts.partials || true;

        //handles parsing
        var templates = data;
        if (partials === true) {
            templates = parseTemplate(data, opts);
        }

        //handle engines
        if (typeof engine === "string") {
            var engine = Object.keys(defaultEngines).find(function(key) {
                return strEngine.toLowerCase() === key;
            });
            if (engine) {
                return defaultEngines[engine](templates, opts);
            }
        } else if (typeof engine === 'function') {
            //user is providing a custom function to compile and parse data
            return engine(templates, opts.compilerOptions ? opts.compilerOptions : {});
        }
    }
    return through(write, end);
}