
require("../gunfield/node_modules/gun/gun.js");


const SPINE = {
    UUID: require("uuid"),
    LODASH: require("lodash"),
    PEGASUS: require("@typicode/pegasus"),
    RIOT: require('riot')
};

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

const COMPONENTS = {
    "media": require("./viewer/media"),
    "viewer": require("./viewer/viewer"),
    "library": require("./viewer/library"),
    "editor": require("./editor/editor"),
    "editor-menu": require("./editor/editor-menu")
};


SPINE.DATA = require("./lib/data").forSpine(SPINE);
SPINE.data = SPINE.DATA.data;


SPINE.images = SPINE.PEGASUS('gunshow/images.json');




SPINE.events.on("request.gallery.new", function (event) {

    SPINE.data.create(event.id, {
        "title": "New Gallery",
        "description": "About this gallery ..."
    });

    if (event.select) {
        SPINE.events.trigger("request.gallery", {
            id: event.id
        });
    }
});


SPINE.events.on("request.gallery", function (event) {
    if (SPINE.state.selected.gallery !== event.id) {
        SPINE.state.selected.gallery = event.id;
        SPINE.events.trigger("changed.state");
    }
});



SPINE.events.on("request.edit", function (event) {
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

var tags = [];
Object.keys(COMPONENTS).forEach(function (name) {
    tags = tags.concat(COMPONENTS[name].mount(SPINE));
});
tags.forEach(function (tag) {
    tag.on('updated', notifyUpdated);
});

