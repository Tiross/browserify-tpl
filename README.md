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

`browserify -t browserify-handlebars entry-point.js`

Or using *gulp* like this:

```javascript

```

That's all!

## Implementation details

This transform module packages the handlebars templates with the handlebars runtime, which is smaller than the complete handlebars library. This is good, because it means smaller bundle files for you.

## Credits

This transform is a fork on David Manning [browserify-handlebars](https://github.com/dlmanning/browserify-handlebars) ! 
Thanks!
