
const PATH = require("path");
const EXPRESS = require('express');
const GUN = require('../gunfield/node_modules/gun');
const BROWSERIFY = require("browserify");
const RIOTIFY = require("riotify");

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


    var images = {};

    cloudinary.api.resources(function (result) {

        images = result.resources.map(function (resource) {
            if (resource.resource_type === "image") {
                
                resource.public_urls = {
                    thumbnail: cloudinary.url(resource.url, {
                        width: 400,
                        height: 200,
                        crop: "fill"
                    })
                };
    
            }
            return resource;
        });
    
        console.log("Loaded data for", images.length, "images");
    }, {
        tags: true,
        context: true,
        direction: "asc"
    });

    var app = EXPRESS();

    app.use('/images.json', function (req, res, next) {
        return res.end(JSON.stringify(images, null, 4));    
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


    app.use('/viewer', EXPRESS.static(PATH.join(__dirname, "viewer")));
    app.use('/editor', EXPRESS.static(PATH.join(__dirname, "editor")));
//    app.use('/pegasus', EXPRESS.static(PATH.join(require.resolve("@typicode/pegasus/package.json"), "../dist")));
    app.use('/riot', EXPRESS.static(PATH.dirname(require.resolve("riot/package.json"))));
    app.use('/magnific-popup', EXPRESS.static(PATH.join(require.resolve("magnific-popup/package.json"), "../dist")));
    app.use('/jquery', EXPRESS.static(PATH.join(require.resolve("jquery/package.json"), "../dist")));
    app.use('/codemirror', EXPRESS.static(PATH.join(require.resolve("codemirror/package.json"), "../lib")));

    // TODO: Move these into gunfield lib.
//    app.use('/gun', EXPRESS.static(PATH.join(__dirname, "../gunfield/node_modules/gun")));

    app.use(function (req, res, next) {
    	if(gun.wsp.server(req, res)) {
    		return; // filters gun requests!
    	}
    	return next();
    });

    if (
        options.gun &&
        options.gun.server
    ) {
        gun.wsp(options.gun.server);
    }

    return function (req, res, next) {

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
