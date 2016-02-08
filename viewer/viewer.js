
var riot = require('riot');

var viewerTag = require('./viewer.tag');



window.mountViewer = function () {

    riot.mount(viewerTag, {
        requests: {
            images: window.app_images
        }
    });
}
