// jshint browser:true, jquery: true
// jshint varstmt: true
/* global Handlebars */

export function serialize() {

  $.fn.serializeObject = function() {
    let o = {};
    let a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }

        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });

    return o;
  };

  $.fn.serializeObjectArray = function() {
    let o = {};
    let a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }

        o[this.name].push(this.value || '');
      } else {
        if (!o[this.name]) o[this.name] = [];
        o[this.name].push(this.value || '');
      }
    });

    return o;
  };

}

export function getTemplate(path, script) {

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    let templateFile = $.ajax({
      url: path + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
      },

      fail: function(reason) {
        return reason;
      }
    });

    let scriptFile = $.getScript(script);

    let requests = [];
    if (path) requests.push(templateFile);
    if (script) requests.push(scriptFile);

    Promise.all(requests).then(function(result) {
      resolve(Handlebars.templates[name]);
    }).catch(function(reason) {
      reject(reason);
    });

  });
}
