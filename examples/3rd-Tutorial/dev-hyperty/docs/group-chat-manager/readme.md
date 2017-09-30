Group Chat Hyperty
------------------

##1. Functionality description

The Group Chat main functionality is to handle Text conversations among groups, including:

* creation of a new Group Chat with possibility to invite users to join it
* notification about invitation to join a Group Chat with options to accept or reject
* send message to group
* receive message from group with identity from sender


##1.1 Hyperty Data Objects schemas

This Hyperty handles standard [Communication Data Objects](https://github.com/reTHINK-project/dev-service-framework/blob/develop/docs/datamodel/data-objects/communication/readme.md) constrained for Chat Communications i.e. the hypertyResource type is `chat`.

##1.2 Descriptor

The Group Chat Hyperty descriptor is:

```
"HypertyChat": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyChat",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": [
    "chat"
  ],
  "cguid": 10004,
  "version": "0.1",
  "description": "Description of HypertyChat",
  "objectName": "HypertyChat",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/Communication"
  ],
  "accessControlPolicy": "somePolicy"
}
```

Since the Hyperty supports the standard communication data schema, any Catalog URL for that schema can be used.

##2. Exposed API

The Group Chat Hyperty implements two APIs to be consumed by Applications:

* the Group Chat Manager API manages the creation of new Group Chats;
* the Hyperty Group Chat API manages a certain Group CHat instance.


#### Hyperty Group Chat Manager API

The Hyperty Group Chat Manager API is used to manage new Chat Group conversations.

##### create

This function is used to create a new Group Chat providing the name and the identifiers of users to be invited.

`<Promise> ChatController create(string name, URL.UserURL users[]?)`


**parameters**

*name* - is a string to identify the Group Chat

*users* - array of users to be invited to join the Group Chat. Users are identified with reTHINK User URL.

**returns**

A ChatController object as a Promise.

**How to use it**

```javascript
chatGroupManager.create(name, users).then(function(chatController){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

##### onInvitation

This function is used to handle notifications about incoming invitations to join a Group Chat.

`onInvitation(CreateEvent invitation)`


**parameters**

*invitation* - the CreateEvent fired by the Syncher when an invitaion is received

**How to use it**

```javascript
chatGroupManager.onInvitation(function(event){...});
```

##### join

This function is used to join a Group Chat.

`<Promise> ChatController join(URL.CommunicationURL invitation.url)`

**parameters**

*invitation.url* - the Communication URL of the Group Chat to join that is provided in the invitation event

**returns**

It returns the ChatController object as a Promise

**How to use it**

```javascript
chatGroupManager.join(invitation.url).then(function(chatController){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

#### Chat Controller API

The Chat Controller API is used to control a Group Chat  instance.

##### send

This function is used to send a chat message.

`<Promise> Communication.ChatMessage send(Communication.ChatMessage message)`

**parameters**

*message* is the ChatMessage to be sent.

**returns**

It returns the ChatMessage child object created by the Syncher as a Promise.

**How to use it**

```javascript
chatController.send(message).then(function(sentMessage){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```


##### onMessage

This function is used to receive new messages.

`onMessage(Communication.ChatMessage message)`

**parameters**

*message* - the received message compliant with Communication.ChatMessage.

**How to use it**

```javascript
chatController.onMessage(function(message){...});
```

##### onClose

This function is used to receive requests to close the Group Chat instance.

`onClose(DeleteEvent event)`

**parameters**

*event* - the DeleteEvent fired by the Syncher when the Chat is closed.

**How to use it**

```javascript
chatController.onClose(function(event){...});
```

##### close

This function is used to close an existing Group Chat instance. Only available to Chat Group Reporters i.e. the Hyperty instance that created the Group Chat.

`<Promise> boolean close()`

**returns**

It returns as a Promise `true` if successfully closed or `false` otherwise.

**How to use it**

```javascript
chatController.close().then(function(closed){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

##### addUser

This function is used to add / invite new user on an existing Group Chat instance. Only the Reporter, i.e. the Hyperty that has created the Group Chat, is allowed to use this function.

`<Promise> boolean addUser(URL.UserURL user)`

**parameters**

*user* - user to be invited to join the Group Chat that is identified with reTHINK User URL.

**returns**

It returns as a Promise `true` if successfully invited or `false` otherwise.

**How to use it**

```javascript
chatController.addUser(user).then(function(added){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

##### removeUser

This function is used to remove a user from an existing Group Chat instance. Only the Reporter, i.e. the Hyperty that has created the Group Chat, is allowed to use this function.

`<Promise> boolean removeUser(URL.UserURL user)`

**parameters**

*user* - user to be removed from the Group Chat that is identified with reTHINK User URL.

**returns**

It returns as a Promise `true` if successfully removed or `false` otherwise.

**How to use it**

```javascript
chatController.removeUser(user).then(function(removed){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```
