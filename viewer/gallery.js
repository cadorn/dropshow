
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

            SPINE.data.where("library/images/all", {
                "id": SPINE.LODASH.map(self.gallery.images, "id")
            }).then(function (records) {

                self.gallery.images = Object.keys(records).map(function (id) {
                    return records[id];
                });

                self.update();
            }).catch(console.error);
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
            }).catch(console.error);
        });
        
        self.requestLightbox = function (event) {

            var images = [];
            var selectedIndex = -1;
            var i = 0;
            $("img", $(event.target).closest('.lightbox-boundary')).each(function () {
                var url = $(this).attr("src");

                url = url.replace(/w_\d*/, "w_" + 1000);
                url = url.replace(/h_\d*/, "h_" + Math.round(1000/4*3));

                images.push({
                    src: url
                });
                if ($(this).attr("data-id") === event.item.id) {
                    selectedIndex = i;
                }
                i += 1;
            });

            SPINE.$.magnificPopup.open({
                items: images,
                gallery: {
                    enabled: true
                },
                type: 'image'
            }, selectedIndex);
        }
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
