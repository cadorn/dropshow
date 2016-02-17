
var tag = require('./gallery.tag');

exports.forSpine = function (SPINE) {


    function impl (opts) {
        var self = this;
        self.state = SPINE.state;


        self.gallery = null;

        function setGallery (id, gallery) {
            if (!gallery) {
                self.gallery = null;
                return;
            }
            self.gallery = gallery;
            if (typeof self.gallery.images === "string") {
                self.gallery.images = JSON.parse(self.gallery.images);
            }
            if (self.gallery.images) {
                self.gallery.images = SPINE.LODASH.sortBy(self.gallery.images, ['created_at', 'id']);
            }
            self.gallery.id = id;
        }

        SPINE.events.on("changed.state", function () {
            self.update();
        });

        self.on("mount", function () {
            var ns = SPINE.UTIL.makeIdForNode(SPINE.$(self.root));
            
//            var nsParts = ns.split("/");
//            var id = nsParts.pop();
//            ns = nsParts.join("/");

            var id = (window.location.pathname || "").split("/").pop();

            SPINE.data.get(ns, id).then(function (record) {
                setGallery(id, record);
                self.update();
            }).catch(console.error);
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
