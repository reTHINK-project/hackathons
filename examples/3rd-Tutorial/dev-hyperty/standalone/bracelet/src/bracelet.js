// jshint browser:true, jquery: true
// jshint varstmt: true

// reTHINK modules
// import RuntimeUA from 'runtime-core/dist/runtimeUA';
//
// import SandboxFactory from '../resources/sandboxes/SandboxFactory';
// let sandboxFactory = new SandboxFactory();
var avatar = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';

// You can change this at your own domain
var  domain ="hybroker.rethink.ptinovacao.pt" ;

var config = {runtimeURL: "https://catalogue." +domain+ "/.well-known/runtime/Runtime", development: false} ;

//var config = {domain: domain, runtimeURL: "https://catalogue." +domain+ "/.well-known/runtime/Runtime", development: true} ;

// Hack because the GraphConnector jsrsasign module;
window.KJUR = {};

// Check if the document is ready
if (document.readyState === 'complete') {
  documentReady();
} else {
  window.addEventListener('onload', documentReady, false);
  document.addEventListener('DOMContentLoaded', documentReady, false);
}


function documentReady() {

  var hyperty = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/hyperty/BraceletSensorReporter';
  //var hyperty = 'hyperty-catalogue://' + domain + '/.well-known/hyperty/BraceletSensorReporter';
  console.log('onDocumentReady');
  window.rethink.default.install(config)
      .then(function (runtime) {
          console.log(runtime, hyperty);
          runtime.requireHyperty(hyperty).then(hypertyDeployed).catch(function(reason) {
            console.log(reason);
          });
      });
}

var bracelet;

function hypertyDeployed(result) {

  console.log(result);
  var button = $('.discover-btn');
  var conBtn = $('.connect-btn');
  var collection = $('.collection');
  var progressLoad = $('.loading-progress');
  var progressDiscover = $('.discovering-progress');
  var progressConnection = $('.status-progress');
  var statusLabel = $('.status-label');
  var statusText = $('.status_value');
  var lastLabel = $('.last-label');
  bracelet = result.instance;

  bracelet.onConnect(function(lastAddress) {
    console.log('last device used', lastAddress);
    if(lastAddress)
    {

      lastLabel.text('Last Connection was with address: '+ lastAddress);
      lastLabel.removeClass('hide');

      conBtn.removeClass('hide');
      conBtn.on("click", function() {
        statusText.text('Connecting to address: ' + lastAddress);
        bracelet.Connect(lastAddress).then(function(status) {
          console.log('connection status ->', status);
          if (status == 'connected') {
            progressConnection.addClass("hide");
            statusText.text('Connected to address: ' + lastAddress);
          } else if (status == 'reconnecting') {
            progressConnection.removeClass("hide");
            statusText.text('Disconnected.. Trying to Reconnect to ' + lastAddress);
          }
        });
      });

    }
  });

  bracelet.getLastDevice();


  button.on("click", function(event){ progressDiscover.removeClass("hide"); statusText.text('Discovering..'); lastLabel.addClass('hide'); conBtn.addClass('hide'); bracelet.Discover().then(function(result){
    console.log('result ', result);
    collection.empty();
    progressDiscover.addClass("hide");
    if (result.length > 0) statusText.text('Discover Result.. You can Connect Now');
    else statusText.text('Try again..');
    result.forEach(function(item){
      collection.append('<a href="#!" class="collection-item"  style="height:60px; margin-top:10px; margin-bottom:10px" data-id='+item.id+' >'+item.name+'<span class="right">'+item.id+'</span></a>');
    });
    collection.find('.collection-item').on("click", function(event){
      var address = $(event.target).attr('data-id');
      if (address) {
        statusText.text('Connecting to address: ' + address);
        progressConnection.removeClass("hide");
      }
      else {
        statusText.text('Click again for connect..');
      }

      bracelet.Connect(address).then(function(status) {
        console.log('connection status ->', status);
        if (status == 'connected') {
          progressConnection.addClass("hide");
          statusText.text('Connected to address: ' + address);
        } else if (status == 'reconnecting') {
          progressConnection.removeClass("hide");
          statusText.text('Disconnected.. Trying to Reconnect to ' + address);
        }
      });
    });
  })});

  bracelet.onDataChange(function(data) {
    var lblBattery = $('.bt-label');
    lblBattery.removeClass('hide');

    var lblSteps = $('.steps-label');
    lblSteps.removeClass('hide');

    var lblTime = $('.time-label');
    lblTime.removeClass('hide');


    var stepValue = $('.value_step');
    var timeValue = $('.value_time');
    var batteryValue = $('.value_battery');


    console.log('new event', data);
    var type = data.type;
    console.log('type', type);

    var date = new Date(data.time);

    if (type === 'battery') {
      batteryValue.text(data.value);
      timeValue.text(date);
      console.log(data.value);
    } else if (type === 'user_steps') {
        stepValue.text(data.value);
        timeValue.text(date);
        console.log(data.value);
    }
  });

  bracelet.onStatusChange(function(status) {
    if (status.connection == 'connected') {
      progressConnection.addClass("hide");
      statusText.text('Connected to ' + status.address);
    } else if (status.connection == 'reconnecting') {
      progressConnection.removeClass("hide");
      statusText.text('Disconnected from ' + status.address + '.. Trying to Reconnect');
    }
  });

  button.removeClass("hide");
  progressLoad.addClass("hide");
  statusText.removeClass("hide");
  statusLabel.removeClass("hide");
}
