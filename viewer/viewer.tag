
<viewer>

    <div class="ui three item menu">
      <a each={ tags } class="item" onclick={ selectTab }>{ label } ({ count })</a>
    </div>


    <h1 editable-data-id="label">{ activeTag !== -1 && galleries[activeTag] && galleries[activeTag].label || "" }</h1>


    <div class="ui medium images">
        <div if={ tags.indexOf(activeTag) != -1 } each={ images }>
            <p>{ caption }</p>
            <img src="{ urls.thumbnail }">
        </div>
    </div>


    <script>
        var self = this;

        self.images = [];
        self.tags = [];
        
        self.activeTag = -1;

        var imagesByTag = {};


        opts.requests.images.then(function(data, xhr) {
        
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
                    label: tag,
                    count: imagesByTag[tag].length
                };
            });

            self.update(changes);
        }, console.error);


        self.galleries = {};


		var gun = Gun(location.origin + '/gunshow/gun');


        function initGallery (galleryID) {
            if (!initGallery._initialized) {
                initGallery._initialized = {};
            }
            if (!initGallery._initialized[galleryID]) {
                initGallery._initialized[galleryID] = true;
    console.log("Init gallery:", galleryID);
                ensureGallery._galleries[galleryID].path("label").put("Our Label: " + galleryID);
            }
        }

        function ensureGallery (galleryID) {
            if (!ensureGallery._galleries) {
                ensureGallery._galleries = {};
            }
            if (!ensureGallery._galleries[galleryID]) {

console.log("Ensure gallery:", galleryID);

        		var ref = ensureGallery._galleries[galleryID] = gun.get("galleries/" + galleryID, function (error, node) {
    console.log("error", error);
    console.log("node", node);
    
                    if (error === null && node === undefined) {
                        initGallery(galleryID);
                    }
    
                  // called many times
                });

        		ref.on(function(data) {
        			delete data._; // skip meta data!
        
    console.log("GALLERY DATA!", galleryID, data);
    
                    self.galleries[galleryID] = data;

console.log(self.galleries);

                    self.update();
        		});
            }
            return ensureGallery._galleries[galleryID];
        }

		function loadGalleryData (galleryID) {
		    ensureGallery(galleryID);
    	}


        $(document).on('click', '.popup-modal-dismiss', function (e) {

ensureGallery(self.activeTag).path("label").put(editor.doc.getValue());

          e.preventDefault();
          $.magnificPopup.close();
        });


        selectTab(event) {
            self.activeTag = event.item.i;
            loadGalleryData(self.activeTag);
        }

    </script>

</viewer>