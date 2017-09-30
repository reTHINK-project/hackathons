// jshint browser:true, jquery: true
// jshint varstmt: true

import {ready, errorMessage, getUserMedia} from './support';


// polyfills
import 'babel-polyfill';
import 'indexeddbshim';
import 'mutationobserver-shim';
import 'object.observe';
import 'array.observe';

// reTHINK modules
// import RuntimeUA from 'runtime-core/dist/runtimeUA';
//
// import SandboxFactory from '../resources/sandboxes/SandboxFactory';
// let sandboxFactory = new SandboxFactory();
let avatar = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';

// You can change this at your own domain
let domain ="rethink.quobis.com" ;


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

  ready();

  let hypertyHolder = $('.hyperties');
  hypertyHolder.removeClass('hide');

  let hyperty = 'hyperty-catalogue://' + domain + '/.well-known/hyperty/HypertyConnector';

  window.rethink.default.install({runtimeURL: "https://" +domain+ "/runtime/Runtime", development: true})
      .then((runtime) => {
          console.log(runtime, hyperty);
          runtime.requireHyperty(hyperty).then(hypertyDeployed).catch(function(reason) {
            errorMessage(reason);
          });
      });
}

let connector;

function hypertyDeployed(result) {

  let loginPanel = $('.login-panel');
  let cardAction = loginPanel.find('.card-action');
  let hypertyInfo = '<span class="white-text"><p><b>hypertyURL:</b> ' + result.instance._hypertyURL + '</br><b>status:</b> ' + result.status + '</p></span>';

  loginPanel.attr('data-url', result.instance._hypertyURL);
  cardAction.append(hypertyInfo);

  // Prepare to discover email:
  let hypertyDiscovery = result.instance.hypertyDiscovery;
  discoverEmail(hypertyDiscovery);

  // Prepare the chat
  let messageChat = $('.hyperty-chat');
  messageChat.removeClass('hide');

  console.log(result);

  connector = result.instance;

  connector.addEventListener('connector:connected', function(controller) {

    connector.addEventListener('have:notification', function(event) {
      notificationHandler(controller, event);
    });

  });
}

function discoverEmail(hypertyDiscovery) {

  let section = $('.discover');
  let searchForm = section.find('.form');
  let inputField = searchForm.find('.friend-email');

  section.removeClass('hide');

  searchForm.on('submit', function(event) {
    event.preventDefault();

    let collection = section.find('.collection');
    let collectionItem = '<li class="collection-item"><div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></li>';

    collection.removeClass('hide');
    collection.addClass('center-align');
    collection.html(collectionItem);

    let email = inputField.val();
    console.log(email);

    hypertyDiscovery.discoverHypertyPerUser(email).then(emailDiscovered).catch(emailDiscoveredError);

  });
}

function emailDiscovered(result) {
  console.log('Email Discovered: ', result);

  let section = $('.discover');
  let collection = section.find('.collection');
  let collectionItem = '<li class="collection-item avatar"><img src="' + avatar + '" alt="" class="circle"><span class="title">' + result.id + '</span><p>' + result.descriptor + '<br>' + result.hypertyURL + '</p><a href="#!" class="message-btn"><i class="material-icons left">message</i>Send Message</a><a href="#!" class="call-btn"><i class="material-icons">call</i>Call</a></li>';

  collection.empty();
  collection.removeClass('center-align');
  collection.append(collectionItem);

  let messageChatBtn = collection.find('.message-btn');
  messageChatBtn.on('click', function(event) {
    event.preventDefault();
    openChat(result, false);
  });

  let callBtn = collection.find('.call-btn');
  callBtn.on('click', function(event) {
    event.preventDefault();
    openChat(result, true);
  });

}

function emailDiscoveredError(result) {

  console.error('Email Discovered Error: ', result);

  let section = $('.discover');
  let collection = section.find('.collection');

  let collectionItem = '<li class="collection-item orange lighten-3"><i class="material-icons left circle">error_outline</i>' + result + '</li>';

  collection.empty();
  collection.removeClass('center-align');
  collection.removeClass('hide');
  collection.append(collectionItem);
}

function openChat(result, video) {

  let messagesChat = $('.messages');
  let messageForm = messagesChat.find('.form');
  let loginPanel = $('.login-panel');
  let fromUser = loginPanel.attr('data-url');
  let toUserEl = messagesChat.find('.runtime-hyperty-url');
  let toUser = result.hypertyURL;

  toUserEl.html(toUser);

  if (video) {

    let options = options || {video: true, audio: true};
    getUserMedia(options).then(function(mediaStream) {
      console.info('recived media stream: ', mediaStream);
      return connector.connect(toUser, mediaStream);
    })
    .then(function(controller) {

      showVideo(controller);

      controller.addEventListener('on:notification', notification);
      controller.addEventListener('on:subscribe', function(controller) {
        console.info('on:subscribe:event ', controller);
      });

      controller.addEventListener('connector:notification', notification);

      controller.addEventListener('stream:added', processVideo);

    }).catch(function(reason) {
      console.error(reason);
    });

  }

  messageForm.on('submit', function(e) {

    let messageText = messagesChat.find('.message-text').val();

    if (messageText) {
      sendMessage(fromUser, toUser, messageText);
    }

    messageForm[0].reset();

    e.preventDefault();
  });

  messagesChat.removeClass('hide');

}

function processVideo(event) {

  console.log('Process Video: ', event);

  let messageChat = $('.hyperty-chat');
  let video = messageChat.find('.video');
  video[0].src = URL.createObjectURL(event.stream);

}

function processMessage(msg, type) {

  // console.log(msg.body.value);
  console.log(type);
  if (typeof msg.body.value !== 'object' && msg.body.value !== undefined) {

    let messageCollection = $('.hyperty-chat .collection');
    let messageItem = '<li class="collection-item avatar"><img src="' + avatar + '" alt="" class="circle"><span class="title">' + msg.from + '</span><p>' + msg.body.value.replace(/\n/g, '<br>') + '</p></li>';

    messageCollection.append(messageItem);
  }

}

function sendMessage(from, to, message) {

  let msg = {
    to: to,
    from: from,
    type: 'message',
    body:{
      value: message
    }
  };

  processMessage(msg, 'out');
}

function notification(event) {
  console.log('Event: ', event);
}

function notificationHandler(controller, event) {

  let calleeInfo = event.identity;
  let incoming = $('.modal-call');
  let acceptBtn = incoming.find('.btn-accept');
  let rejectBtn = incoming.find('.btn-reject');
  let informationHolder = incoming.find('.information');

  showVideo(controller);

  controller.addEventListener('stream:added', processVideo);

  acceptBtn.on('click', function(e) {

    e.preventDefault();

    let options = options || {video: true, audio: true};
    getUserMedia(options).then(function(mediaStream) {
      console.info('recived media stream: ', mediaStream);
      return controller.accept(mediaStream);
    })
    .then(function(result) {
      console.log(result);
    }).catch(function(reason) {
      console.error(reason);
    });

  });

  rejectBtn.on('click', function(e) {

    controller.decline().then(function(result) {
      console.log(result);
    }).catch(function(reason) {
      console.error(reason);
    });

    e.preventDefault();
  });

  let parseInformation = '<div class="col s12">' +
        '<div class="row valign-wrapper">' +
          '<div class="col s2">' +
            '<img src="' + calleeInfo.picture + '" alt="" class="circle responsive-img">' +
          '</div>' +
          '<span class="col s10">' +
            '<div class="row">' +
              '<span class="col s3 text-right">Name: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.name + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">Email: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.email + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">locale: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.locale + '</span>' +
            '</span>' +
          '</div>' +
        '</div>';

  informationHolder.html(parseInformation);
  $('.modal-call').openModal();

}

// function processLocalVideo(controller) {
//
//   let localStreams = controller.getLocalStreams;
//   for (let stream of localStreams) {
//     console.log('Local stream: ' + stream.id);
//   }
//
// }

function showVideo(controller) {
  let messageChat = $('.hyperty-chat');
  let videoHolder = messageChat.find('.video-holder');
  videoHolder.removeClass('hide');

  let btnCamera = videoHolder.find('.camera');
  let btnMute = videoHolder.find('.mute');
  let btnMic = videoHolder.find('.mic');
  let btnHangout = videoHolder.find('.hangout');

  console.log(controller);

  btnCamera.on('click', function(event) {

    event.preventDefault();

    controller.disableCam().then(function(status) {
      console.log(status, 'camera');
      let icon = 'videocam_off';
      let text = 'Disable Camera';
      if (!status) {
        text = 'Enable Camera';
        icon = 'videocam';
      }

      let iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(e) {
      console.error(e);
    });

  });

  btnMute.on('click', function(event) {

    event.preventDefault();

    controller.mute().then(function(status) {
      console.log(status, 'audio');
      let icon = 'volume_off';
      let text = 'Disable Sound';
      if (!status) {
        text = 'Enable Sound';
        icon = 'volume_up';
      }

      let iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(e) {
      console.error(e);
    });

    console.log('mute other peer');

  });

  btnMic.on('click', function(event) {

    event.preventDefault();

    controller.disableMic().then(function(status) {
      console.log(status, 'mic');
      let icon = 'mic_off';
      let text = 'Disable Microphone';
      if (!status) {
        icon = 'mic';
        text = 'Enable Microphone';
      }

      let iconEl = '<i class="material-icons left">' + icon + '</i>';
      $(event.currentTarget).html(iconEl);
    }).catch(function(e) {
      console.error(e);
    });

  });

  btnHangout.on('click', function(event) {

    event.preventDefault();

    console.log('hangout');
  });
}
