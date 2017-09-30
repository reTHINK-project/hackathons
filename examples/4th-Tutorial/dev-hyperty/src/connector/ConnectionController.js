import 'webrtc-adapter'; //NOTE 10
import { connection } from './connection';

class ConnectionController {

  constructor(syncher, domain, configuration, clean, connector, remoteHyperty) {
    if (!syncher) throw new Error('The syncher is a needed parameter');
    if (!domain) throw new Error('The domain is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this.mode = 'offer';
    _this._connector = connector;
    _this._remoteHyperty = remoteHyperty;
    _this._syncher = syncher;
    _this._configuration = configuration.webrtc;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';
    _this._clean = clean;

    // Prepare the PeerConnection - WebRTC Standard !! -> webrtc-adapter API
    let peerConnection = new RTCPeerConnection(_this._configuration.webrtc);

    peerConnection.addEventListener('signalingstatechange', function(event) {
      console.info('[Connector.ConnectionController ]signalingstatechange', event.currentTarget.signalingState);

      if (event.currentTarget.signalingState === 'have-local-offer') {
        console.info('[Connector.ConnectionController ]signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
      }

      if (event.currentTarget.signalingState === 'have-remote-offer') {
        console.info('[Connector.ConnectionController ]signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
        _this.mode = 'answer';
      }
    });

    peerConnection.addEventListener('iceconnectionstatechange', function(event) {
      console.info('[Connector.ConnectionController ]iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);
      let data = _this.dataObjectReporter.data;

      if (data.hasOwnProperty('status')) {
        data.status = event.currentTarget.iceConnectionState;
      }
    });

    peerConnection.addEventListener('icecandidate', function(event) {
      console.info('[Connector.ConnectionController ]icecandidate changes', event.candidate, _this.dataObjectReporter);

      if (!event.candidate) return;

      let icecandidate = {
        type: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };

      let data = _this.dataObjectReporter.data;
      data.iceCandidates.push(icecandidate);
    });

    peerConnection.addEventListener('addstream', function(event) {
      console.info('[Connector.ConnectionController ]Add Stream: ', event, _this._onAddStream);

      if (_this._onAddStream) _this._onAddStream(event);
    });

    peerConnection.onremovestream = function(event) {
      console.info('[Connector.ConnectionController ]Stream removed: ', event);
    };

    _this.peerConnection = peerConnection;
  }

  set mediaStream(mediaStream) {
    if (!mediaStream) throw new Error('The mediaStream is a needed parameter');

    let _this = this;
    console.info('[Connector.ConnectionController ]set stream: ', mediaStream);
    _this._mediaStream = mediaStream;
    _this.peerConnection.addStream(mediaStream);
  }

  get mediaStream() {
    let _this = this;
    return _this._mediaStream;
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */
  set dataObjectReporter(dataObjectReporter) {
    if (!dataObjectReporter) throw new Error('The Data Object Reporter is a needed parameter');

    let _this = this;
    console.info('[Connector.ConnectionController ]set data object reporter: ', dataObjectReporter);
    _this._dataObjectReporter = dataObjectReporter;

    dataObjectReporter.onSubscription(function(event) {
      event.accept();
    });

    if (_this.mode === 'offer')
      _this._createOffer();
    else
      _this._createAnswer();
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */
  get dataObjectReporter() {
    let _this = this;
    return _this._dataObjectReporter;
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */
  set dataObjectObserver(dataObjectObserver) {
    if (!dataObjectObserver) throw new Error('The Data Object Observer is a needed parameter');

    let _this = this;
    console.info('[Connector.ConnectionController ]set data object observer: ', dataObjectObserver);
    _this._dataObjectObserver = dataObjectObserver;
    _this._changePeerInformation(dataObjectObserver);
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */
  get dataObjectObserver() {
    let _this = this;
    return _this._dataObjectObserver;
  }

  /**
   * Set the connection event to accept or reject
   * @param  {CreateEvent} event Event with actions to accept or reject the connection
   */
  set connectionEvent(event) {
    let _this = this;
    _this._connectionEvent = event;
  }

  /**
   * Get the connection event to accept or reject
   * @return {CreateEvent}
   */
  get connectionEvent() {
    let _this = this;
    return _this._connectionEvent;
  }

  set deleteEvent(event) {
    let _this = this;
    _this._deleteEvent = event;
    _this._removeMediaStream();
    if (_this._onDisconnect) _this._onDisconnect(event.identity);
    _this._clean(_this._connector._controllers, _this._remoteHyperty);
  }

  get deleteEvent() {
    let _this = this;
    return _this._deleteEvent;
  }

  _removeMediaStream() {
    let _this = this;
    console.log(_this.mediaStream, _this.peerConnection);

    if (_this.mediaStream && _this.peerConnection) {
      let tracks = _this.mediaStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }

    if (_this.peerConnection) {
      /*_this.peerConnection.removeStream(_this.mediaStream);
      _this.peerConnection.close();*/
      _this.peerConnection = null;
    }
  }

  _changePeerInformation(dataObjectObserver) {
    let _this = this;
    let data = dataObjectObserver.data;
    let isOwner = data.hasOwnProperty('ownerPeer');
    let peerData = dataObjectObserver.data;

    if (peerData.hasOwnProperty('connectionDescription')) {
      _this._processPeerInformation(peerData.connectionDescription);
    }

    if (peerData.hasOwnProperty('iceCandidates')) {
      console.log('Process Peer data: ', peerData);
      peerData.iceCandidates.forEach(function(ice) {
        _this._processPeerInformation(ice);
      });
    }

    dataObjectObserver.onChange('*', function(event) {
      console.info('[Connector.ConnectionController ]Observer on change message: ', event);
      _this._processPeerInformation(event.data);
    });
  }

  _processPeerInformation(data) {
    let _this = this;
    console.info('[Connector.ConnectionController processPeerInformation ]', JSON.stringify(data));

    if (data.type === 'offer' || data.type === 'answer') {
      console.info('[Connector.ConnectionController processPeerInformation]Process Connection Description: ', data.sdp);
      _this.peerConnection.setRemoteDescription(new RTCSessionDescription(data), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    if (data.type === 'candidate') {
      console.info('[Connector.ConnectionController ]Process Ice Candidate: ', data);
      _this.peerConnection.addIceCandidate(new RTCIceCandidate({candidate: data.candidate}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }
  }

  _remoteDescriptionSuccess() {
    console.info('[Connector.ConnectionController ]remote success');
  }

  _remoteDescriptionError(error) {
    console.error('error: ', error);
  }

  _createOffer() {
    let _this = this;
    _this.peerConnection.createOffer(function(description) {
      _this._onLocalSessionCreated(description);
    }, _this._infoError);
  }

  _createAnswer() {
    let _this = this;
    _this.peerConnection.createAnswer(function(description) {
      _this._onLocalSessionCreated(description);
    }, _this._infoError);
  }

  _onLocalSessionCreated(description) {
    let _this = this;

    _this.peerConnection.setLocalDescription(description, function() {
      let data = _this.dataObjectReporter.data;
      let sdpConnection = {
        sdp: description.sdp,
        type: description.type
      };

      data.connectionDescription = sdpConnection;
    }, _this._infoError);
  }

  _infoError(err) {
    console.error(err.toString(), err);
  }

  /**
   * This function is used to receive all changes did to dataObjectObjserver.
   * @param  {Function} callback callback function
   * @return {ChangeEvent}       properties and type of changes;
   */

  // onChange(callback) {
  //   let _this = this;
  //   _this._onChange = callback;
  // }

  /**
   * This function is used to handle the peer stream
   * @return {MediaStream}           WebRTC remote MediaStream retrieved by the Application
   */
  onAddStream(callback) {
    let _this = this;
    _this._onAddStream = callback;
  }

  /**
   * This function is used to receive requests to close an existing connection instance.
   * @param  {Function} callback callback function to handle with the disconnect
   * @return {DeleteEvent}       the DeleteEvent fired by the Syncher when the Connection is closed.
   */
  onDisconnect(callback) {
    let _this = this;
    _this._onDisconnect = callback;
  }

  /**
   * This function is used to accept an incoming connection request received by connection.onInvitation().
   * @param  {MediaStream}         stream     WebRTC local MediaStream retrieved by the Application
   * @return {<Promise> boolean}              It returns, as a Promise, true in case the connection is successfully accepted, false otherwise.
   */
  accept(stream) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      let syncher = _this._syncher;
      let remoteData = _this.dataObjectObserver.data;
      let remotePeer = remoteData.owner;
      _this.connectionObject = connection;
      _this.connectionObject.name = remoteData.name;
      _this.connectionObject.scheme = 'connection';
      _this.connectionObject.owner = remoteData.owner;
      _this.connectionObject.peer = remoteData.peer;
      _this.connectionObject.status = '';

      try {
        console.info('[Connector.ConnectionController ]------------------------ Syncher Create ---------------------- \n');
        syncher.create(_this._objectDescURL, [remotePeer], _this.connectionObject)
        .then(function(dataObjectReporter) {
          console.info('[Connector.ConnectionController ]2. Return the Data Object Reporter ', dataObjectReporter);
          _this.mediaStream = stream;
          _this.dataObjectReporter = dataObjectReporter;
          resolve(true);
        })
        .catch(function(reason) {
          console.error(reason);
          reject(false);
        });
      } catch (e) {
        reject('error accepting connection');
      }
    });
  }

  /**
   * This function is used to decline an incoming connection request received by connection.onInvitation().
   * @param  {int} reason               Integer decline reason that is compliant with RFC7231. If not present 400 is used. (optional)
   * @return {<Promise> boolean}        It returns, as a Promise, true in case the connection is successfully declined, false otherwise.
   */
  decline(reason) {
    // TODO: Optimize this process

    let _this = this;
    let declineReason = 400;
    if (reason) declineReason = reason;

    return new Promise(function(resolve, reject) {
      try {
        _this.connectionEvent.ack(declineReason);
        _this.disconnect();
        resolve(true);
      } catch (e) {
        console.error(e);
        reject(false);
      }
    });
  }


  /**
   * This function is used to close an existing connection instance.
   * @return {<Promise> boolean} It returns as a Promise true if successfully disconnected or false otherwise.
   */
  disconnect() {
    // TODO: Optimize this process

    let _this = this;
    console.info('[Connector.disconnect ] cheguei ao disconnect');

    return new Promise(function(resolve, reject) {
      try {
        let data;
        if (_this.dataObjectReporter) {
          data = _this.dataObjectReporter;
          console.info('[Connector.disconnect ] cheguei ao reporter');

          data.delete();
        }

        if (_this.dataObjectObserver) {
          data = _this.dataObjectObserver;
          console.info('[Connector.disconnect ] cheguei ao observer');

          data.delete();
        }

        _this._removeMediaStream();
        _this._clean(_this._connector._controllers, _this._remoteHyperty);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Disable Microfone
   * @param  {boolean} value status of microfone
   * @return {boolean}
   */
  disableAudio(value) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      try {
        let localStream = _this.peerConnection.getLocalStreams()[0];
        let audioTrack = localStream.getAudioTracks()[0];

        if (!value) {
          audioTrack.enabled = audioTrack.enabled ? false : true;
        } else {
          audioTrack.enabled = value;
        }
        resolve(audioTrack.enabled);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Disable video
   * @param  {boolean} value status of video
   * @return {boolean}
   */
  disableVideo(value) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      try {
        let localStream = _this.peerConnection.getLocalStreams()[0];
        let videoTrack = localStream.getVideoTracks()[0];

        if (!value) {
          videoTrack.enabled = videoTrack.enabled ? false : true;
        } else {
          videoTrack.enabled = value;
        }
        resolve(videoTrack.enabled);
      } catch (e) {
        reject(e);
      }
    });
  }

  mute(value) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      try {
        let remoteStream = _this.peerConnection.getRemoteStreams()[0];
        let audioTrack = remoteStream.getAudioTracks()[0];

        if (!value) {
          audioTrack.enabled = audioTrack.enabled ? false : true;
        } else {
          audioTrack.enabled = value;
        }
        resolve(audioTrack.enabled);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default ConnectionController;
