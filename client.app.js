
var $ = require("./node_modules/jquery/dist/jquery.js");

var old$ = window.$;
window.$ = $;
require("./node_modules/magnific-popup/dist/jquery.magnific-popup.min.js");
window.$ = old$;

require("../gunfield/node_modules/gun/gun.js");

const SPINE = {
    $: $,
    CODEMIRROR: require("./node_modules/codemirror/lib/codemirror"),
    UUID: require("uuid"),
    LODASH: require("lodash"),
    PEGASUS: require("@typicode/pegasus"),
    RIOT: require('riot'),
    GUN: window.Gun,
    INTERACT: require("interact.js"),
    Promise: require("bluebird")
};
SPINE.DOM_OUTLINE = require("./lib/dom-outline").forSpine(SPINE).DomOutline;

SPINE.UTIL = require("./lib/util").forSpine(SPINE);

SPINE.events = new function () {};
SPINE.RIOT.observable(SPINE.events);


SPINE.state = {
    mode: "present",
    editing: false,
    selected: {
        gallery: -1
    }
};

SPINE.config = {
    editor: {
        label: "Gunshow Editor"
    },
    gun: {
        namespacePrefix: "ns03/",
        peer: {
            url: location.origin + '/gunshow/gun'
        }
    },
    baseUrl: "/gunshow",
    "cloudinary": { 
        "import": {
            "folder": "originals"
        }
    }
};

const COMPONENTS = {
    "media": require("./viewer/media").forSpine(SPINE),
    "viewer": require("./viewer/viewer").forSpine(SPINE),
    "library": require("./viewer/library").forSpine(SPINE),
    "editor": require("./editor/editor").forSpine(SPINE),
    "editor-menu": require("./editor/editor-menu").forSpine(SPINE)
};






SPINE.events.on("request.gallery.new", function (event) {

    SPINE.data.create(event.id, {
        "title": "New Gallery",
        "description": "About this gallery ..."
    });
/*
    if (event.select) {
        SPINE.events.trigger("request.gallery", {
            id: event.id
        });
    }
*/
});


SPINE.events.on("request.gallery", function (event) {
    if (SPINE.state.selected.gallery !== event.id) {
        SPINE.state.selected.gallery = event.id;
        SPINE.events.trigger("changed.state");
    }
});

/*
function ensureCss () {
    [
        require("./node_modules/magnific-popup/dist/magnific-popup.css"),
        require("./node_modules/codemirror/lib/codemirror.css")
    ].forEach(function (cssText) {

console.log("cssText", cssText);

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = cssText;
        } else {
            style.appendChild(document.createTextNode(cssText));
        }
        document.body.appendChild(style);        
    });
}
*/
SPINE.events.on("request.edit", function (event) {
//    ensureCss();
    if (SPINE.state.mode !== "edit") {
        SPINE.state.mode = "edit";
        SPINE.events.trigger("changed.state");
    }
    if (event && event.id) {
        
    }
});

SPINE.events.on("request.present", function () {
    if (SPINE.state.mode !== "present") {
        SPINE.state.mode = "present";
        SPINE.events.trigger("changed.state");
    }
});



function notifyUpdated () {
    if (!notifyUpdated.__debounced) {
        notifyUpdated.__debounced = SPINE.LODASH.debounce(function () {
            SPINE.events.trigger("changed.dom");
        }, 100);
    }
    notifyUpdated.__debounced();
}

function bootData () {
    if (bootData._booted) {
        return;
    }
    bootData._booted = true;
    
    SPINE.DATA = require("./lib/data").forSpine(SPINE);
    SPINE.data = SPINE.DATA.data;
    SPINE.LIBRARY = require("./lib/library").forSpine(SPINE);
}


// TODO: Register with PINF loader if global available.
window._GUNSHOW_API = {
    mountTags: function mountTags (elements, config) {
        if (!mountTags._config) {
            mountTags._config = SPINE.config;
        }
        SPINE.config = SPINE.LODASH.merge(mountTags._config, config);
        
        bootData();
        
        var tags = [];
        elements.forEach(function (element) {
            var name = element[1].tag.replace(/^gunshow-/, "");
            tags = tags.concat(
                SPINE.RIOT.mount(element[0].get(0), element[1].tag, COMPONENTS[name].getOpts())
            );
        });
        tags.forEach(function (tag) {
            tag.on('updated', notifyUpdated);
        });
    }
}

window._GUNSHOW_START = function () {

    bootData();

    var tags = [];
    Object.keys(COMPONENTS).forEach(function (name) {
        tags = tags.concat(COMPONENTS[name].mount());
    });
    tags.forEach(function (tag) {
        tag.on('updated', notifyUpdated);
    });
}



