
Hyperty Repository
-------------------------

This repository hosts source code of Hyperties. For more information about Hyperties and reTHINK framework pls read [this](https://github.com/reTHINK-project/dev-hyperty-toolkit/blob/master/README.md).

### The Repository structure

#### **src** folder

Hold all Hyperty related source code, like hyperty classes and JSON-Schemas. The hyperty class must have the suffix ".hy.js", on the file.

**Example:** Hello.hy.js

**Why?**
Because all the files in folder, could be a possible hyperty, with this suffix, we can distinguish the main hyperty from others files that complement it;

To expose your hyperty in the Testing Web App you need to go to *function* ***hypertyDeployed*** on **main.js** and add your **hyperty name** and **javascript file** file to the switch cases presented there.

**example:**

```javascript

function hypertyDeployed(hyperty) {

  ...
  switch (hyperty.name) {

    // You can add your own hyperty with this code
    case '<hyperty name>':
      template = '<hyperty-name>/<HypertyName>';
      script =  '<hyperty-name>/<app.js>';
      break;
  }
}
```
**NOTE:** This probably needs to be optimized, suggestion are welcome;

#### **examples** folder

In this folder you have, for each hyperty you develop, the Web side testing.
This is customized with HTML using [Handlebars](http://handlebarsjs.com/) and ES5 javascript;

With this template system you can:

 - avoid the initial html setup, like **&lt;html&gt;, &lt;head&gt;, &lt;body&gt;**, and add only the html tags you need, like **&lt;div&gt;, &lt;p&gt;, &lt;b&gt;** and others.
 - use some extra features like, **variables, {{each}}, {{if}}**, look at [documentation](http://handlebarsjs.com/expressions.html)
 -

**Examples:**
 - hello-world > helloWorld.hbs
 - hyperty-chat > HypertyChat.hbs
 - hyperty-connector > HypertyConnector.hbs

#### **Test** folder

 You can make your own tests to an hyperty, only need create an file with your hyperty name, and suffix the ".spec.js"

 **Example:** Hello.spec.js
