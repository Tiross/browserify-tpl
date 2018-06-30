# Browserify Templates Transform
## browserify-tpl

A browserify transform for handlebar templates! Yay!

### Installation:

`npm install browserify-tpl`

### Usage:

Make a *handlebars/hogan/mustache* template like so:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
</head>
<body>
<p>Hello there, {{name}}</p>
</body>
</html>
```

Now `require()` the *handlebars/hogan/mustache* template file in code like so:

```javascript
var myTemplate = require('./template.tpl');

var html = myTemplate({title: "An instantiated template!", name: "John"});
```

To work, run *browserify* with the transform option:

`browserify -t browserify-tpl entry-point.js`

Or using *gulp* like this:

```javascript
gulp.task("scripts", function () {
    return browserify("**/*.js")
          .transform('browserify-tpl', {
              'patterns': ['.tpl', '.mustache', '.hg'],
              'engine': 'handlebars'
          });
          .bundle()
          .pipe(source('bundle.js'))
          .pipe(dest('build/'));
});
```
### Options

+ **patterns**:
> Use this option to set the file extensions that will be check to transform work.
> Default are `['.tpl', '.mustache', '.hb', '.html']`

+ **partials**:
> True or False; If *true* the code will parse the html file and search for script tags with `type=""` defined in option type below. If *false*, this transform will ignore partials.

+ **type**:
> Mime type of scripts to transform search and filter and use as partials. Default is   `"text/x-handlebars-template"`

+ **engine**:
> Use this option to set the engine that will be used on transform:
> The engines avaliable are: `mustache | handlebars | hogan"`.
> Default value is: `handlebars`

If you want, you can pass an function in **engine** option and compile yourserf the code. Input can be an object if you are using multiple templates. you must handle yourself:

```javascript
.transform('browserify-tpl', {
  'patterns': ['.tpl', '.mustache', '.hg'],
  'engine': function(input, compilerOptions) {
    var myEngine = require('myEngine');
    var out = ['var myEngine = require("myEngine/runtime");'];
    if (!isObject(input)) {
      var compiled = myEngine.compileString(input, compilerOptions);
      out.push('module.exports = template(' + compiled + ');');
    } else {
      //multiple templates when key is id of template and value is template data:
      out.push('module.exports = {}');
      Object.keys(input).forEach(function (key) {
          var compiled = myEngine.compileString(input, compilerOptions);
          out.push('module.exports["'+key+'"] = myEngine.template('+compiled +');')
      });
    }
    return out.join("\n");
  }
});
```
+ **compilerOptions**:
> You can use this to pass to compiler a set of options. Each engine use some options  on compiler comand.
> *Handlebars*: [Compile Options](https://handlebarsjs.com/reference.html)
> *Hogan.js*: [Compile](https://github.com/twitter/hogan.js/#compilation-options)
> *Mustache*: none.

That's all!

## Implementation details

When using **Handlebars**, this transform module packages the handlebars templates with the handlebars runtime, which is smaller than the complete handlebars library. This is good, because it means smaller bundle files for you.

When using **hogan.js** this trasform compiles ahead of time the template and makes them avaliable for use.

When using **Mustache**, because there is no compilation for this library, just get the content of file and loads as string.

## Multiple Templates in file

This transform support multiple templates in single file. Example:

```html
<!DOCTYPE html>
  <html lang="en">
  <head></head>
  <body>
  <script id="helloWorld" type="text/x-handlebars-template">
    Hello World {{name}}
  </script>
  <script id="goodMorning" type="text/x-handlebars-template">
    Good Morning {{name}}
  </script>
  <script id="goodAfternoon" type="text/x-handlebars-template">
    Good Afternoon {{name}}
  </script>
  </body>
  </html>
```
And then use in code like this:

```javascript
var Tpl = require('./template.html');

var htmlHelloWorld = Tpl.helloWorld({name: "John"});
var htmlGoodMorning = Tpl.goodMorning({name: "John"});
var root = Tpl.root({name: "tess"}); //root template is all file except scripts
//and so on..
```

## Credits

This transform is a fork on David Manning [browserify-handlebars](https://github.com/dlmanning/browserify-handlebars) !

Thanks!
