#Group-Chat hyperty 

##1. Group-Chat hyperty functionality description.
The Group-Chat hyperty allows to exchange chat messages amongst defined group of users. This hyperty has been developed as a App Hyperty. It means it is executed in the same sandbox as the main web application which uses it.

##1.1 Data-schema used.
It uses the Communication Data schema so it is compatible with any hyperty using the same data schema.

##2. Exposed API. 

###create
Create a new chat group

####Syntax
    create (name, participants)

####Params
*name*

 Chat name

*participants*

 Participant Collection `[{email:"email@test.com", domain:"domain"}, ...]`.

####Returned value
Returns a [group chat](#2.1-group-chat-api) instance

####How to use it.
    groupchatHy.create('name', participants)
        .then((groupChat)=>{
            console.log(groupChat)
        })
        
###onInvite
Call a callback function when receives a group chat invitation

####Syntax
    onInvite (callback)

####Params
*callback*

 Callback function to call when a request invitation is received. A [group chat](#2.1-group-chat-object) instance is passed into this function.

####How to use it.
    groupChatHy.onInvite((groupChat)=>{
        console.log(groupChat)
    })

### 2.1 Group Chat object

####Exposed API

#####sendMessage
Send a message

######Syntax
    sendMessage(message, [distance])
    
######Params
*message*
 Message text

*distance*
 Optional parameter. If you set it, the message will only reach participants inside this radio.

######Returned value
Returns an object that represents the message

######How to use it.
    groupChat.sendMessage('hi')
        .then((message)=>{
            console.log(message)
        })

#####onMessage
Receive a new message

######Syntax
    onMessage(callback)

######Params
*callback*
 Callback function to call when a new message is received

######How to use it.
    groupChat.onMessage((message)=>{
        console.log(message)
    })
    
##3. Framework improvement proposals derived from Hyperty Group-Chat development.
* Add more filters to HypertyDiscoveryService. Right now too many code is needed to get the right URL filtering by user and descriptor. In addition in order to implement other advanced scenarios some other filters such as position are required. https://github.com/reTHINK-project/dev-hyperty/issues/25
* Add support for Unit Tests https://github.com/reTHINK-project/dev-hyperty/issues/23
* Allow use cases with two or more hyperties in demo app. I need test teh interaction between GroupChat Hyperty and Location Hyperty https://github.com/reTHINK-project/dev-hyperty/issues/24
* Update selected observers only. To send a message only to selected participant in a group chat https://github.com/reTHINK-project/dev-hyperty/issues/26
* Add or remove observers once reporter is created. In order to add participants in a started group chat https://github.com/reTHINK-project/dev-hyperty/issues/27

