
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
    
    
            self.images = [];

            var associatedImages = {};

            SPINE.data.watch("gallery", function () {
                var galleries = SPINE.data.getAll("gallery");
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
                // TODO: Only fire update if associated images change.
                self.update();
            });

    
            function setImages (images) {
                self.images = Object.keys(images).map(function (id) {
                    images[id].id = id;
                    if (typeof images[id].urls === "string") {
                        images[id].urls = JSON.parse(images[id].urls);
                    }
                    return images[id];
                });
            }

            self.on("update", function () {
                self.images.forEach(function (image) {
                    image.associated = !!associatedImages[image.id];
                });
            });
    
            
            function ensureWatching () {
                if (ensureWatching._watching) return;
                ensureWatching._watching = true;
    
                SPINE.data.watch(LIBRARY_NS, function () {
                    setImages(SPINE.data.getAll(LIBRARY_NS));
                    self.update();
                });
            }
    
            var insertionContext = null;
        
            SPINE.events.on("request.library", function (event) {
                if (
                    !event ||
                    !event.el
                ) return;
                
                ensureWatching();
    
                insertionContext = event;
    
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
            }
            
            
            self.notifyClick = function (event) {

                var idParts = insertionContext.id.split("/");
                var id = idParts.pop();
                var ns = idParts.join("/");
                
                var gallery = SPINE.data.get(ns, id);
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
                    SPINE.data.set(ns, id, "images", JSON.stringify(images));
                }
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
