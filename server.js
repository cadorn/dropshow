
const PATH = require("path");
// TODO: Look into https://github.com/firebase/superstatic
const EXPRESS = require('express');


const PORT = process.env.PORT || 8080;


var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.SERVICE_COM_CLOUDINARY_CLOUD, 
  api_key: process.env.SERVICE_COM_CLOUDINARY_KEY, 
  api_secret: process.env.SERVICE_COM_CLOUDINARY_SECRET
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

app.use('/viewer', EXPRESS.static(PATH.join(__dirname, "viewer")));

app.use('/semantic-ui', EXPRESS.static(PATH.dirname(require.resolve("semantic-ui-css/package.json"))));
app.use('/pegasus', EXPRESS.static(PATH.join(require.resolve("@typicode/pegasus/package.json"), "../dist")));
app.use('/riot', EXPRESS.static(PATH.dirname(require.resolve("riot/package.json"))));

app.use('/', EXPRESS.static(__dirname));

app.listen(PORT, function () {
    console.log('Examples server running at: http://127.0.0.1:' + PORT + "/");
});

