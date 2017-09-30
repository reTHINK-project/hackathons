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

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

// Internals
import code from './code';

/**
* Hyperty Code Generator Reporter API - reTHINK Tester Event
* @author Bernardo Graça [bernardo.marquesg@gmail.com]
* @version 0.2.0
*/
class CodeGeneratorReporter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    let syncher = new Syncher(hypertyURL, bus, configuration);
    let domain = divideURL(hypertyURL).domain;
    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/CodeGeneratorDataSchema';
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._syncher = syncher;
    _this._domain = domain;
    _this.discovery = discovery;
    _this.identityManager = identityManager;
    _this.search = new Search(discovery, identityManager);
    _this.code = code;
  }


  /**
   * This function is used to create a new Code Generator providing the email of the users to be invited.
   * @return {Promise}             It returns code as a Promise
   */
  create(emails) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      _this.search.users(emails, [_this._domain], [], ['code'])
      .then((hypertiesResult) => {
        let hypertiesIDs = hypertiesResult.map((hyperty) => {
          return hyperty.hypertyID;
        });
        console.log('[CodeGeneratorReporter] Hyperties IDs Result->', hypertiesIDs);

        console.info('[CodeGenerator] ------------------------ Syncher Create ---------------------- \n');
        _this._syncher.create(_this._objectDescURL, hypertiesIDs, _this.code, false, false, 'myCode', null)
        .then((codeGenerator) => {
          _this.codeGenerator = codeGenerator;
          _this._onSubscription(codeGenerator);

          resolve(codeGenerator);
        }).catch(function(reason) {
          reject(reason);
        });
      });
    });
  }


  /**
   * This function is used to request a code.
   * @param  {String} name         The name of each team that it will be converted into some code
   * @return {Promise}             It returns code as a Promise
   */
  generateCode(name) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      if(name === '' || name === undefined)
        reject('It must be a valid string...')

      _this.codeGenerator.data.name = '';
      _this.codeGenerator.data.code = '';
      console.log('[CodeGeneratorReporter] Name ->', name);

      console.info('[CodeGenerator] ------------------------ Generating code ---------------------- \n');
      _this.codeGenerator.data.name = name;
      //Code and a Timestamp
      let date = new Date()
      _this.codeGenerator.data.code = _this._hashCode(name) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

      resolve(_this.codeGenerator.data.code);
    });
  }


  _onSubscription(codeGenerator){
    codeGenerator.onSubscription((event) => {
      console.info('[CodeGeneratorReporter._onSubscription] accepting: ', event);
      event.accept();
    });
  }


  /**
   * This function is used to generate a code.
   */
   _hashCode(name) {
     var hash = 0;
     var i;
     var char;
     if (name.length == 0) return hash;
     for (i = 0; i < name.length; i++) {
         char = name.charCodeAt(i);
         hash = ((hash<<5)-hash)+char;
         hash = hash & hash; // Convert to 32bit integer
     }
     console.info('[CodeGeneratorReporter.hashCode] Code: ', hash);
     return hash;
   }

}


export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'CodeGeneratorReporter',
    instance: new CodeGeneratorReporter(hypertyURL, bus, configuration)
  };
}
