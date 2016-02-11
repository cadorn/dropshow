
exports.forSpine = function (SPINE) {

    var exports = {};

    function syncLibrary () {
        
        if (syncLibrary._syncing) return;
        syncLibrary._syncing = true;


        const LIBRARY_NS = "library/images/all";


console.log("SPINE.config", SPINE.config);


        function insertImages (data) {

            var fetchPreviousPage = false;
            
            return SPINE.Promise.all(data.resources.map(function (resource) {
                if (resource.resource_type === "image") {
                    var id = resource.public_id.replace(new RegExp(SPINE.config.cloudinary.import.folder + "\\/"), "");
                    return SPINE.data.has(LIBRARY_NS, id).then(function (found) {
                        if (found) return;
                        // If any images are not found we fetch the previous page.
                        // TODO: Only fetch previous page if earliest record not found.
                        fetchPreviousPage = true;

console.log("Insert new library record", LIBRARY_NS, id);

                        return SPINE.data.create(LIBRARY_NS, id, {
                            created_at: new Date(resource.created_at).getTime(),
                            bytes: resource.bytes,
                            width: resource.width,
                            height: resource.height,
                            // TODO: Instead of stringify, optionally fetch and listen to sub-paths
                            urls: JSON.stringify(resource.public_urls)
                        });
                    });
                }
                return null;
            })).then(function () {

console.log("fetchPreviousPage", fetchPreviousPage);

                return null;
            });
        }

        SPINE.$.ajax({
            type: "POST",
            url: SPINE.config.baseUrl + "/cloudinary.js",
            data: JSON.stringify({
                action: "list"
/*
                config: {
                    gun: {
                        peer: {
                            url: SPINE.config.gun.peer.url
                        }
                    }
                }
*/
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: insertImages,
            failure: function (errMsg) {
                console.error("errMsg", errMsg);
            }
        });
    }

    SPINE.events.on("request.library", function (event) {
        if (
            !event ||
            !event.el
        ) return;

        syncLibrary();
    });




/*
var ns = "images/all";
console.log("CHECK HAS", ns, "id3");
SPINE.data.has(LIBRARY_NS, "id3").then(function (found) {
    console.log("RECORD", ns, "id3", found);
});
SPINE.data.has(ns, "id4").then(function (found) {
    console.log("RECORD", ns, "id4", found);
});
SPINE.data.has(ns, "id5").then(function (found) {
    console.log("RECORD", ns, "id5", found);
});
*/

/*
SPINE.data.create(ns, "id3", {
    foo: "bar"
});
*/

    
    
    return exports;
};
