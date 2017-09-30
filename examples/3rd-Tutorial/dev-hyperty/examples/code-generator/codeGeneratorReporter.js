
let codeGeneratorHyperty;

function hypertyLoaded(result) {
  codeGeneratorHyperty = result.instance;
  console.log(codeGeneratorHyperty);
  $('.requet-code').on('submit', generateCode);
  $('.create').on('submit', create);

}

function create (event) {
  event.preventDefault();
  let emails = []
  let form = $('.create');
  emails.push(form.find('#email').val())

  codeGeneratorHyperty.create(emails).then((CodeGeneratorReporter) => {
    form.find('#email').val('')
    $('.create-panel').hide()
    $('.request-code-panel').show()
  });
}

function generateCode(event) {
  event.preventDefault();
  let form = $(event.currentTarget);
  let name = form.find('#name').val();
  $('.code-panel').children().remove();

  codeGeneratorHyperty.generateCode(name).then(function(code) {
    showCode(code);
    form.find('#name').val('');
  }).catch(function(reason) {
    console.error(reason);
  });
}

function showCode(code) {
  let code_tag =  '<p> Code: </p>' +
                  '<p style="font-weight: bold;">' + code + '</p>';
  let code_panel = $('.code-panel');
  code_panel.append(code_tag);
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
