
var tag = require('./viewer.tag');

exports.forSpine = function (SPINE) {


    function impl (opts) {
        var self = this;
        self.state = SPINE.state;


        self.galleries = [];
        self.gallery = null;

        
        var syncSelectedGallery = null;
        
        
        var removedImages = {};

        function setGalleries (galleries) {

            if (Object.keys(removedImages).length > 0) {
                return;
            }
    
//console.log("galleries", galleries);            
            self.galleries = Object.keys(galleries).map(function (id) {

                galleries[id].type = galleries[id].type || "gallery";

                if (typeof galleries[id].images === "string") {
                    galleries[id].images = JSON.parse(galleries[id].images);
                }                
                
                return {
                    id: id,
                    type: galleries[id].type,
                    title: galleries[id].title,
                    itemCount: (galleries[id].images && Object.keys(galleries[id].images).length) || 0
                };
            });
            self.galleries = SPINE.LODASH.sortBy(self.galleries, ['title', 'itemCount']);

            syncSelectedGallery = function () {
                if (
                    self.state.selected.gallery &&
                    galleries[self.state.selected.gallery]
                ) {
                    self.gallery = galleries[self.state.selected.gallery];
                    if (typeof self.gallery.images === "string") {
                        self.gallery.images = JSON.parse(self.gallery.images);
                    }
                    if (self.gallery.images) {
                        self.gallery.images = SPINE.LODASH.sortBy(self.gallery.images, ['created_at', 'id']);
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
                id: SPINE.UTIL.makeIdForNode(SPINE.$(event.target)),
                type: (self.gallery && self.gallery.type) || "gallery"
            });
        }
        self.requestItemRemove = function (event) {
            
            removedImages[event.item.id] = true;
            
            var images = self.gallery.images;
            images = images.filter(function (image) {
                if (!image) return false;
                return (image.id !== event.item.id);
            });
            self.gallery.images = images;
            self.update();
            SPINE.data.set("gallery", self.gallery.id, "images", JSON.stringify(images)).then(function () {
                delete removedImages[event.item.id];
                if (Object.keys(removedImages).length === 0) {
                    self.update();
                }
            }).catch(console.error);
        }

        self.requestMakeShowcase = function (event) {
            SPINE.data.set("gallery", self.gallery.id, "type", "showcase").then(function () {
                self.update();
            }).catch(console.error);
        }


        self.on("mount", function () {
            var ns = SPINE.UTIL.makeIdForNode(SPINE.$(self.root));
            SPINE.data.watch(ns, function () {
                SPINE.data.getAll(ns).then(function (records) {
                    setGalleries(records);
                    self.update();
                }).catch(console.error);
            });
        });
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
