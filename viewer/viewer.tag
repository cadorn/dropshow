
<viewer>

    <div class="ui three item menu">
      <a each={ tags } class="item" onclick={ selectTab }>{ label } ({ count })</a>
    </div>


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
        
        self.activeTag = 0;

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
        
        selectTab(event) {
            self.activeTag = event.item.i;
        }

    </script>

</viewer>