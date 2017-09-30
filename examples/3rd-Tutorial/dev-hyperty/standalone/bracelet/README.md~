Standalone runtime application
------------------------------

### Introduction

The client side of the reTHINK architecture has been designed to be executed in a device which can execute a Javascript runtime, typically a web browser. This allows to be able to access to servcies provided through the reTHINK network from almost any device. Nowadays it is possible to run web browser in almost any personal gadget, however there may be devices where either is it not possible to run a browser or the available browsers does not suport the APIs required by the reTHINK browser runtime. For example, the browsers in iOS does not currently support the WebRTC API.

![Web App executed in browser](html5WebApphybris.png)

That is the main reason why the creation of an application which can run the reTHINK client applications has been identified as a need. The use of web applications embedded in native application or even replacing them has become a common practice in the last years. This allows to re-use all the code developed for web applications therefore reducing the cost and time-to-market of new applications.

![Hybrid App](hybridApp.png)

There are several alternatives to execute web applications as native apps. In Android there webview elements directly provided by the OS and there are projects which allows to create native apps for both iOS and Android. For reTHINK the Crosswalk Project has been chosen to implement the native apps.

### Crosswalk Project

reTHINk standalone application allows to execute reTHINK runtime in Android and iOS devices without the need of having installed a browser will full support of the required APIs. The standalone application is based on the [Crosswalk Project](https://crosswalk-project.org/) from Intel. Crosswalk Project is an HTML application runtime, built on open source foundations, which extends the web platform with new capabilities. Crosswalk gives a web runtime for mobile and desktop applications. The immediate benefit of bundling an application with the Crosswalk webview is that everywhere the application runs, it uses the same, Chromium-based runtime. It is possible to create webviews for Android and iOS, but also for Windows and Linux Desktop applications so it makes any web application usable in almost any platform. In reTHINK only standalone runtime aplpication swiil be created for Android and iOS, as it always possible to install browsers which can execute reTHINK applications in Desktops.

WebRTC APIs are available in Crosswalk 5 or later on ARM; and Crosswalk 7.36.154.6 or later for x86. Web workers (also required for the browser runtime) is also supported by Crosswalk since previous versions.

### Android standalone application

The diagram below shows the architecture of the appplication. The hybrid application is created with Cordova which allows to access different sensors and services of the phone through a Javascript API. Cordova connects the App the Crosswalk Webview which is the part of the code which implements the WebRTC stack. Crosswalk will give a consistent Webview implementation across all the Android versions and it will guarantee that the reTHINK runtime will be executed correctly.

![Standalone Android App](MobileAppAndroidDiagram.png)

### Building the reTHINK Android application

#### Installing prerequisites

**cordova**

<code>install -g cordova</code>

**android sdk tools**

Follow this instructions: [Download Android Studio and SDK Tools](https://developer.android.com/sdk/index.html)

#### Building the application

````
    npm install
    cordova run android
````

<!--
### iOS standalone application

In iOS the architecture is slightly different from the Android architecture. Cordova is also use to build the application but the WebRTC stack will be provided by the eface2face plugin which includes a complete WebRTC library. In the Android App this is provided by Crosswalk. In iOS a complete simulation of the official WebRTC stack is provided by [!cordova-plugin-iosrtc](https://github.com/eface2face/cordova-plugin-iosrtc). It implementes the official [!WebRTC W3C API](https://www.w3.org/TR/webrtc/) and includes a compiled library with all the WebRTC code. The rest of the Javascript APIs that are required to execute the reTHINK runtime will be provided by Cordova.

![Standalone iOS App](MobileAppiOSDiagram.png)

#### Building reTHINK iOS standalone application

##### Requirements

1.	OSX with XCode 5.
2.	A valid Apple ID must be used (load associated certificates and profiles).

##### Build process

1.	It is necessary to clone ios-rethink-standalone repository (this repository has not been yet created at the time of this writing) .
2.	Open application project with XCode: sippo-ios/app/Sippo.xcodeproj.
3.	Set the target location: change default values defined at Root.plist file (Settings.bundle->Root.plist in XCode project explorer).
4.	Build application.
-->
