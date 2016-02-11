
const PATH = require("path");
const EXPRESS = require('express');
const GUN = require('../gunfield/node_modules/gun');
const BROWSERIFY = require("browserify");
const RIOTIFY = require("riotify");
const BODY_PARSER = require('body-parser');

const DATA = require("./lib/data");


exports.app = function (options) {

    if (!options.s3.secret) {
        throw new Error("Missing secret config credentials! Load them into your environment first.");
    }

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
    
    
    var jsonParser = BODY_PARSER.json();
    app.post('/cloudinary.js', jsonParser, function (req, res, next) {

//        syncLibrary(req.body.config);

        res.setHeader('Content-Type', 'application/json');

        if (req.body.action === "list") {
            return cloudinary.api.resources(function (result) {

                result.resources.forEach(function (resource) {
                    if (resource.resource_type === "image") {

                        resource.public_urls = {
                            thumbnail: cloudinary.url(resource.url, {
                                width: 400,
                                height: 200,
                                crop: "fill"
                            })
                        };
                    }
                });
                return res.end(JSON.stringify(result, null, 4));
            }, {
                type: "upload",
                tags: true,
                context: true,
                direction: "desc",
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
    app.get('/app.js', function (req, res, next) {
		var browserify = BROWSERIFY({
			basedir: __dirname,
			entries: [
			    'client.app.js'
		    ]
		});
		browserify.transform(RIOTIFY, {});
		return browserify.bundle(function (err, data) {
			if (err) return next(err);
            res.writeHead(200, {
                "Content-type": "application/javascript"
            });
			return res.end(data.toString());
		});
	});


    app.use('/magnific-popup', EXPRESS.static(PATH.join(require.resolve("magnific-popup/package.json"), "../dist")));
    app.use('/codemirror', EXPRESS.static(PATH.join(require.resolve("codemirror/package.json"), "../lib")));


    app.use(function (req, res, next) {
    	if(gun.wsp.server(req, res)) {
    		return; // filters gun requests!
    	}
    	return next();
    });



    function ensureServer () {
        if (ensureServer._ensured) return;
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
            gun.wsp(options.gun.server);
            ensureServer._ensured = true;
        } else {
            var server = options.gun.server();
console.log("options.gun.server 2", server);
            if (server) {
                gun.wsp(server);
                ensureServer._ensured = true;
            }
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

        ensureServer();

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
