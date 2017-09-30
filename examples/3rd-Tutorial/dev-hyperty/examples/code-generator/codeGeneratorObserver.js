
let codeGeneratorHyperty;

function hypertyLoaded(result) {
  codeGeneratorHyperty = result.instance;
  console.log(codeGeneratorHyperty);

  codeGeneratorHyperty.addEventListener('code', function(data) {
    let namesPanel = $('.team-names-panel');

    console.log("[CodeGeneratorObserver.template.data]: ", data);
    if(data.name && data.code && data.name !== '' && data.code !== '') {
      let name = '<p> Team name: ' + data.name + ' with code: ' + data.code + '</p>';
      namesPanel.append(name);
    }
  });
}


Handlebars.getTemplate = function(name) {

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: 'templates/' + name + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },
      fail: function(reason) {
        reject(reason);
      }
    });
  });
}
