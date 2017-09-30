// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';

// Internals
import ConnectionController from './ConnectionController';
import { connection } from './connection';
import Search from '../utils/Search';

/**
 *
 */
class Connector {

  /**
  * Create a new Hyperty Connector
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._configuration = configuration;
    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';
    _this._controllers = {};
    _this.connectionObject = connection;
    _this.discovery = discovery;
    _this.identityManager = identityManager;
    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    _this.search = new Search(discovery, identityManager);
    let syncher = new Syncher(hypertyURL, bus, configuration);

    syncher.onNotification((event) => {
      let _this = this;
      console.log('On Notification: ', event);

      if (event.type === 'create') {
        event.ack(200);

        if (_this._controllers[event.from]) {
          _this._autoSubscribe(event);
        } else {
          _this._autoAccept(event);
        }
      }

      if (event.type === 'delete') {
        event.ack(200);

        if (_this._controllers) {
          Object.keys(_this._controllers).forEach((controller) => {
            _this._controllers[controller].deleteEvent = event;
            //delete _this._controllers[controller];
          });
        }
      }
    });
    _this._syncher = syncher;
  }


  _removeController(controllers, controller) {
    let _this = this;

    if (controllers)
      delete controllers[controller];
  }

  _autoSubscribe(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Subscribe) ---------------- \n');
    syncher.subscribe(_this._objectDescURL, event.url).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);
      _this._controllers[event.from].dataObjectObserver = dataObjectObserver;
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  _autoAccept(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Accept) ---------------- \n');
    syncher.subscribe(_this._objectDescURL, event.url ).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);
      let connectionController = new ConnectionController(syncher, _this._domain, _this._configuration,  _this._removeController, _this, event.from);
      connectionController.connectionEvent = event;
      connectionController.dataObjectObserver = dataObjectObserver;
      _this._controllers[event.from] = connectionController;

      // TODO: user object with {identity: event.identity, assertedIdentity: assertedIdentity}
      if (_this._onInvitation) _this._onInvitation(connectionController, event.identity.userProfile);
      console.info('------------------------ END ---------------------- \n');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  /**
   * This function is used to create a new connection providing the identifier of the user to be notified.
   * @param  {URL.UserURL}        userURL      user to be invited that is identified with reTHINK User URL.
   * @param  {MediaStream}        stream       WebRTC local MediaStream retrieved by the Application
   * @param  {string}             name         is a string to identify the connection.
   * @return {Promise}                         A ConnectionController object as a Promise.
   */
  connect(userURL, stream, name, domain) {
    // TODO: Pass argument options as a stream, because is specific of implementation;
    // TODO: CHange the hypertyURL for a list of URLS
    let _this = this;
    let syncher = _this._syncher;
    let scheme = ['connection'];
    let resource = ['audio', 'video'];

    return new Promise(function(resolve, reject) {

      let connectionController;
      let selectedHyperty;
      console.info('------------------------ Syncher Create ----------------------  \n');

      _this.search.myIdentity().then(function(identity) {
        console.log('connector searching: ', [userURL], `at domain `, [domain]);
        console.log('identity: ', identity, _this.connectionObject);

        return _this.search.users([userURL], [domain], scheme, resource);
      })
      .then(function(hypertiesIDs) {

        selectedHyperty = hypertiesIDs[0].hypertyID;
        console.info('Only support communication one to one, selected hyperty: ', selectedHyperty);
        let connectionName = 'Connection';
        if (name)
          connectionName = name;

        // Initial data
        _this.connectionObject.name = connectionName;
        _this.connectionObject.scheme = 'connection';
        _this.connectionObject.owner = _this._hypertyURL;
        _this.connectionObject.peer = selectedHyperty;
        _this.connectionObject.status = '';

        return syncher.create(_this._objectDescURL, [selectedHyperty], _this.connectionObject);
      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      })
      .then(function(dataObjectReporter) {
        console.info('1. Return Create Data Object Reporter', dataObjectReporter);
        connectionController = new ConnectionController(syncher, _this._domain, _this._configuration, _this._removeController, _this, selectedHyperty);
        connectionController.mediaStream = stream;
        connectionController.dataObjectReporter = dataObjectReporter;
        _this._controllers[selectedHyperty] = connectionController;
        resolve(connectionController);
        console.info('--------------------------- END --------------------------- \n');
      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      });
    });
  }

  /**
   * This function is used to handle notifications about incoming requests to create a new connection.
   * @param  {Function} callback
   */
  onInvitation(callback) {
    let _this = this;
    _this._onInvitation = callback;
  }
}

/**
 * Function will activate the hyperty on the runtime
 * @param  {URL.URL} hypertyURL   url which identifies the hyperty
 * @param  {MiniBus} bus          Minibus used to make the communication between hyperty and runtime;
 * @param  {object} configuration configuration
 */
export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'Connector',
    instance: new Connector(hypertyURL, bus, configuration)
  };
}
