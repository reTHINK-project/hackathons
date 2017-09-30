#Notifications hyperty 

##1. Notifications hyperty functionality description.
The Notifications hyperty is divided into two other components. First one is the NotificationsReporter that allows sending notifications to specific hyperties. The second one is the NotificationObserver that triggers an event for each notification received. In addition, a library is provided in order to allow hyperties trigger notification to their observer.

##1.1 Data-schema used.
It uses the Communication Data schema so it is compatible with any hyperty using the same data schema.

##2. Exposed API. 

###2.1 NotificationsReporter

####send
Send a notification to specefic hyperties.

#####Syntax
    send (identities, notification)

#####Params
*identities*

 Identities Collection `[{email:"email@test.com", domain:"domain"}, ...]`

*notification*

 Notification `{type: "NOTIFICATION_TYPE", payload:{}}`

#####How to use it.
`notificationsHy.send(participants, 
          {type: "NETWORK_NOTIFICATION", payload: {message:$("textarea").val()}})`

###2.2 NotificationsObserver

####onNotification
Call a callback function when receives a notification

#####Syntax
    onNotification (callback)

#####Params
*callback*

 Callback function to call when a notification is received.

#####How to use it.
`notificationsHy.onNotification(processNotification)`

### 2.3 Notifications trigger library

####trigger
Send a notification

####Syntax
    trigger(recipients, notification)
    
####Params
*recipients*
 Recipients Collection `[{email:"email@test.com", domain:"domain"}, ...]`

*notification*
 Notification `{type: "NOTIFICATION_TYPE", payload:{}}`

######How to use it.
`notifications.trigger(identities, notification)`
    
##3. Framework improvement proposals derived from Hyperty Group-Chat development.

*Problems with the Communication schema [9](https://github.com/reTHINK-project/dev-hyperty-toolkit/issues/9#issuecomment-225280592)
*Code to get Hyperties per user repeated in many hyperties [29](https://github.com/reTHINK-project/dev-hyperty/issues/29)
*Timeout needed to get first message [30](https://github.com/reTHINK-project/dev-hyperty/issues/30)
*Mapping required between identity returned by IdentityManager and the expected by HypertyDiscoveryService [31](https://github.com/reTHINK-project/dev-hyperty/issues/31)
