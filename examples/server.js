
const PATH = require("path");
const EXPRESS = require('express');
const GUNSHOW = require("..");

const PORT = process.env.PORT || 8080;


var app = EXPRESS();

app.use('/semantic-ui', EXPRESS.static(PATH.dirname(require.resolve("semantic-ui-css/package.json"))));

app.use('/gunshow', GUNSHOW.app({
    gun: {
        server: app,
        ws: {
            path: "/gunshow/gun"
        }
    },
    s3: {
    	key: process.env.SERVICE_COM_AMAZON_AWS_ACCESS_KEY_ID,
    	secret: process.env.SERVICE_COM_AMAZON_AWS_SECRET_ACCESS_KEY,
    	bucket: process.env.SERVICE_COM_AMAZON_AWS_S3_BUCKET_NAME,
    	region: process.env.SERVICE_COM_AMAZON_AWS_S3_BUCKET_REGION
	},
    cloudinary: { 
        cloud_name: process.env.SERVICE_COM_CLOUDINARY_CLOUD, 
        api_key: process.env.SERVICE_COM_CLOUDINARY_KEY, 
        api_secret: process.env.SERVICE_COM_CLOUDINARY_SECRET,
        import: {
            folder: "originals"
        }
    }
}));

app.use('/', EXPRESS.static(__dirname));

app.listen(PORT, function () {
    console.log('Examples server running at: http://127.0.0.1:' + PORT + "/");
});

