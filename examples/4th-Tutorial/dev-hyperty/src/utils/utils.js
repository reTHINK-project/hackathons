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

// jshint browser:true, jquery: true
// jshint varstmt: true
/* global Handlebars */

/**
 * Support module with some functions will be useful
 * @module utils
 */

/**
 * @typedef divideURL
 * @type Object
 * @property {string} type The type of URL
 * @property {string} domain The domain of URL
 * @property {string} identity The identity of URL
 */

/**
 * Divide an url in type, domain and identity
 * @param  {URL.URL} url - url address
 * @return {divideURL} the result of divideURL
 */
export function divideURL(url) {

  if (!url) throw Error('URL is needed to split');

	function recurse(value) {
		const regex = /([a-zA-Z-]*)(:\/\/(?:\.)?|:)([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi;
    const subst = '$1,$3,$4';
	  let parts = value.replace(regex, subst).split(',');
		return parts;
	}

	let parts = recurse(url);

  // If the url has no scheme
  if (parts[0] === url && !parts[0].includes('@')) {

    let result = {
      type: "",
      domain: url,
      identity: ""
    };

    console.error('[DivideURL] DivideURL don\'t support url without scheme. Please review your url address', url);

    return result;
  }

	// check if the url has the scheme and includes an @
	if (parts[0] === url && parts[0].includes('@')) {
		let scheme = parts[0] === url ? 'smtp' : parts[0];
		parts = recurse(scheme + '://' + parts[0]);
	}

	// if the domain includes an @, divide it to domain and identity respectively
	if (parts[1].includes('@')) {
		parts[2] = parts[0] + '://' + parts[1];
		parts[1] = parts[1].substr(parts[1].indexOf('@') + 1)
    } 	/*else if (parts[2].includes('/')) {
    parts[2] = parts[2].substr(parts[2].lastIndexOf('/')+1);
  }*/

  let result = {
    type: parts[0],
    domain: parts[1],
    identity: parts[2]
  };

  return result;

}

/**
 * Make a COPY of the original data
 * @param  {Object}  obj - object to be cloned
 * @return {Object}
 */
export function deepClone(obj) {
  //TODO: simple but inefficient JSON deep clone...
  if (obj) return JSON.parse(JSON.stringify(obj));
}

/**
 * Get WebRTC API resources
 * @param  {object}     options Object containing the information that resources will be used (camera, mic, resolution, etc);
 * @return {Promise}
 */
export function getUserMedia(constraints) {

  return new Promise(function(resolve, reject) {

    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(mediaStream) {
        resolve(mediaStream);
      })
      .catch(function(reason) {
        reject(reason);
      });
  });
}
