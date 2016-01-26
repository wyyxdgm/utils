/*service for deepExtend*/
function genDefaultByValue(objectSource) {
	if ("object" === typeof objectSource) {
		if (objectSource === null) {
			return null;
		} else if (objectSource instanceof Array) {
			return [];
		} else {
			return {};
		}
	} else return objectSource;
}

/***
 * a function to copy peroperties from one object form another object recursively,
 * and the same type of perperty will be overrided.
 *
 * @params objectTarget : the object to be appended 
 * @params objectSource : the source object that will be copyed from
 * @params replaceIfDifferentType : set if to replace the value
 * @params key : chose the property identifyed by the key to append
 * @return none
 */

module.exports.deepExtend = deepExtend;

function deepExtend(objectTarget, objectSource, replaceIfDifferentType, key) {
	if (objectSource) {
		if (key) {
			if (typeof objectSource[key] !== typeof objectTarget[key] || objectSource[key] instanceof Array !== objectTarget[key] instanceof Array) {
				if (replaceIfDifferentType) {
					objectTarget[key] = objectSource[key]
				}
				return;
			}
			objectSource = objectSource[key];
			if (typeof objectSource === "object") {
				if (objectSource instanceof Array) { //array
					for (var i in objectSource) {
						if (!objectTarget[key][i]) objectTarget[key].push(genDefaultByValue(objectSource[i]));
						deepExtend(objectTarget[key], objectSource, replaceIfDifferentType, i);
					}
				} else if (objectSource === null) { //null
					objectTarget[key] = null;
				} else { //object
					for (var keyInObj in objectSource) {
						if (!objectTarget[key][keyInObj]) objectTarget[key][keyInObj] = genDefaultByValue(objectSource[keyInObj]);
						deepExtend(objectTarget[key], objectSource, replaceIfDifferentType, keyInObj);
					}
				}
			} else { // simple value
				objectTarget[key] = objectSource;
			}
		} else {
			if (!objectTarget) objectTarget = {};
			if (typeof objectSource === "object") {
				if (objectSource instanceof Array) { //array
					for (var i in objectSource) {
						if (!objectTarget[i]) objectTarget.push(genDefaultByValue(objectSource[i]));
						deepExtend(objectTarget, objectSource, replaceIfDifferentType, i);
					}
				} else if (objectSource === null) { //null
					objectTarget = null;
				} else { //object
					for (var key in objectSource) {
						if (!objectTarget[key]) objectTarget[key] = genDefaultByValue(objectSource[key]);
						deepExtend(objectTarget, objectSource, replaceIfDifferentType, key);
					}
				}
			} else { // simple value
				objectTarget = objectSource;
			}
		}
	}
}