
var tag = require('./viewer.tag');

exports.forSpine = function (SPINE) {


    function impl (opts) {
        var self = this;
        self.state = SPINE.state;


        self.galleries = [];
        self.gallery = null;

        
        var syncSelectedGallery = null;
        

        function setGalleries (galleries) {
            self.galleries = Object.keys(galleries).map(function (id) {

                if (typeof galleries[id].images === "string") {
                    galleries[id].images = JSON.parse(galleries[id].images);
                }                
                
                return {
                    id: id,
                    title: galleries[id].title,
                    itemCount: (galleries[id].images && Object.keys(galleries[id].images).length) || 0
                };
            });
            syncSelectedGallery = function () {
                if (
                    self.state.selected.gallery &&
                    galleries[self.state.selected.gallery]
                ) {
                    self.gallery = galleries[self.state.selected.gallery];
                    if (typeof self.gallery.images === "string") {
                        self.gallery.images = JSON.parse(self.gallery.images);
                    }
                    self.gallery.id = self.state.selected.gallery;
                } else {
                    self.gallery = null;
                }
            };
            syncSelectedGallery();
        }

        // Watch one gallery at a time (whichever is showing).
        function watchGallery (id) {
            if (watchGallery._watching) {
                if (watchGallery._watching.id === id) return;
                watchGallery._watching.stop();
            }

console.log("watch gallery", id);
/*
            SPINE.data.watch(id, function (value) {
console.log("GALLERY CHANGED", value);

            });
*/
        }
        SPINE.events.on("changed.state", function () {
//            watchGallery(self.state.selected.gallery);
            if (syncSelectedGallery) {
                syncSelectedGallery();
            }
            self.update();
        });
        
        
        self.requestGalleryNew = function (event) {
            SPINE.events.trigger("request.gallery.new", {
                id: SPINE.UTIL.makeIdForNode(SPINE.$(event.target)),
                select: true
            });
        }
        self.requestGallery = function (event) {
            SPINE.events.trigger("request.gallery", {
                id: event.item.id,
                select: true
            });
        }
        self.requestLibrary = function (event) {
            SPINE.events.trigger("request.library", {
                el: SPINE.$(event.target),
                id: SPINE.UTIL.makeIdForNode(SPINE.$(event.target))
            });
        }
        self.requestItemRemove = function (event) {
            var images = self.gallery.images;
            images = images.filter(function (image) {
                return (image.id !== event.item.id);
            });
            SPINE.data.set("gallery", self.gallery.id, "images", JSON.stringify(images));
            self.update();
        }


        self.on("mount", function () {
            var ns = SPINE.UTIL.makeIdForNode(SPINE.$(self.root));
            SPINE.data.watch(ns, function () {
                setGalleries(SPINE.data.getAll(ns));
                self.update();
            });
        });

        
/*

        
        self.images = [];
        self.tags = [];

        var imagesByTag = {};


        SPINE.images.then(function(data, xhr) {
        
//console.log("IMAGES", data);
            
            var changes = {
                images: data,
                tags: []
            };
            changes.images = changes.images.map(function (image, i) {
                return {
                    caption: (image.context && image.context.custom && image.context.custom.caption) || "",
                    urls: image.public_urls,
                    tags: image.tags.map(function (tag) {
                        if (!imagesByTag[tag]) imagesByTag[tag] = [];
                        imagesByTag[tag].push(i);
                        return Object.keys(imagesByTag).indexOf(tag);
                    })
                };
            });
            changes.tags = Object.keys(imagesByTag).map(function (tag, i) {
                return {
                    i: i,
                    // TODO: Get gallery id from data source.
                    id: "i" + i,
                    label: tag,
                    count: imagesByTag[tag].length
                };
            });

            self.update(changes);
        }, console.error);


        self.galleries = {};


        self.selectTab = function (event) {
            SPINE.events.on("select.gallery", event.item.id);

//            self.activeTag = event.item.i;
//            loadGalleryData(self.activeTag);
        }
*/
    }


    var opts = {
        impl: impl
    };
    return {
        mount: function () {
            return SPINE.RIOT.mount(tag, opts);
        },
        getOpts: function () {
            return opts;
        }
    };
}
