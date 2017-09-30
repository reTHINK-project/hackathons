/**
* @author Bernardo Graça [bernardo.marquesg@gmail.com]
* @version 0.1.0
*/

/**
*Some variables for flux control
*/
const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let codeGeneratorReporter
let groupChatManager
let isOwner = false
let isCreated = false

/*
  Load Runtime
*/
$(document).ready(function () {
  rethink.default.install({
    domain: 'hybroker.rethink.ptinovacao.pt',
    development: true,
    runtimeURL: 'hyperty-catalogue://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/runtime/Runtime'
  }).then((runtime) => {
    loadHyperty(runtime)
  });
})

/*
  Load Hyperties
*/
function loadHyperty(runtime) {
  runtime.requireHyperty(hypertyURI('hybroker.rethink.ptinovacao.pt', 'GroupChatManager')).then((GroupChatManager) => {
    groupChatManager = GroupChatManager.instance
    return runtime.requireHyperty(hypertyURI('hybroker.rethink.ptinovacao.pt', 'CodeGeneratorReporter')).then((CodeGeneratorReporter) => {
      codeGeneratorReporter = CodeGeneratorReporter.instance
      hypertiesDeployed(groupChatManager, codeGeneratorReporter)
    })
  })
}

/*
 Extract my Identity
*/
function hypertiesDeployed(groupChatManager, codeGeneratorReporter) {
  search = groupChatManager.search
  search.myIdentity().then(function (identity) {
    createMyProfile(identity)
  })
}

/*
  Build profile card, invitation callback and all the possible actions
*/
function createMyProfile(identity) {
  let rowProfile = $('#row-profile')
  let cardProfile =
                      '<div class="col-md-2" id="col-image">' +
                          '<img class="card-img-top rounded-circle" id="profile_image" src="' + identity.avatar + '" alt="Card image cap">' +
                      '</div>' +
                      '<div class="col-md-4">' +
                        '<h3 class="name">' + identity.cn + '</h4>' +
                        '<p class="email">Email: ' + identity.username + '</p>' +
                      '</div>' +
                      '<div class="col-md">' +
                        '<button type="button" class="btn btn-outline-success" id="create-chat" data-toggle="modal" data-target="#myModal"> Create Chat </button>' +
                        '<button type="button" class="btn btn-outline-success" id="join-chat" data-toggle="modal" data-target="#myModal2"> Join Chat </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="invite-chat" data-toggle="modal" data-target="#myModal4"> Invite Friend </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="close-chat"> Close Chat </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="leave-chat"> Leave Chat </button>' +
                        '<button type="button" style="display: none;" class="btn btn-outline-success" id="code-request" data-toggle="modal" data-target="#myModal0"> Code </button>' +
                      '</div>'
  rowProfile.append(cardProfile)

  groupChatManager.onInvitation((event) => {
    onInvitation(event)
  })

  $('#create-chat').on('click', createChatRoomForm)
  $('#join-chat').on('click', joinChatRoomForm)
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
    groupChatManager.join(invitationEvent.url).then(function (chatController) {
      $('#code-request').show()
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
      $('#code-request').hide()
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
  Create Chat Room Modal
 */
function createChatRoomForm (event) {
  event.preventDefault()
  let createChatRoomButtonForm = $('#myModal').find('#create-chat-form')
  let addFriendButtonForm = $('#myModal').find('#add-friend-form')
  createChatRoomButtonForm.on('click', createChatRoom)
  addFriendButtonForm.on('click', addParticipantEvent)
}

/*
  Prepare to receive emails of friends to invite
 */
function addParticipantEvent (event) {
  event.preventDefault()
  let addFriendButtonForm = $('#myModal').find('#add-friend-form')

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
  createChatRoomButtonForm.off('click', createChatRoom)
  $('#myModal').find('#add-friend-form').off('click', addParticipantEvent)

  groupChatManager.create(name, users, ['hybroker.rethink.ptinovacao.pt']).then(function (chatController) {
    isOwner = true
    $('#invite-chat').show()
    $('#close-chat').show()
    $('#code-request').show()
    buildChat(chatController._dataObjectReporter._url, chatController._dataObjectReporter._name)
    prepareChat(chatController)
  }).catch(function (reason) {
    console.error(reason)
    $('#create-chat').show()
    $('#join-chat').show()
  })
}

/*
  Join Chat Room Modal
 */
function joinChatRoomForm (event) {
  event.preventDefault()
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

  groupChatManager.join(resource).then(function (chatController) {
    let participants = chatController._dataObjectObserver.data.participants
    $('#code-request').show()
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

  chatController.onClose(function (event) {
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

  $('#code-request-form').on('click', function(event) {
    createInstance(chatController)
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
  })

  // Invite friend - only the owner has the ability to invite
  if (isOwner) {
    let inviteFriend = $('#invite-form')
    inviteFriend.on('click', function (event) {
      let emails = $('#myModal4').find('#emails-invitation').val().replace(/ /g, '')
      let users = []

      if (emails.indexOf(',') > -1) {
        users = emails.split(',')
      } else if (emails !== '') { users[0] = emails }
      $('#emails').val('')

      // where the user is? Testing in my local machine but hyperties are in hysmart --> localhost or hysmart??
      chatController.addUser(users, ['hybroker.rethink.ptinovacao.pt']).then(function (result) {
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
    $('#code-request-form').unbind('click')
    $('#send-message').unbind('click')
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
    $('#code-request-form').unbind('click')
    $('#send-message').unbind('click')
  })
}

/*
  Extract the participants and update the APP
 */
function processParticipants (event) {
  let ativeUsers = $('#active-users')
  let user

  if (event.hasOwnProperty('data') && event.data) {
    user = event.data.identity.userProfile
  } else if (event.identity !== undefined){
    user = event.identity.userProfile
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
  $('#code-request').hide()
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

/*
  Prepare codeGeneratorReporter instance
*/
function createInstance(chatController) {
  let emails = []
  emails.push($('#observer-name').val())
  let teamName = $('#team-name').val()

  if(!isCreated) {
    codeGeneratorReporter.create(emails).then((result) => {
      $('#observer-name').val('')
      $('#team-name').val('')
      isCreated = true
      setTimeout(() =>{
        generateCodeService(teamName, chatController)
      }, 2000)
    });
  } else {
    $('#observer-name').val('')
    $('#team-name').val('')
    generateCodeService(teamName, chatController)
  }
}

/*
  Generate a code
*/
function generateCodeService(teamName, chatController) {
  codeGeneratorReporter.generateCode(teamName).then((code) => {
    chatController.send(code).then(function (result) {
      processMessage(result)
    }).catch(function (reason) {
      console.error('Error while sending a message: ', reason)
    })
  })
}
