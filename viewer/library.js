
var tag = require('./library.tag');

exports.forSpine = function (SPINE) {

    const LIBRARY_NS = "library/images/all";
    
    function impl (opts) {
        try {
            var self = this;
            self.state = SPINE.state;
            SPINE.events.on("changed.state", function () {
                self.update();
            });
    
    
            self.imagesAll = [];
            self.images = [];

            var associatedImages = {};

console.log("register galley watcher");

            SPINE.data.watch("gallery", function () {

console.log("galley changed");

                SPINE.data.getAll("gallery").then(function (galleries) {
                    associatedImages = {};
                    Object.keys(galleries).forEach(function (galleryId) {
                        var images = galleries[galleryId].images || "[]";
                        if (typeof images === "string") {
                            images = JSON.parse(images);
                        }
                        images.forEach(function (image) {
                            associatedImages[image.id] = true;
                        });
                    });

console.log("new galley data", galleries);
                
                    // TODO: Only fire update if associated images change.
                    self.update();
                    return null;
                }).catch(function (err) {
                    console.error(err);
                });
            });


            function setImages (images) {
                self.images = Object.keys(images).map(function (id) {
                    images[id].id = id;
                    if (typeof images[id].urls === "string") {
                        images[id].urls = JSON.parse(images[id].urls);
                    }
                    return images[id];
                });
                self.imagesAll = SPINE.LODASH.sortBy(self.images, ['created_at', 'id']);
            }

            self.on("update", function () {
                if (!insertionContext) {
                    // Render no images when library is not showing.
                    self.images = [];
                    return;
                }
                self.images = self.imagesAll.map(function (image) {
                    image.associated = !!associatedImages[image.id];
                    return image;
                });
                // We only show the first 250 images.
                self.images = self.images.slice(0, 250);
            });


            function ensureWatching () {
                if (ensureWatching._watching) return;
                ensureWatching._watching = true;

                SPINE.data.watch(LIBRARY_NS, function () {
                    SPINE.data.getAll(LIBRARY_NS).then(function (images) {
                        setImages(images);
                        self.update();
                    }).catch(console.error);
                });
            }
    
            var insertionContext = null;
        
            SPINE.events.on("request.library", function (event) {
                if (
                    !event ||
                    !event.el
                ) return;

                insertionContext = event;

                ensureWatching();
                self.update();
    
                SPINE.$.magnificPopup.open({
                    items: {
                        src: '#library-modal'
                    },
                    type: 'inline',
                    preloader: false,
                    modal: true,
                    overflowY: "hidden",
                    callbacks: {
                        beforeOpen: function() {
        
        // TODO: Load library.
        console.log("load library");
        
                        },
                        open: function() {
                            SPINE.$("#library-modal").height(SPINE.$(window).height() - 120);
                        }
                    }
                });
            });
            
            self.requestClose = function () {
        
//    console.log("insert", insertionContext);
    /*
                var idParts = insertionContext.id.split("/");
                var property = idParts.pop();
                var id = idParts.pop();
                var namespace = idParts.join("/");
        
                SPINE.data.set(namespace, id, property, editor.doc.getValue());
    */
                SPINE.$.magnificPopup.close();
                
                insertionContext = null;
            }
            
            
            self.notifyClick = function (event) {

                var idParts = insertionContext.id.split("/");
                var id = idParts.pop();
                var ns = idParts.join("/");
                
                SPINE.data.get(ns, id).then(function (gallery) {
                    var images = gallery.images || "[]";
                    if (typeof images === "string") {
                        images = JSON.parse(images);
                    }
                    if (images.filter(function (image) {
                        return (image.id === event.item.id);
                    }).length === 0) {
                        images.push(self.images.filter(function (image) {
                            return (image.id === event.item.id);
                        }).shift());
                        return SPINE.data.set(ns, id, "images", JSON.stringify(images));
                    }
                    return null;
                }).catch(console.error);
            }

            self.requestLibrarySync = function () {
                SPINE.events.trigger("request.library.sync");
            }

/*    
TODO: Optionally support drag and drop

            self.on("mount", function () {
    
        //dropzone-keep-for-later
    console.log("1", SPINE.$('#library-modal .dropzone-add-to-gallery'));            
                
                function dragMoveListener (event) {
                    var target = event.target,
                        // keep the dragged position in the data-x/data-y attributes
                        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                
                    // translate the element
                    target.style.webkitTransform =
                    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                
                    // update the posiion attributes
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                  }
                
                SPINE.INTERACT('#library-modal .draggable')
                  .draggable({
                    // enable inertial throwing
                    inertia: true,
                    // enable autoScroll
                    autoScroll: false,
                    onmove: dragMoveListener,
                  });

console.log(SPINE.$('#library-modal .dropzone-add-to-gallery'));
                SPINE.INTERACT('#library-modal .dropzone-add-to-gallery').dropzone({
                  //accept: '#library-modal img[data-id]',
                  overlap: 0.75,
                
                  ondropactivate: function (event) {
        console.log("ondropactivate");
                    event.target.classList.add('drop-active');
                  },
                  ondragenter: function (event) {
        console.log("ondragenter");
                    var draggableElement = event.relatedTarget,
                        dropzoneElement = event.target;
                
                    // feedback the possibility of a drop
                    dropzoneElement.classList.add('drop-target');
                    draggableElement.classList.add('can-drop');
                  },
                  ondragleave: function (event) {
        console.log("ondragleave");
                    // remove the drop feedback style
                    event.target.classList.remove('drop-target');
                    event.relatedTarget.classList.remove('can-drop');
                  },
                  ondrop: function (event) {
        console.log("ondrop");
                  },
                  ondropdeactivate: function (event) {
         console.log("ondropdeactivate");
                    // remove active dropzone feedback
                    event.target.classList.remove('drop-active');
                    event.target.classList.remove('drop-target');
                  }
                });
    console.log("2");            
            });
*/


        } catch (err) {
            console.error(err.stack);
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
