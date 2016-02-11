
exports.forSpine = function (SPINE) {

    var exports = {};

	var gun = SPINE.GUN(SPINE.config.gun.peer.url);

    var NS_PREFIX = SPINE.config.gun.namespacePrefix;
    
    function stripPrefix (ns) {
        if (!stripPrefix._re) {
            stripPrefix._re = new RegExp("^" + NS_PREFIX);
        }
        return ns.replace(stripPrefix._re, "");
    }


    function Collection (collectionName, recordNamespace) {
        var self = this;

        function stripRecordNamespace (ns) {
            if (!stripRecordNamespace._re) {
                stripRecordNamespace._re = new RegExp("^" + recordNamespace + "\\/");
            }
            return ns.replace(stripRecordNamespace._re, "");
        }

        var records = {};

        var ref = gun.get(NS_PREFIX + collectionName);

        self.record = {
            create: function (id, data) {
                if (typeof data === "undefined") {
                    data = id;
                    id = undefined;
                }
                id = id || SPINE.UTIL.makeId();
                var ns = NS_PREFIX + recordNamespace + "/" + id;
                ref.path(ns).put(data || {}).key(ns);
                return stripRecordNamespace(stripPrefix(ns));
            },
            get: function (id) {
                // TODO: Optionally proxy record so we can monitor changes and persist them.
                return records[id];
            },
            set: function (id, property, value) {
                var ns = NS_PREFIX + recordNamespace + "/" + id;
console.log("SET", ns, property, value);
                ref.path(ns).path(property).put(value);
            },
            has: function (id) {
                return new SPINE.Promise(function (resolve, reject) {
                    function done (found) {
                        if (done._done) return;
                        done._done = true;
                        clearTimeout(timeout);
                        return resolve(found);
                    }
                    // When the 'collectionName' does not exist we never get called
                    // so we have to set a timeout.
                    var timeout = setTimeout(function () {
                        return done(false);
                    // TODO: Make timeout configurable.
                    }, 5000);
                    var ns = NS_PREFIX + recordNamespace + "/" + id;
                    return ref.path(ns).not(function (key) {
                        return done(false);
                    }).on(function () {
                        return done(true);
                    });
                });
            }
        };
        self.records = {
            getAll: function () {
                // TODO: Optionally proxy records so we can monitor changes and persist them.
                return records;
            }
        }

        SPINE.RIOT.observable(self);

        function notifyChanged () {
            if (!notifyChanged.__debounced) {
                notifyChanged.__debounced = SPINE.LODASH.debounce(function () {
                    self.trigger("changed");
                }, 50);
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
	        collections[namespace] = new Collection(namespace, namespace);
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
        has: function (namespace, id) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.has(id);
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
