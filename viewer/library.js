
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

            var insertionContext = null;

            self.imagesAll = [];
            self.images = [];

            var associatedImages = {};

            SPINE.data.watch("gallery", function () {

                SPINE.data.getAll("gallery").then(function (galleries) {

                    associatedImages = {};
                    Object.keys(galleries).forEach(function (galleryId) {
                        var images = galleries[galleryId].images || "[]";
                        if (typeof images === "string") {
                            images = JSON.parse(images);
                        }
                        images.forEach(function (image) {
                            if (!image) return;
                            if (
                                insertionContext &&
                                insertionContext.type === "showcase"
                            ) {
                                // Allow to associate more than once.
                            } else {
                                associatedImages[image.id] = true;
                            }
                        });
                    });

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
            
            
            var selectedPage = 1;
            
            self.on("update", function () {
                if (!insertionContext) {
                    // Render no images when library is not showing.
                    self.images = [];
                    return;
                }
                self.images = self.imagesAll.filter(function (image) {
                    image.pendingAddition = imagesToAdd[image.id] || false
                    return (!associatedImages[image.id]);
                });
                
                var imagesPerPage = 100;
                if (
                    insertionContext &&
                    insertionContext.type === "showcase"
                ) {
                    imagesPerPage = 250;
                }
                
                if (imagesPerPage < self.images.length) {
                    var pagesCount = Math.ceil(self.images.length / imagesPerPage);
                    var pages = [];
                    for (var i=0 ; i<pagesCount; i++) {
                        pages.push({
                            "number": ""+(i+1),
                            "selected": (selectedPage == (i+1))
                        });
                    }

                    self.navbar = {
                        previous: (parseInt(selectedPage) - 1),
                        pages: pages,
                        next: (parseInt(selectedPage) + 1)
                    };
                    if (!self.navbar.previous) {
                        self.navbar.previous = "";
                    } else {
                        self.navbar.previous = "" + self.navbar.previous;
                    }
                    if (self.navbar.next > pagesCount) {
                        self.navbar.next = "";
                    } else {
                        self.navbar.next = "" + self.navbar.next;
                    }

                    self.images = self.images.slice(
                        (selectedPage - 1) * imagesPerPage,
                        ((selectedPage - 1) * imagesPerPage) + imagesPerPage
                    );

                } else {
                    self.navbar = null;
                }
            });

            self.requestPage = function (event) {
                selectedPage = ""+event.target.dataset.id;
                self.update();
            }


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
    
            SPINE.events.on("request.library", function (event) {
                if (
                    !event ||
                    !event.el
                ) return;

                insertionContext = event;

console.log("insertionContext", insertionContext);

                ensureWatching();
                self.update();
                
                imagesToAdd = {};
                selectedPage = 1;
    
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
            
            
            
            var imagesToAdd = {};
            
            
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

                if (Object.keys(imagesToAdd).length > 0) {

                    var idParts = insertionContext.id.split("/");
                    var id = idParts.pop();
                    var ns = idParts.join("/");
    
                    return SPINE.data.get(ns, id).then(function (gallery) {
                        var images = gallery.images || "[]";
                        if (typeof images === "string") {
                            images = JSON.parse(images);
                        }
                        images = images.filter(function (image) {
                            if (!image) return false;
                            return true;
                        });
                        Object.keys(imagesToAdd).forEach(function (newImageId) {
                            if (images.filter(function (image) {
                                return (image.id === newImageId);
                            }).length === 0) {
                                images.push(self.imagesAll.filter(function (image) {
                                    return (image.id === newImageId);
                                }).shift());
                            }
                        });

                        imagesToAdd = {};
                        insertionContext = null;

                        return SPINE.data.set(ns, id, "images", JSON.stringify(images));
                    }).catch(function (err) {
                        console.error(err);
                        throw err;
                    });
                }
                
                insertionContext = null;
            }
            
            
            self.notifyClick = function (event) {

                imagesToAdd[event.item.id] = true;
                self.update();
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
