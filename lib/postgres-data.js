
exports.forSpine = function (SPINE) {
    
    var exports = {};

    var Collection = exports.Collection = function (url, recordNamespace) {
        var self = this;
        
        if (typeof recordNamespace === "undefined") {
            recordNamespace = url;
            url = "";
        } else {
            url += "/";
        }
        
        recordNamespace = recordNamespace.replace(/\//g, "_");

        function call (options) {
            return new SPINE.Promise(function (resolve, reject) {
                options.table = recordNamespace;
                SPINE.$.ajax({
                    type: "POST",
                    url: SPINE.config.baseUrl + "/data",
                    data: JSON.stringify(options),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {

console.log("RESPONSE", options, data);
                        
                        return resolve(data);
                    },
                    failure: function (err) {
                        return reject(err);
                    }
                });
            });
        }


        self.record = {
            create: function (id, data) {
                if (typeof data === "undefined") {
                    data = id;
                    id = undefined;
                }
                return call({
                    method: "create",
                    id: id || SPINE.UUID.v4(),
                    data: data
                }).then(function (result) {
                    notifyChanged();
                    return result;
                });
            },
            get: function (id) {
                return call({
                    method: "get",
                    id: id
                });
            },
            set: function (id, property, value) {
                return call({
                    method: "get",
                    id: id
                }).then(function(doc) {
                    var data = doc;
                    if (typeof property === "string" && typeof value !== "undefined") {
                        data[property] = value;
                    } else {
                        Object.keys(property).forEach(function (name) {
                            data[name] = property[name];
                        });
                    }
                    return call({
                        method: "update",
                        id: data.id,
                        data: data
                    }).then(function (result) {
                        notifyChanged();
                        return result;
                    });
                });
            },
            has: function (id) {
                return call({
                    method: "has",
                    id: id
                });
            }
        };
        self.records = {
            getAll: function getAll () {
                if (getAll._running) {
                    return getAll._running;
                }
                return (getAll._running = call({
                    method: "all"
                })).then(function (result) {
                    delete getAll._running;
                    return result;
                });
            },
            where: function where (query) {
                return call({
                    method: "where",
                    query: query
                });
            }
        }

        function notifyChanged () {
            if (!notifyChanged.__debounced) {
                notifyChanged.__debounced = SPINE.LODASH.debounce(function () {

console.log("emit change");

                    self.emit("changed");
                }, 100);
            }
console.log("trigger change");
            notifyChanged.__debounced();
        }

        // TODO: Implement change watching from server.
/*
        db.changes({
            since: 'now',
            live: true,
            include_docs: false
        }).on('change', function(info) {
            notifyChanged();
        });
*/
    }
    Collection.prototype = Object.create(SPINE.EVENTS.EventEmitter.prototype);


    var collections = {};

	function getCollection (namespace) {
	    if (!collections[namespace]) {
	        collections[namespace] = new Collection(namespace);
	    }
	    return collections[namespace];
	}

    Collection.getAll = function (namespace) {
        return getCollection(namespace).records.getAll();
    },
    Collection.where = function (namespace, query) {
        return getCollection(namespace).records.where(query);
    },
    Collection.get = function (namespace, id) {
        return getCollection(namespace).record.get(id);
    },
    Collection.has = function (namespace, id) {
        return getCollection(namespace).record.has(id);
    },
    Collection.create = function (namespace, id, data) {
        return getCollection(namespace).record.create(id, data);
    },
    Collection.set = function (namespace, id, property, value) {
        return getCollection(namespace).record.set(id, property, value);
    },
    Collection.watch = function (namespace, onChange) {
        var collection = getCollection(namespace);
        function changed () {
            onChange();
        }
        collection.on("changed", changed);
		return function unwatch () {
            collection.off("changed", changed);
		};
    }
    return exports;   
}

