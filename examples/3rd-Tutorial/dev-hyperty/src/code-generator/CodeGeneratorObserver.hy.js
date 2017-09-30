/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter';

/**
* Hyperty Code Generator Observer API - reTHINK Tester Event
* @author Bernardo Graça [bernardo.marquesg@gmail.com]
* @version 0.2.0
*/

class CodeGeneratorObserver extends EventEmitter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    super();

    let _this = this;
    let syncher = new Syncher(hypertyURL, bus, configuration);
    let domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/CodeGeneratorDataSchema';
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._syncher = syncher;
    _this._domain = domain;

    syncher.onNotification(function(event) {
      _this._onNotification(event);
    });

  }


  _onNotification(event) {
    let _this = this;

    // Acknowledge reporter about the Invitation was received
    event.ack();

    // Subscribe Code Object
    _this._syncher.subscribe(_this._objectDescURL, event.url, true, false)
    .then(function(codeGeneratorObserver) {
      // Code Object was subscribed
      console.info("[codeGeneratorObserver.subscribe]: ", codeGeneratorObserver);

      _this._changes(codeGeneratorObserver);

    }).catch(function(reason) {
      console.error(reason);
    });
  }


  _changes(codeGeneratorObserver) {
    codeGeneratorObserver.onChange('*', (event) => {

      // CodeGenerator Object was changed
      console.info('[codeGeneratorObserver.onChange]', event);

      // lets notify the App about the change
      this.trigger('code', codeGeneratorObserver.data);
    });
  }

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'CodeGeneratorObserver',
    instance: new CodeGeneratorObserver(hypertyURL, bus, configuration)
  };
}
