// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

// Internals
import { communicationObject, CommunicationStatus, communicationChildren } from './communication';
import ChatController from './ChatController';

class GroupChatManager {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    let syncher = new Syncher(hypertyURL, bus, configuration);
    let domain = divideURL(hypertyURL).domain;
    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Communication';
    _this._reportersControllers = {};
    _this._observersControllers = {};
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._syncher = syncher;
    _this._domain = domain;
    _this.discovery = discovery;
    _this.identityManager = identityManager;
    _this.search = new Search(discovery, identityManager);
    _this.communicationObject = communicationObject;
    _this.communicationChildren = communicationChildren;

    syncher.resumeReporters({store: true}).then((reporters) => {
       let reportersList = Object.keys(reporters);

       if (reportersList.length  > 0) {
         Object.keys(reporters).forEach((dataObjectReporterURL) => {
           console.log('[GroupChatManager].syncher.resumeReporters ', dataObjectReporterURL);

           // create a new chatController but first get identity
           _this.search.myIdentity().then((identity) => {
             let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, identity, _this);
             chatController.dataObjectReporter = reporters[dataObjectReporterURL];

             // Save the chat controllers by dataObjectReporterURL
             this._reportersControllers[dataObjectReporterURL] = chatController;
             _this._resumeInterworking(chatController.dataObjectReporter);

             if (_this._onResumeReporter) _this._onResumeReporter(this._reportersControllers);
           });
         });
       }
     }).catch((reason) => {
       console.info('Resume Reporter | ', reason);
     });

     syncher.resumeObservers({store: true}).then((observers) => {
       let observersList = Object.keys(observers);

       if (observersList.length  > 0) {
         observersList.forEach((dataObjectObserverURL) => {
           console.log('[GroupChatManager].syncher.resumeObservers ', dataObjectObserverURL);

           // create a new chatController but first get indentity
           this.search.myIdentity().then((identity) => {
             let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, identity, _this);
             chatController.dataObjectObserver = observers[dataObjectObserverURL];

             // Save the chat controllers by dataObjectReporterURL
             this._observersControllers[dataObjectObserverURL] = chatController;
             if (_this._onResumeObserver) _this._onResumeObserver(this._observersControllers);
           });
         });
       }
     }).catch((reason) => {
       console.info('[GroupChatManager] Resume Observer | ', reason);
     });

    syncher.onNotification(function(event) {
      console.info("Notification event: ", event);
      if (event.type === 'create') {
        event.ack(100);

        if (_this._onInvitation) { _this._onInvitation(event); }
      }

      if (event.type === 'delete') {
        event.ack(200);

        _this._observersControllers[event.url].closeEvent = event;
        delete _this._observersControllers[event.url];
        _this._observersControllers.closeEvent = event;
        _this.communicationObject = communicationObject;

        for (let url in this._reportersControllers)
          this._reportersControllers[url].closeEvent(event);

        for (let url in this._observersControllers)
          this._observersControllers[url].closeEvent(event);
      }
    });
  }

  /**
   * This function is used to resume interworking Stubs for participants from legacy chat services
   * @param  {Communication}              communication Communication data object
   */
  _resumeInterworking(communication) {
    let _this = this;

    if (communication.data.participants) {
      let participants = communication.data.participants;
      let objectUrl = communication.url;
      let schemaUrl = communication.schema;
      let name = communication.name;

      Object.keys(participants).forEach((participant) => {
        let user = participants[participant].identity.userURL.split('://');

        if (user[0] !== 'user') {
          console.log('[GroupChatManager._resumeInterworking for] ', participant);
          user = user[0] + '://' + user[1].split('/')[1];

          let msg = {
              type: 'create', from: _this._hypertyURL, to: user,
              body: { resource: objectUrl, schema: schemaUrl, value: communication.metadata }
            };

          _this._bus.postMessage(msg, () => {
          });
        }
      });
    }
  }

  /**
   * This function is used to create a new Group Chat providing the name and the identifiers of users to be invited.
   * @param  {String}                     name  Is a string to identify the Group Chat
   * @param  {Array}                      users Array of users to be invited to join the Group Chat. Users are identified with reTHINK User URL, like this format user://<ipddomain>/<user-identifier>
   * @return {Promise}                    A ChatController object as a Promise.
   */
  create(name, users, domains) {
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      // Create owner participant
      _this.communicationObject = communicationObject;
      _this.communicationObject.cseq = 1;
      _this.communicationObject.startingTime = new Date().toJSON();
      _this.communicationObject.status =  CommunicationStatus.OPEN;
      let myIdentity;

      _this.search.myIdentity().then((identity) => {
        // Add my identity
        myIdentity = identity;
        _this.communicationObject.participants[identity.username] = { identity: myIdentity };

        console.info('[GroupChatManager] searching ' + users + ' at domain ' + domains);
        let usersSearch = _this.search.users(users, domains, ['comm'], ['chat']);
        return usersSearch;
      }).then((hypertiesIDs) => {
        let selectedHyperties = hypertiesIDs.map((hyperty) => {
          return hyperty.hypertyID;
        });

        console.info('[GroupChatManager] ---------------------- Syncher Create ---------------------- \n');
        console.info('[GroupChatManager] Founded Hyperties: !!! ', selectedHyperties);

        return syncher.create(_this._objectDescURL, selectedHyperties, _this.communicationObject, true, false, name, {}, {resources: ['chat']});
      }).catch((reason) => {
        console.log('[GroupChatManager] MyIdentity Error:', reason);
        return reject(reason);
      }).then(function(dataObjectReporter) {
        let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, myIdentity, _this);

        chatController.dataObjectReporter = dataObjectReporter;
        _this._reportersControllers[dataObjectReporter.url] = chatController;
        resolve(chatController);
      }).catch(function(reason) {
        reject(reason);
      });
    });
  }

  /**
   * This function is used to handle notifications about incoming invitations to join a Group Chat.
   * @param  {Function} CreateEvent The CreateEvent fired by the Syncher when an invitaion is received
   */
  onInvitation(callback) {
    let _this = this;
    _this._onInvitation = callback;
  }


  onResume(callback) {
    let _this = this;
    _this._onResume = callback;
  }

  /**
   * This function is used to join a Group Chat.
   * @param  {URL.CommunicationURL}             invitationURL  The Communication URL of the Group Chat to join that is provided in the invitation event
   * @return {Promise}                          It returns the ChatController object as a Promise
   */
  join(invitationURL) {
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {
      let myIdentity;
      console.info('[GroupChatManager] ------------------------ Syncher subscribe ---------------------- \n');
      console.info('invitationURL', invitationURL);
      _this.search.myIdentity().then((identity) => {
          myIdentity = identity;
          return syncher.subscribe(_this._objectDescURL, invitationURL, true, false);
      }).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);
        let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, myIdentity, _this);
        resolve(chatController);
        chatController.dataObjectObserver = dataObjectObserver;
        _this._observersControllers[dataObjectObserver.url] = chatController;
      }).catch(function(reason) {
        reject(reason);
      });
    });
  }

  get communicationObjectID() {
    let _this = this;
    return _this.communicationObject.id;
  }

  get communicationObjectName() {
    let _this = this;
    return _this.communicationObject.name;
  }
}

export default function activate(hypertyURL, bus, configuration) {
  return {
    name: 'GroupChatManager',
    instance: new GroupChatManager(hypertyURL, bus, configuration)
  };
}
