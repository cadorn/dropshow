
exports.forSpine = function (SPINE) {

    var exports = {};


	var gun = window.Gun(location.origin + '/gunshow/gun');

    
    const NS_PREFIX = "sub8";
    
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
            create: function (data) {
                var id = SPINE.UTIL.makeId();
                var ns = NS_PREFIX + recordNamespace + "/" + id;
                ref.path(ns).put(data || {}).key(ns);
                return ns;
            },
            get: function (id) {
                // TODO: Optionally proxy record so we can monitor changes and persist them.
                return records[id];
            },
            set: function (id, property, value) {
                var ns = NS_PREFIX + recordNamespace + "/" + id;

console.log("SET VALUE", value);

                ref.path(ns).path(property).put(value);
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
        create: function (namespace, data) {
            // TODO: Issue promise that resolves once data comes back.
            return getCollection(namespace).record.create(data);
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
