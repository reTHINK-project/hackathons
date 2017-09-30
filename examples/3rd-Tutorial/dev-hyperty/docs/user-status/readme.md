# User-Status hyperty

## 1. Location hyperty functionality description.

The UserStatus is an hyperty that allows send its status to a list of users (contacts) and subscribe the the status from other users.
UserStatus hyperty defines a "connected" and "disconnected" status but the application can define other status if needed.

When starting, the UserStatus hyperty is not able to subscribe to a remote user status. When receiving a new invitation to subscribe to a remote user status, the hyperty also sends itself an invitation to the remote user to subscribe to its status (shema)

To manage a remote user's disconnection, the UserStatus hyperty continuously update and broadcast the status to the other parties (heartbit).
If the hyperty doesn't receive an update for a certain amount of time, it considers the remote user as disconnected.


## 1.1 Data-schema used.
Availability is
It uses the Context Data schema so it is compatible with any hyperty using the same data schema.

## 2. Exposed API.

### create
Start monitoring for presence status

#### Syntax
    promise create(contacts)

#### Params
*contacts *
 List of hyperties urls to monitor.

#### How to use it
    userStatusHy
        .create([<hyperty-runtime-url>,...])
        .then(()=>{
             console.log('waiting for user presence update');
        })

### setStatus
Define new status for current user availability.

#### Syntax
    void setStatus(newStatus)

#### Params
*newStatus*
String representing current user state, possible values:
- available: user is connected and available
- unavailable: user is disconnected (default state)
- busy: user is connected but not available
- away: user is connected but

#### How to use it.
    userStatusHy.setStatus(<state>)

### getStatus
Retrieve current user state.

#### Syntax
    string getStatus()

#### How to use it.
    userStatusHy.getStatus()


## 3. Framework improvement proposals derived from Hyperty Location development.

- Ability to retrieve a user's data object linked to an hyperty
As described before, a user can't know someone's status before having sent it's own status.

It would be more efficient if user's status data object could be permanent and could be retrieved with a search in the registry.

Ideally, it would be not necessary to retrieve any data objet url and user presence should have predictible data object url.
=> https://github.com/reTHINK-project/dev-runtime-core/issues/85

- Being notified when reporter of a data object is disconnected

To better managed the disconnexion status, we would need to be notified when a remote user is disconnected and its data object is not up to date and will not be updated.

Even if it's not the main rethink idea, the most efficient way is to handle user disconnection from msg-node because it's the first component notified of user change : websocket give true connection state in contrary to long polling or heartbeat system who's based on the absence of network activity packet.
=> https://github.com/reTHINK-project/dev-hyperty/issues/28

- guideline for unit/end-to-end test would be fine
=> https://github.com/reTHINK-project/dev-hyperty/issues/11
=> https://github.com/reTHINK-project/dev-hyperty/issues/23
