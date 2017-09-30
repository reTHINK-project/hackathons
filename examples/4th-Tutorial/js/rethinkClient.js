/*
* This file loads the Group Chat Manager Hyperty deployed on the Hyperty Domain Catalogue,
* It will be used in Video Conference Application supported by reTHINK */
/**
* @author Bernardo Graça [bernardo.marquesg@gmail.com]
* @version 0.1.0
*/
/* global $:false */

/**
*Some variables for flux control
*/
let runtimeDomain
let hypertyDomain
let runtimeURL
var chatGroupManager
var connector
let RUNTIME
let hypertyGroupChatManager = null
let hypertyConnector = null
const hypertyURI = (hypertyDomain, hyperty) => `hyperty-catalogue://catalogue.${hypertyDomain}/.well-known/hyperty/${hyperty}`
let isOwner = false
let search

$(document).ready(function () {
  $.getJSON('../system.config.json').complete(function (data) {
    ready(JSON.parse(data.responseText))
  })
})

function getUserMedia (constraints) {
  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (mediaStream) {
        resolve(mediaStream)
      })
      .catch(function (reason) {
        reject(reason)
      })
  })
}

function ready (config) {
  runtimeDomain = config['runtime-domain']
  hypertyDomain = config['hyperty-domain']
  let head = document.getElementsByTagName('head')[0]
  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.onload = function () {
    loadRuntime()
  }
  script.src = 'http://' + runtimeDomain + ':8080/bin/rethink.js'
  head.appendChild(script)
  runtimeURL = `hyperty-catalogue://catalogue.${runtimeDomain}/.well-known/runtime/Runtime`
}

/*
  Load Runtime
*/
function loadRuntime () {
  var start = new Date().getTime()
  rethink.default.install({
    domain: runtimeDomain,
    development: true,
    runtimeURL: runtimeURL
  }).then((runtime) => {
    RUNTIME = runtime
    var time = (new Date().getTime()) - start
    console.log('*** APP LOG ***: Runtime has been successfully launched in ' + time / 1000 + ' seconds')
    loadHyperty()
  })
}

/*
  Load Hyperties
*/
function loadHyperty () {
  RUNTIME.requireHyperty(hypertyURI(hypertyDomain, 'GroupChatManager')).then((groupChatManager) => {
    hypertyGroupChatManager = groupChatManager
    console.log('*** APP LOG ***: Hyperty ' + groupChatManager.name + ' Deployed')
    return RUNTIME.requireHyperty(hypertyURI(hypertyDomain, 'Connector')).then((connector) => {  // NOTE 6
      hypertyConnector = connector
      console.log('*** APP LOG ***: Hyperty ' + connector.name + ' Deployed')
      hypertiesDeployed(hypertyGroupChatManager, hypertyConnector)
    })
  })
}

/*
 Call back after Group Chat Manager and Connector hyperties are loaded
*/
function hypertiesDeployed (GroupChatManager, Connector) {
  search = GroupChatManager.instance.search
  search.myIdentity().then(function (identity) {
    hypertyReady(GroupChatManager, Connector, identity)
  })
}

/*
  Build profile card, invitation callback and all the actions possible
*/
function hypertyReady (GroupChatManager, Connector, identity) {
  let rowProfile = $('#row-profile')
  let cardProfile =
                      '<div class="col-md-2" id="col-image">' +
                          '<img class="card-img-top rounded-circle" id="profile_image" src="' + identity.avatar + '" alt="Card image cap">' +
                      '</div>' +
                      '<div class="col-md-4">' +
                        '<h3 class="name">' + identity.cn + '</h4>' +
                        '<p class="email">Email: ' + identity.username + '</p>' +
                        '<p class="hyperty-url">Hyperty URL: ' + GroupChatManager.runtimeHypertyURL + '</p>' +
                      '</div>' +
                      '<div class="col-md">' +
                        '<button type="button" class="btn btn-outline-success" id="create-chat" data-toggle="modal" data-target="#myModal"> Create Chat </button>' +
                        '<button type="button" class="btn btn-outline-success" id="join-chat" data-toggle="modal" data-target="#myModal2"> Join Chat </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="invite-chat" data-toggle="modal" data-target="#myModal4"> Invite Friend </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="close-chat"> Close Chat </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="leave-chat"> Leave Chat </button>' +
                        '<button type="button" class="btn btn-outline-success" id="call-button" data-toggle="modal" data-target="#myModal6"> Video Call </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="leave-call"> Hagout </button>' +
                      '</div>'
  rowProfile.append(cardProfile)

  chatGroupManager = GroupChatManager.instance
  chatGroupManager.onInvitation((event) => {
    onInvitation(event)
  })

  connector = Connector.instance
  connector.onInvitation(function (controller, identity) {
    callInvitation(controller, identity)
  })

  $('#create-chat').on('click', createChatRoomForm)
  $('#join-chat').on('click', joinChatRoomForm)

  let callButtonForm = $('#myModal6').find('#call-form')
  callButtonForm.on('click', callForm)
}

/*
  Receive Video Call Invitation
*/
function callInvitation (controller, identity) {
  let invitationCallModal = $('#myModal7')
  let callee = invitationCallModal.find('.invitation-call-name')
  let calleeIdentity = '<p>' + identity.username + '</p>'
  callee.append(calleeIdentity)
  $('#myModal7').modal('show')

  generateVideoCallSpace()
  showVideo(controller)

  let acceptButton = invitationCallModal.find('#accept-call-invitation')
  acceptButton.on('click', function (e) {
    $('.invitation-call-name').children().remove()
    let options = {video: true, audio: true}
    getUserMedia(options).then(function (mediaStream) {
      var video = $('.my-video')
      video[0].src = window.URL.createObjectURL(mediaStream)
      return controller.accept(mediaStream)
    })
    .then(function (result) {
      $('#call-button').hide()
      $('#leave-call').show()
    }).catch(function (reason) {
      $('#call-button').show()
      $('#leave-call').hide()
      console.error(reason)
    })
    acceptButton.unbind('click')
    rejectButton.unbind('click')
  })

  let rejectButton = invitationCallModal.find('#reject-call-invitation')
  rejectButton.on('click', function (e) {
    controller.decline().then(function (result) {
      $('.invitation-call-name').children().remove()
    }).catch(function (reason) {
      console.error(reason)
    })
    acceptButton.unbind('click')
    rejectButton.unbind('click')
  })
}

/*
  Call Button Form
*/
function callForm () {
  let callModal = $('#myModal6')
  let emails = callModal.find('#emails-invitation-call').val().replace(/ /g, '')
  let user = []
  if (emails.indexOf(',') > -1) {
    user = emails.split(',')
  } else if (emails !== '') { user[0] = emails }
  $('#emails-invitation-call').val('')

  search.users([user[0]], ['localhost'], ['connection'], ['audio', 'video']) // NOTE 8
  .then(function (result) {
    generateVideoCallSpace()
    openVideoCall(result[0].userID, 'localhost') // NOTE 8
  })
  .catch(function (reason) {
    console.error(reason)
  })
}

/*
  Video Call HTML Configuration
*/
function generateVideoCallSpace () {
  let chatRow = $('#chat-room-row')
  let displayVideoSquares =
                            '<div class="col-md-2" id="my-video-content">' +
                              '<video class="my-video responsive-video" muted style="background-color: black; position: absolute; top: 10px; left: 10%; height: 110px;" autoplay></video>' +
                            '</div>' +
                            '<div class="col-md-3" id="video-content">' +
                              '<video class="video responsive-video" style="background-color: black;" autoplay></video>' +
                            '</div>'
  chatRow.append(displayVideoSquares)
}

/*
  Open a video call between two users
*/
function openVideoCall (userURL, domain) {
  let options = {video: true, audio: true}
  let localMediaStream
  getUserMedia(options).then(function (mediaStream) {
    localMediaStream = mediaStream
    return connector.connect(userURL, mediaStream, '', domain)
  })
  .then(function (controller) {
    $('#call-button').hide()
    $('#leave-call').show()
    showVideo(controller)
    var video = $('.my-video')
    video[0].src = window.URL.createObjectURL(localMediaStream)
  }).catch(function (reason) {
    $('#call-button').show()
    $('#leave-call').hide()
    console.error(reason)
  })
}

/*
  Manage Video Call
*/
function showVideo (controller) {
  controller.onAddStream(function (event) {
    var video = $('.video')
    video[0].src = window.URL.createObjectURL(event.stream)
  })

  controller.onDisconnect(function (identity) {
    let callClosed = $('#myModal8')
    let idDiv = callClosed.find('.close-call-identity')
    let email = '<p>' + 'Closed by: ' + identity.userProfile.username + '</p>'
    idDiv.append(email)
    $('#myModal8').modal('show')
    $('#my-video-content').remove()
    $('#video-content').remove()
    $('#leave-call').hide()
    $('#call-button').show()
  })

  // HAGOUT
  let leaveCall = $('#leave-call')
  leaveCall.on('click', function (event) {
    event.preventDefault()
    $('#call-button').show()
    $('#leave-call').hide()

    controller.disconnect().then(function (status) { // NOTE 7
      $('#my-video-content').remove()
      $('#video-content').remove()
    }).catch(function (e) {
      console.error(e)
    })
    leaveCall.unbind('click')
  })
}

/*
  Create Chat Room Modal
 */
function createChatRoomForm (event) {
  event.preventDefault()
  let createChatRoomButtonForm = $('#myModal').find('#create-chat-form')
  let addFriendButtonForm = $('#myModal').find('#add-friend-form')
  // $('#create-chat').unbind('click')
  createChatRoomButtonForm.on('click', createChatRoom)
  addFriendButtonForm.on('click', addParticipantEvent)
}

/*
  Join Chat Room Modal
 */
function joinChatRoomForm (event) {
  event.preventDefault()
  // $('#join-chat').unbind('click')
  let joinChatRoomButtonForm = $('#myModal2').find('#join-chat-form')
  joinChatRoomButtonForm.on('click', joinChatRoom)
}

/*
  Join to an existent chat room
 */
function joinChatRoom (event) {
  event.preventDefault()
  let joinChatRoomButtonForm = $('#myModal2').find('#join-chat-form')
  joinChatRoomButtonForm.unbind('click')
  let resource = $('#myModal2').find('#chat-name-join').val()
  $('#chat-name-join').val('')
  $('#create-chat').hide()
  $('#join-chat').hide()
  $('#leave-chat').show()

  chatGroupManager.join(resource).then(function (chatController) { // NOTE 3
    let participants = chatController._dataObjectObserver.data.participants
    buildChat(resource, chatController._dataObjectObserver._name)
    prepareChat(chatController)
    Object.keys(participants).forEach(function (objectKey, index) {
      var user = participants[objectKey]
      processParticipants(user.identity)
    })
  }).catch(function (reason) {
    console.error(reason)
    $('#create-chat').show()
    $('#join-chat').show()
    $('#leave-chat').hide()
  })
}

/*
  Prepare everything after receive an Invitation
 */
function onInvitation (event) {
  console.log('On Invitation: ', event)
  let invitationEvent = event
  $('#myModal3').modal('show')

  let chatNameDiv = $('#myModal3').find('.invitation-chat-name')
  let name = '<h2>' + event.value.name + '</h2>' +
             '<p>' + event.url + '</p>'
  chatNameDiv.append(name)

  let chatParticipantsDiv = $('#myModal3').find('.invitation-chat-participants')
  let infoParticipants = '<p style="font-weight: bold;"> Sended by: </p>'
  chatParticipantsDiv.append(infoParticipants)
  chatParticipantsDiv.append('<p>' + event.identity.userProfile.username + '</p>')

  let buttonAccept = $('#myModal3').find('#accept-chat-invitation')
  buttonAccept.on('click', function (event) {
    event.preventDefault()
    chatGroupManager.join(invitationEvent.url).then(function (chatController) {
      buildChat(invitationEvent.url, chatController._dataObjectObserver._name)
      prepareChat(chatController)
      let participants = chatController.dataObjectObserver.data.participants
      Object.keys(participants).forEach(function (objectKey, index) {
        var user = participants[objectKey]
        processParticipants(user.identity)
      })
      $('#create-chat').hide()
      $('#join-chat').hide()
      $('#leave-chat').show()
      $('.invitation-chat-name').empty()
      $('.invitation-chat-participants').empty()
    }).catch(function (reason) {
      console.error('Error connection to: ', reason)
      $('#create-chat').show()
      $('#join-chat').show()
      $('#leave-chat').hide()
    })
    buttonAccept.unbind('click')
  })

  let buttonReject = $('#myModal3').find('#reject-chat-invitation')
  buttonReject.on('click', function (event) {
    event.preventDefault()
    $('#myModal3').modal('hide')
    $('.invitation-chat-name').empty()
    $('.invitation-chat-participants').empty()
    buttonReject.unbind('click')
  })
}

/*
  Prepare to receive emails of friends to invite
 */
function addParticipantEvent (event) {
  event.preventDefault()
  let addFriendButtonForm = $('#myModal').find('#add-friend-form')
  addFriendButtonForm.unbind('click')

  $('#myModal').find('#add-friend-label').show()
  $('#myModal').find('#emails').show()
  $('#myModal').find('#add-friend-form').hide()
}

/*
  Create Chat Room (Hyperty Side) and invite all the input users
 */
function createChatRoom (event) {
  event.preventDefault()
  let name = $('#myModal').find('#chat-name').val()
  $('#chat-name').val('')
  let emails = $('#myModal').find('#emails').val().replace(/ /g, '')

  let users = []
  if (emails.indexOf(',') > -1) {
    users = emails.split(',')
  } else if (emails !== '') { users[0] = emails }

  $('#emails').val('')
  $('#myModal').find('#add-friend-label').hide()
  $('#myModal').find('#emails').hide()
  $('#create-chat').hide()
  $('#join-chat').hide()
  let createChatRoomButtonForm = $('#myModal').find('#create-chat-form')
  createChatRoomButtonForm.unbind('click')

  chatGroupManager.create(name, users, ['localhost']).then(function (chatController) { // NOTE 1
    isOwner = true
    $('#invite-chat').show()
    $('#close-chat').show()
    buildChat(chatController._dataObjectReporter._url, chatController._dataObjectReporter._name)
    prepareChat(chatController)
  }).catch(function (reason) {
    console.error(reason)
    $('#create-chat').show()
    $('#join-chat').show()
  })
}

/*
  Prepare Chat Room Form
 */
function buildChat (id, name) {
  let chatRowTitle = $('#chat-room-title')
  let chatTitle =
                   '<div class="col-md-6" id="chatTitle">' +
                     '<h3>' + name + '</h3>' +
                     '<p style="font-weight: bold;"> Give this URL to your friends to participate in this chat room: </p>' +
                      id +
                   '</div>'
  chatRowTitle.append(chatTitle)

  let chatRow = $('#chat-room-row')
  let chatBoardAtiveUsers =
                             '<div class="col-md-2" id="active-users">' +
                             '<p></p>' +
                             '</div>' +
                             '<div class="col-md-3" id="chat-board">' +
                               '<p></p>' +
                             '</div>'
  chatRow.prepend(chatBoardAtiveUsers)

  let messagesInputRow = $('#messages-input-row')
  let chatBoardMessages =
                             '<div class="message col-md-5" id="messages">' +
                               '<div class="form-group" id="enter-message">' +
                                 '<label for="message-text-area" style="font-weight: bold; width: 100%;">New Message: </label>' +
                                 '<textarea class="form-control" id="message-text-area" rows="3"></textarea>' +
                                 '<button type="button" class="btn btn-success" id="send-message">Send</button>' +
                               '</div>' +
                             '</div>'
  messagesInputRow.append(chatBoardMessages)
}

/*
  Prepare Chat Room Events (Send and Receive messages, Close chat room, Change?!, Add user, Remove user)
 */
function prepareChat (chatController) {
  chatController.onMessage(function (message) {
    console.info('New message received: ', message)
    processMessage(message)
  })

  chatController.onChange(function (event) {
    console.log('App - OnChange Event:', event)
  })

  chatController.onUserAdded(function (event) {
    console.log('App - onUserAdded Event:', event)
    processParticipants(event)
  })

  chatController.onUserRemoved(function (event) {
    console.log('App - onUserRemoved Event:', event)
    processUserRemoved(event)
  })

  chatController.onClose(function (event) { // NOTE 5
    console.log('App - onClose Event:', event)
    $('#myModal5').modal('show')
    let chatNameDiv = $('#myModal5').find('.close-chat-name')
    let chatIdentityDiv = $('#myModal5').find('.close-chat-identity')
    let name = '<p>' + event.url + '</p>'
    let owner = '<p>' + 'Closed by: ' + event.identity.userProfile.username + '</p>'
    chatNameDiv.append(name)
    chatIdentityDiv.append(owner)
    $('#leave-chat').hide()
    deleteChatRoom(event)
  })

  // Send message
  let sendMessage = $('#send-message')
  sendMessage.on('click', function (event) {
    event.preventDefault()
    chatController.send($('#message-text-area').val()).then(function (result) {
      processMessage(result)
      $('#message-text-area').val('')
    }).catch(function (reason) {
      console.error('Error while sending a message: ', reason)
    })
    // sendMessage.unbind('click')
  })

  // Invite friend - only the owner has the ability to invite NOTE 4
  if (isOwner) {
    let inviteFriend = $('#invite-form')
    inviteFriend.on('click', function (event) {
      let emails = $('#myModal4').find('#emails-invitation').val().replace(/ /g, '')
      let users = []

      if (emails.indexOf(',') > -1) {
        users = emails.split(',')
      } else if (emails !== '') { users[0] = emails }
      $('#emails').val('')

      // adicionar domains, []"localhost"] pelo que deve vir do ficheiro de configuration, -> runtime domain
      chatController.addUser(users, ['localhost']).then(function (result) {
        $('#myModal4').find('#emails-invitation').val('')
      }).catch(function (reason) {
        console.error('Error while inviting someone: ', reason)
      })
    })
  }

  // Leave the chat room - the owner deletes the chat when leave
  let closeChat = $('#close-chat')
  closeChat.on('click', function (event) {
    chatController.close().then(function (result) {
      deleteChatRoom()
    }).catch(function (reason) {
      console.log('An error occured when closing the chat room:', reason)
    })
    closeChat.unbind('click')
    $('#invite-form').unbind('click')
  })

  let leaveChat = $('#leave-chat')
  leaveChat.on('click', function (event) {
    chatController.close().then(function (result) {
      console.log('Chat closed: ', result)
      deleteChatRoom()
    }).catch(function (reason) {
      console.log('An error occured when closing the chat room:', reason)
    })
    leaveChat.unbind('click')
  })
}

/*
  Extract the participants and update the APP
 */
function processParticipants (event) {
  let ativeUsers = $('#active-users')
  let user

  if (event.hasOwnProperty('data') && event.data) {
    user = event.data.identity
  } else {
    user = event
  }
  if (user.username !== $('.email').text().split('Email: ')[1]) {
    ativeUsers.append('<p class="participant">' + user.username + '</p>')
  }
}

/*
  Process some received message
*/
function processMessage (message) {
  let messagesList = $('#chat-board')
  let from = ''
  if (message.identity) { from = message.identity.userProfile.username }
  let messageToAdd = '<p>' + from + ': ' + message.value.content + '</p>'
  messagesList.append(messageToAdd)
  $('#chat-board').scrollTop($('#chat-board')[0].scrollHeight)
}

/*
  Process some user that leaved the chat room
*/
function processUserRemoved (event) {
  let ativeUsers = $('#active-users').children('.participant')
  ativeUsers.map((user) => {
    if (ativeUsers[user].textContent === event.username) { ativeUsers[user].remove() }
    let messagesList = $('#chat-board')
    let messageToAdd = '<p style=color:red;>*** ' + event.username + ' left this chat room! ***</p>'
    messagesList.append(messageToAdd)
    $('#chat-board').scrollTop($('#chat-board')[0].scrollHeight)
  })
}

/*
  Delete chat room UI and clear all the related info
*/
function deleteChatRoom () {
  $('#close-chat').hide()
  $('#leave-chat').hide()
  $('#invite-chat').hide()
  $('#create-chat').show()
  $('#join-chat').show()
  $('#chat-room-title').children().remove()
  $('#active-users').remove()
  $('#chat-board').remove()
  $('#messages-input-row').children().remove()
  let createRoomModal = $('#myModal')
  let createChatRoomButtonForm = createRoomModal.find('#create-chat-form')
  let addFriendButtonForm = createRoomModal.find('#add-friend-form')
  createChatRoomButtonForm.off('click', createChatRoom)
  addFriendButtonForm.off('click', addParticipantEvent)
}
