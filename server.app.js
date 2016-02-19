
const PATH = require("path");
const FS = require("fs-extra");
const EXPRESS = require('express');
const GUN = require('../gunfield/node_modules/gun');
const SEND = require("send");
const BODY_PARSER = require('body-parser');
const POUCHFIELD = require("../pouchfield/server.app");

const DATA = require("./lib/data");


exports.app = function (options) {

    if (!options.s3.secret) {
        throw new Error("Missing secret config credentials! Load them into your environment first.");
    }
    
    var gun = null;
/*
    var gun = GUN({
    //	file: 'data.json',
    	s3: {
    	    prefix: "2016-02-gunfield",
    	    prenode: "/nodes/",
    		key: options.s3.key,
    		secret: options.s3.secret,
    		bucket: options.s3.bucket,
    		region: options.s3.region
    	},
    	ws: options.ws || {}
    });
*/
    var cloudinary = require('cloudinary');
    cloudinary.config({ 
        cloud_name: options.cloudinary.cloud_name,
        api_key: options.cloudinary.api_key,
        api_secret: options.cloudinary.api_secret
    });


/*
    function syncLibrary (config) {

        console.log("Trigger library sync");

        if (!syncLibrary._dataInstance) {
            var data = DATA.forSpine({
                GUN: require('../gunfield/node_modules/gun/gun.js'),
                UTIL: require("./lib/util"),
                RIOT: require("riot"),
                LODASH: require("lodash"),
                Promise: require("bluebird"),
                config: config
            });
            syncLibrary._dataInstance = data.data;

            var cloudinary = require('cloudinary');
            cloudinary.config({ 
                cloud_name: options.cloudinary.cloud_name,
                api_key: options.cloudinary.api_key,
                api_secret: options.cloudinary.api_secret
            });
            syncLibrary._cloudinaryInstance = cloudinary;
            
            var syncing = false;
            
            syncLibrary._sync = function () {
                
                if (syncing) return;
                syncing = true;

                var ns = "library/images/all";
                var data = syncLibrary._dataInstance;
                var cloudinary = syncLibrary._cloudinaryInstance;

        }
        return syncLibrary._sync();
    }
*/

    var app = EXPRESS();

/*
    cloudinary.api.resources(function (result) {

        var deleteIds = [];
        result.resources.forEach(function (resource) {
console.log("resource", resource.format, resource.resource_type);
//                deleteIds.push(resource.public_id);
        });
        
        deleteIds = deleteIds.splice(0, 100);

console.log("deleteIds", deleteIds);

        cloudinary.api.delete_resources(deleteIds, function (deleteResult) {
            
console.log("RESULT", deleteResult);

console.log("result.next_cursor", result.next_cursor);

        });

    }, {
        type: "upload",
        tags: true,
        context: true,
        direction: "asc",
        max_results: 500,
        next_cursor: "68fafa05a0b799803984edbbae209050"
    });
*/

    app.use('/pouchfield', POUCHFIELD.app(options.pouchfield));

    var jsonParser = BODY_PARSER.json();
    app.post('/cloudinary.js', jsonParser, function (req, res, next) {

//        syncLibrary(req.body.config);

        res.setHeader('Content-Type', 'application/json');

        if (req.body.action === "list") {
            return cloudinary.api.resources(function (result) {

                result.resources.forEach(function (resource) {
                    if (resource.resource_type === "image") {

//console.log("resource.public_id", resource);

                        resource.url = resource.url;
                        /*
                        {
                            thumbnail: cloudinary.url(resource.public_id, {
                                width: 275,
                                height: 180,
                                crop: "fill",
                                gravity: "center"
                            })
                        };
                        */
                    }
                });
                return res.end(JSON.stringify(result, null, 4));
            }, {
                type: "upload",
                tags: true,
                context: true,
                direction: "desc",
                max_results: 250,
                next_cursor: req.body.cursor || null,
                prefix: (
                    options.cloudinary.import &&
                    options.cloudinary.import.folder &&
                    (options.cloudinary.import.folder + "/")
                ) || ""
            });
        }
        return res.end(JSON.stringify({}, null, 4));
    });


    // TODO: Move these into gunshow lib/plugins.
    app.get(/(\/app(?:\.dist)?\.js)$/, function (req, res, next) {

    	var requestedFilename = "/client.app.js";
    	var sourceFilename = requestedFilename.replace(/\.dist\./, ".");

        var sourcePath = PATH.join(__dirname, sourceFilename);
        var distPath = PATH.join(options.build.distPath, sourceFilename);

        function bundleFiles (basedir, entries, distPath, callback) {
    		var browserify = require("browserify")({
    			basedir: basedir,
    			entries: entries
    		});
    		browserify.transform(require("riotify"), {});
    		return browserify.bundle(function (err, data) {
    			if (err) return callback(err);
    
    			function checkIfChanged (callback) {
    				return FS.exists(distPath, function (exists) {
    					if (!exists) return callback(null, true);
    					return FS.readFile(distPath, "utf8", function (err, existingData) {
    					    if (err) return callback(err);
    						if (existingData === data) {
    						    return callback(null, false);
    						}
						    return callback(null, true);
    					});
    				});
    			}
    			
    			return checkIfChanged(function (err, changed) {
    			    if (err) return callback(err);
    				if (!changed) return callback(null);
    
    		        return FS.outputFile(distPath, data, "utf8", function (err) {
    		        	if (err) return callback(err);
    		        	
    		        	return callback(null);
    		        });
    			});
    		});
        }

        function returnDistFile () {
            return SEND(req, PATH.basename(distPath), {
        		root: PATH.dirname(distPath),
        		maxAge: options.build.clientCacheTTL || 0
        	}).on("error", next).pipe(res);
        }

		return FS.exists(distPath, function (exists) {

	        if (
	        	exists &&
	        	(
	        		/\.dist\./.test(req.params[0]) ||
	        		options.build.alwaysRebuild === false
	        	)
	        ) {
	           	// We return a pre-built file if it exists and are being asked for it
				return returnDistFile();
	        } else {

	           	// We build file, store it and return it

				return FS.exists(sourcePath, function (exists) {
	
		            if (!exists) return next();

		            console.log("Browserifying '" + sourcePath + "' ...");

					return bundleFiles(
						PATH.dirname(sourcePath),
						[
							PATH.basename(sourcePath)
						],
						distPath,
						function (err) {
						    if (err) return next(err);

    						return returnDistFile();
						}
					);
				});
	        }
        });
	});


//console.log("options.postgres.url", options.postgres.url);
    
    const KNEX = require("knex");
	var knexConnection = KNEX({
	    client: 'pg',
        connection: options.postgres.url + "?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
	});
    var knex = function (tableName, query) {
		if (typeof query === "undefined" && typeof tableName === "function") {
			query = tableName;
			tableName = null;
		}
		var table = knexConnection(tableName);
		return query(table).then(function (resp) {

//console.log("RESPONSE:", resp);

			return resp;
		}).catch(function (err) {
			console.error("DB Error:", err.stack);
			throw err;
		});
	}	

    app.post('/data', jsonParser, function (req, res, next) {

        console.log("call data api", req.body);

        function ensureTable (tableName) {
            return knexConnection.schema.hasTable(tableName).then(function(exists) {
                if (exists) return null;
                return knexConnection.schema.createTable(tableName, function (table) {
                    table.string('id').primary();
                    table.text("data");
                });
            });
        }

        return ensureTable(req.body.table).then(function () {

            res.setHeader('Content-Type', 'application/json');
            
            function respond (data) {
                return res.end(JSON.stringify(data, null, 4));
            }

            if (req.body.method === "all") {
                return knex(req.body.table, function (table) {
                    return table.select("*");
                }).then(function (result) {
                    var records = {};
                    result.forEach(function (record) {
                        records[record.id] = JSON.parse(record.data);
                        records[record.id].id = record.id;
                    });
                    return respond(records);
                });
            } else
            if (req.body.method === "where") {
                return knex(req.body.table, function (table) {
                    var query = table.select("*");
                    Object.keys(req.body.query).forEach(function (name) {

                        if (Array.isArray(req.body.query[name])) {
console.log("where in", name, req.body.query[name]);
                            query = query.whereIn(name, req.body.query[name]);
                        } else {
                            query = query.where(name, req.body.query[name]);
                        }
                    });
                    return query;
                }).then(function (result) {
                    var records = {};
                    result.forEach(function (record) {
                        records[record.id] = JSON.parse(record.data);
                        records[record.id].id = record.id;
                    });
                    return respond(records);
                });
            } else
            if (req.body.method === "create") {
                return knex(req.body.table, function (table) {
                    var data = {
                        id: req.body.id,
                        data: JSON.stringify(req.body.data)
                    };
                    return table.returning('id').insert(data);
                }).then(function (result) {
                    return respond(result);
                });
            } else
            if (req.body.method === "update") {
                return knex(req.body.table, function (table) {
                    return table.update({
                        data: JSON.stringify(req.body.data)
                    }).where({
                        id: req.body.id
                    });
                }).then(function (result) {
                    return respond(result);
                });
            } else
            if (req.body.method === "get") {
                return knex(req.body.table, function (table) {
                    return table.where({
                        id: req.body.id
                    });
                }).then(function (result) {
                    var record = result.shift();
                    var data = JSON.parse(record.data);
                    data.id = record.id;
                    return respond(data);
                });
            } else
            if (req.body.method === "has") {
                return knex(req.body.table, function (table) {
                    return table.where({
                        'id': req.body.id
                    });
                }).then(function (result) {
                    if (result.length === 1) {
                        return respond(true);
                    }
                    return respond(false);
                });
            } else {
console.log("method not found req.body", req.body);
            }
            return respond({});
        });
    });



    app.use('/magnific-popup', EXPRESS.static(PATH.join(require.resolve("magnific-popup/package.json"), "../dist")));
    app.use('/codemirror', EXPRESS.static(PATH.join(require.resolve("codemirror/package.json"), "../lib")));

/*
    app.use(function (req, res, next) {
    	if(gun.wsp.server(req, res)) {
    		return; // filters gun requests!
    	}
    	return next();
    });
*/


    function ensureServer (req) {
        if (ensureServer._ensured) return;
if (req) console.log("options.gun.server 0", req._server);
        if (
            req &&
            req._server
        ) {
            if (gun) {
                gun.wsp(req._server);
            }
            ensureServer._ensured = true;
            return;
        }
        if (
            !options.gun ||
            !options.gun.server
        ) {
            return;
        }
console.log("options.gun.server 1", options.gun.server);
        if (
            typeof options.gun.server.use === "function"
        ) {
            if (gun) {
                gun.wsp(options.gun.server);
            }
            ensureServer._ensured = true;
            return;
        }
        var server = options.gun.server();
console.log("options.gun.server 2", server);
        if (server) {
            if (gun) {
                gun.wsp(server);
            }
            ensureServer._ensured = true;
        }
    }
    
    ensureServer();

    return function (req, res, next) {

        if (options.match) {
            var params = req.params;
            // TODO: Relocate into generic helper.
            var expression = new RegExp(options.match.replace(/\//g, "\\/"));
            var m = expression.exec(req.params[0]);
            if (!m) return next();
            params = m.slice(1);
            req.url = params[0];
        }

        ensureServer(req);

        return app(req, res, function (err) {
            if (err) {
                console.error(err.stack || err);
                // TODO: Send simple error message to client.
                return next(err);
            }
            return next();
        });
    };
}
