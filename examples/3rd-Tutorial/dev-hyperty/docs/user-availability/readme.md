
User Availability Hyperties
-------------------

##1. Functionality description

The User Availability is comprised by two Hyperties.

The User Availability Reporter manages user availability state ('available', 'unavailable', 'busy', 'away') by publishing it to a certain Context Resource URL and handling subscriptions requests from User Availability Observer.

The User Availability Observer provides the monitoring of availability from multiple users. It enables the discovery of users publishing its Availability Context and the subscription to it.

##1.1 Hyperty Data Objects schemas

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* AVAILABILITY_CONTEXT

**ContextUnit**

-	pres: user availability status in one of these values: available, unavailable, away, busy

**example**

```
{
	"scheme": "context",
     "id": "1276020076",
     "time": 1465070579,
     "values": [ {
				"type": "availability_context",
         "unit": "pres",
         "value": 'available' } ]
}
```

##1.2 Descriptor

The My Bracelet Hyperty descriptor is:

```
"UserAvailabilityReporter": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "UserAvailabilityReporter",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["availability_context"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of UserAvailabilityReporter Hyperty",
  "objectName": "UserAvailabilityReporter",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/Context"
  ],
  "accessControlPolicy": "somePolicy"
}
```

Since the Hyperty supports the standard context data schema, any Catalog URL for that schema can be used.

## UserAvailabilityReporter API

The UserAvailabilityReporter Hyperty provides an API to let the Application set the User Availability status. When the Hyperty starts the first time it creates a new Context object that is re-used for the next sessions.

### start

This function starts the user availability reporting by setting the subscriptions handler and returning the UserAvailability Data Object. Currently, the subscriptions handler automatically accepts all subscriptions requests. If no UserAvailability objects exists to be resumed, a new one is created.

```
<Promise> DataObjectReporter start()
```

**parameters**

No input parameter.

**returns**

A promise with UserAvailability DataObjectReporter.

### setStatus

This function sets a new value to UserAvailability status and triggers a `my-availability-update` event that the App may listen to.

```
setStatus( string newStatus )
```

**parameters**

*newStatus* the new value of user availability

## UserAvailabilityObserver API

The UserAvailabilityObserver Hyperty provides an API to discover and observe multiple users publishing availability status. The App has to set one listener per observed user to receive events about availability status change.

### start

This function starts user availability status observation and returns one array of UserAvailabilityController instance. For each one, the App has to set a onChange event handler (see below). If no users exist to observe, it returns `false`.

```
<Promise> UserAvailabilityController[] || boolean start()
```

**parameters**

No input parameter.

**returns**

A promise with an array of UserAvailabilityController instances.

### discoverUsers

This function discovers Hyperties used by users to publish availability status.

```
<Promise> HypertyInstance[] discoverUsers( string email, string ?domain )
```

**parameters**

*email* the user identifier
*domain* (optional) the domain providing the Hyperty

**returns**

A promise with an array of discovered HypertyInstance.

### observe

This function starts the observation of the availability status managed by a certain Hyperty.

```
<Promise> UserAvailabilityController observe( HypertyURL hypertyID )
```

**parameters**

*hypertyID* the URL of the Hyperty to be observed

**returns**

A promise with an UserAvailabilityController instance that monitors the availability status for a certain user.

### UserAvailabilityController

The UserAvailabilityController monitors the availability status for a certain user. Every change of the status triggers a `onChange` event identified by the context URL of the observed Data. The event handler to be set by the APP should be done like:

```
userAvailabilityControllerInstance.addEventListener(availabilityUrl, function(event) {
    \\Your code to process the availability status change
	});
```

The observed UserAvailability DataObject can be obtained with `dataObject` getter. Example to get UserAvailability URL:

`userAvailabilityControllerInstance.dataObject.url`
