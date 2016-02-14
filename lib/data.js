
exports.forSpine = function (SPINE) {

    var exports = {};


/*

    var remotePouchCollection = new SPINE.POUCHFIELD.Collection();
*/


    const MODE = "SYNC_GUN_TO_POUCH";
//    const MODE = "USE_POUCH";


console.log("SPINE.config", SPINE.config);

    const POSTGRES = require("./postgres-data").forSpine(SPINE);


    if (MODE === "USE_POUCH") {

        function usePouch () {

            var collections = {};
        
        	function getCollection (namespace) {
        	    if (!collections[namespace]) {
console.log('from collection', SPINE.config.pouchdbfield.namespacePrefix + namespace);        	        

//        	        collections[namespace] = new SPINE.POUCHFIELD.Collection(
        	        collections[namespace] = new POSTGRES.Collection(
        	            SPINE.config.pouchdbfield.peer.url,
        	            SPINE.config.pouchdbfield.namespacePrefix + namespace);
/*
        	        collections[namespace].syncFrom(
        	            SPINE.config.pouchdbfield.peer.url,
            	        SPINE.config.pouchdbfield.namespacePrefix + namespace
        	        );
*/
        	    }
        	    return collections[namespace];
        	}
    
            exports.data = {
                getAll: function (namespace) {
                    // TODO: Issue promise that resolves once data comes back.
                    return getCollection(namespace).records.getAll();
                },
                get: function (namespace, id) {
                    // TODO: Issue promise that resolves once data comes back.
                    return getCollection(namespace).record.get(id);
                },
                has: function (namespace, id, callback) {
                    // TODO: Issue promise that resolves once data comes back.
                    return getCollection(namespace).record.has(id, callback);
                },
                create: function (namespace, id, data) {
                    // TODO: Issue promise that resolves once data comes back.
                    return getCollection(namespace).record.create(id, data);
                },
                set: function (namespace, id, property, value) {
                    // TODO: Issue promise that resolves once data comes back.
                    return getCollection(namespace).record.set(id, property, value);
                },
                watch: function (namespace, onChange) {

                    var collection = getCollection(namespace);
        
                    collection.on("changed", function () {

console.log("CHANGED!!", namespace);

                        onChange();
                    });
                    
                    // We issue an on-change to force a getAll() in the listening code.
                    onChange();
        
            		return function unwatch () {
                        // TODO: Implement.    		    
            		};
                }
            };
        }
        usePouch();
        

        return exports;
    }


	var gun = SPINE.GUN(SPINE.config.gun.peer.url);

    var NS_PREFIX = SPINE.config.gun.namespacePrefix;

    function stripPrefix (ns) {
        if (!stripPrefix._re) {
            stripPrefix._re = new RegExp("^" + NS_PREFIX);
        }
        return ns.replace(stripPrefix._re, "");
    }


    function Collection (recordNamespace) {
        var self = this;

        function stripRecordNamespace (ns) {
            if (!stripRecordNamespace._re) {
                stripRecordNamespace._re = new RegExp("^" + recordNamespace + "\\/");
            }
            return ns.replace(stripRecordNamespace._re, "");
        }

        var records = {};


    
        if (MODE === "SYNC_GUN_TO_POUCH") {

/*
            var localPouchCollection = new SPINE.POUCHFIELD.Collection(
                SPINE.config.pouchdbfield.namespacePrefix + recordNamespace
            );
            var remotePouchUrl = SPINE.config.pouchdbfield.peer.url + "/" + SPINE.config.pouchdbfield.namespacePrefix + recordNamespace;
//console.log("POUCHFIELD", remotePouchUrl, remotePouchCollection);


            var sync = SPINE.POUCHFIELD.POUCHDB.sync(
                SPINE.config.pouchdbfield.namespacePrefix + recordNamespace,
                remotePouchUrl,
                {
                  live: true,
                  retry: true
                }
            ).on('change', function (info) {
console.log("[rep] change", info);
              // handle change
            }).on('paused', function () {
console.log("[rep] paused");
              // replication paused (e.g. user went offline)
            }).on('active', function () {
              // replicate resumed (e.g. user went back online)
console.log("[rep] active");
            }).on('denied', function (info) {
              // a document failed to replicate (e.g. due to permissions)
console.log("[rep] denied", info);
            }).on('complete', function (info) {
              // handle complete
console.log("[rep] complete", info);
            }).on('error', function (err) {
              // handle error
console.log("[rep] error", err);
            });
*/

            var localPouchCollection = new POSTGRES.Collection(
	            SPINE.config.pouchdbfield.peer.url,
	            SPINE.config.pouchdbfield.namespacePrefix + recordNamespace
	        );
        }



        var ref = gun.get(NS_PREFIX + recordNamespace);
        ref.key(NS_PREFIX + recordNamespace);

        self.record = {
            create: function (id, data) {
                if (typeof data === "undefined") {
                    data = id;
                    id = undefined;
                }
                id = id || SPINE.UTIL.makeId();
                var ns = NS_PREFIX + recordNamespace + "/" + id;
                ref.path(ns).put(data || {}).key(ns);
                return SPINE.Promise.resolve(stripRecordNamespace(stripPrefix(ns)));
            },
            get: function (id) {
                // TODO: Optionally proxy record so we can monitor changes and persist them.
                return SPINE.Promise.resolve(records[id]);
            },
            set: function (id, property, value) {
                var ns = NS_PREFIX + recordNamespace + "/" + id;
console.log("SET", ns, property, value);
                ref.path(ns).path(property).put(value);
                return SPINE.Promise.resolve();
            },
            has: function (id) {
                return new SPINE.Promise(function (resolve, reject) {
                    if (records[id]) {
                        return resolve(true);
                    }
                    function done (found) {
                        if (done._done) return;
                        done._done = true;
                        clearTimeout(timeout);
                        return resolve(found);
                    }
                    // When the 'recordNamespace' does not exist we never get called
                    // so we have to set a timeout.
                    var timeout = setTimeout(function () {
                        return done(false);
                    // TODO: Make timeout configurable.
                    }, 5000);
                    var ns = NS_PREFIX + recordNamespace + "/" + id;
                    ref.path(ns).not(function (key) {
                        return done(false);
                    }).on(function () {
                        return done(true);
                    });
                });
            }
        };
        self.records = {
            getAll: function getAll () {
                if (getAll._running) {
                    return getAll._running;
                }
                // TODO: Optionally proxy records so we can monitor changes and persist them.
                return (getAll._running = SPINE.Promise.try(function () {

                    if (MODE === "SYNC_GUN_TO_POUCH") {
                        return SPINE.Promise.all(Object.keys(records).map(function (id) {
                            return localPouchCollection.record.has(id).then(function (found) {
                                if (found) {
                                    return localPouchCollection.record.set(id, records[id]);
                                } else {
                                    return localPouchCollection.record.create(id, records[id]);
                                }
                            });
                        }));
                    }
                    return null;
                })).then(function () {
                    delete getAll._running;
                    return records;
                });
            }
        }

        SPINE.RIOT.observable(self);

        function notifyChanged () {
            if (!notifyChanged.__debounced) {
                notifyChanged.__debounced = SPINE.LODASH.debounce(function () {
                    self.trigger("changed");
                }, 100);
            }
            notifyChanged.__debounced();
        }

        ref.map(function (node, id) {
            delete node._;
            records[stripRecordNamespace(stripPrefix(id))] = node;
            notifyChanged();
        }, true);
    }


    var collections = {};

	function getCollection (namespace) {
	    if (!collections[namespace]) {
	        collections[namespace] = new Collection(namespace);
	    }
	    return collections[namespace];
	}

    exports.data = {
        getAll: function (namespace) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).records.getAll();
        },
        get: function (namespace, id) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.get(id);
        },
        has: function (namespace, id, callback) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.has(id, callback);
        },
        create: function (namespace, id, data) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.create(id, data);
        },
        set: function (namespace, id, property, value) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.set(id, property, value);
        },
        watch: function (namespace, onChange) {

            var collection = getCollection(namespace);

            collection.on("changed", function () {
                onChange();
            });

    		return function unwatch () {
                // TODO: Implement.    		    
    		};
        }
    };

    return exports;
}
