
Connector Hyperty
-----------------

##1. Functionality description

The Connector Hyperty main functionality is to handle two party audio and voice conversations by using WebRTC technology.


##1.1 Hyperty Data Objects schemas

This Hyperty handles standard [Connection Data Objects](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/connection).

##1.2 Descriptor

The Hyperty Connector descriptor is:

```
"HypertyConnector": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyConnector",
    "encoding": "base64",
    "signature": ""
    },
    "cguid": 10001,
    "hypertyType": [
    "audio",
    "video"
    ],
    "version": "0.1",
    "description": "Description of HypertyConnector",
    "objectName": "HypertyConnector",
    "configuration": {
    "webrtc": {
      "iceServers": [
        {
          "url": "stun:stun.l.google.com:19302"
        },
        {
          "url": "turn:194.65.138.95:3478",
          "credential": "luis123",
          "username": "luis"
        }
      ]
    }
    },
    "constraints": {},
    "sourcePackageURL": "/sourcePackage",
    "language": "javascript",
    "signature": "",
    "messageSchemas": "",
    "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/Connection"
    ],
    "accessControlPolicy": "somePolicy"
    }
```

The Hyperty Connector descriptor includes the required WebRTC ICE servers configuration:

```
"configuration": {
"webrtc": {
  "iceServers": [
    {
      "url": "stun:stun.l.google.com:19302"
    },
    {
      "url": "turn:194.65.138.95:3478",
      "credential": "luis123",
      "username": "luis"
    }
  ]
}
}
```

Since the Hyperty supports the standard connection data schema, any Catalog URL for that schema can be used.

##2. Exposed API

The Connector Hyperty implements two Hyperty APIs to be consumed by Applications:

* the Hyperty Connector API manages the creation of new WebRTC connections;
* the Hyperty ConnectionController API manages a certain WebRTC connection instance.

#### Hyperty Connector API

The Hyperty Connector API is used to create new connections.

##### connect

This function is used to create a new connection providing the identifier of the user to be notified.

`<Promise> ConnectionController connect( URL.UserURL user, MediaStream stream, string ?name)`


**parameters**

*user* - user to be invited that is identified with reTHINK User URL.

*stream* - WebRTC local MediaStream retrieved by the Application

*name* - is a string to identify the connection.

**returns**

A ConnectionController object as a Promise.

**How to use it**

```javascript
connector.connect(user, stream, name).then(function(controller){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```


##### onInvitation (addEventListener)

This function is used to handle notifications about incoming requests to create a new connection.

`onInvitation(ConnectionController connection)`

**parameters**

*connection* - the ConnectionController to handle the incoming connection invitation.

**How to use it**

```javascript
connector.onInvitation(function(connection){...});
 ```

#### Hyperty ConnectionController API

The Hyperty ConnectionController API is used to control a connection instance.

##### accept

This function is used to accept an incoming connection request received by `connection.onInvitation()`.

`<Promise> boolean accept( MediaStream stream)`

**parameters**

*stream* - WebRTC local MediaStream retrieved by the Application

**returns**

It returns, as a Promise, `true` in case the connection is successfully accepted, `false` otherwise.

**How to use it**

```javascript
connection.accept(stream).then(function(accepted){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```


##### decline

This function is used to decline an incoming connection request received by `connection.onInvitation()`.

`<Promise> boolean decline(int ?reason)`

**parameters**

*reason* - Integer decline reason that is compliant with RFC7231. If not present `400` is used. (optional)

**returns**

It returns, as a Promise, `true` in case the connection is successfully declined, `false` otherwise.

**How to use it**

```javascript
connection.decline(reason).then(function(declined){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

##### disconnect

This function is used to close an existing connection instance.

`<Promise> boolean disconnect()`

**returns**

It returns as a Promise `true` if successfully disconnected or `false` otherwise.

**How to use it**

```javascript
connection.close().then(function(closed){

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

##### onDisconnect

This function is used to receive requests to close an existing connection instance.

`onDisconect(DeleteEvent event)`

**parameters**

*event* - the DeleteEvent fired by the Syncher when the Connection is closed.

**How to use it**

```javascript
connection.onClose(function(event){...});
```
