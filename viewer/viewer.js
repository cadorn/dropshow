
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
