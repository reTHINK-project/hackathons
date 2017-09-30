/**
* @author Bernardo Graça [bernardo.marquesg@gmail.com]
* @version 0.1.0
*/

const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let codeGeneratorReporter

$(document).ready(function () {

  rethink.default.install({
    domain: 'hybroker.rethink.ptinovacao.pt',
    development: true,
    runtimeURL: 'hyperty-catalogue://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/runtime/Runtime'
  }).then((runtime) => {
    loadHyperty(runtime)
  });
})


function loadHyperty(runtime) {
  runtime.requireHyperty(hypertyURI('hybroker.rethink.ptinovacao.pt', 'CodeGeneratorReporter'))
  .then((CodeGeneratorReporter) => {
    codeGeneratorReporter = CodeGeneratorReporter.instance
    $('#create').show()
    $('#buttonCreate').on('click', create)
  });
}

function create() {
  let emails = []
  emails.push($('#createInput').val())

  codeGeneratorReporter.create(emails).then((result) => {
    $('#createInput').val('')
    $('#create').hide()
    $('#code').show()
    $('#buttonGenerate').on('click', generateCodeService)
  });
}

function generateCodeService() {
  $('#alert').hide()
  $('#alert').text('')
  $('#alert').children().remove()
  let teamName = $('#inlineFormInput').val()
  codeGeneratorReporter.generateCode(teamName).then((code) => {
    $('#alert').show()
    $('#inlineFormInput').val('')
    $('#alert').append('<strong>Well done!</strong> Code: ' + code)
  });
}
