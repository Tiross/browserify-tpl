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

That's all!

## Implementation details

This transform module packages the handlebars templates with the handlebars runtime, which is smaller than the complete handlebars library. This is good, because it means smaller bundle files for you.

## Next (SOOON!)

We will support multiples templates inside a require. Something like:

```html
<!DOCTYPE html>
  <html lang="en">
  <head></head>
  <body>
  <script id="helloWorld" type="text/html">
    Hello World {{name}}
  </script>
  <script id="goodMorning" type="text/html">
    Good Morning {{name}}
  </script>
  <script id="goodAfternoon" type="text/html">
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
//and so on..
```

## Credits

This transform is a fork on David Manning [browserify-handlebars](https://github.com/dlmanning/browserify-handlebars) !
Thanks!
