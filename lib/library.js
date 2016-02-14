
exports.forSpine = function (SPINE) {

    var exports = {};

    function syncLibrary () {
        
        if (syncLibrary._syncing) return;
        syncLibrary._syncing = true;


        const LIBRARY_NS = "library/images/all";

        console.log("Sync library ...");

        var fetchPages = 25;
        var fetchedPages = 0;

        function insertImages (data) {
            try {

                console.log("Handle resources (" + data.resources.length + ") ...");


                var q = SPINE.ASYNC.queue(function (task, callback) {
                    
                    var id = task.id;
                    var resource = task.resource;
                    
                    try {
                
    console.log("check record", LIBRARY_NS, id);
                        SPINE.data.has(LIBRARY_NS, id).then(function (found) {
                            if (found) {
    console.log("found existing record", LIBRARY_NS, id);
                                return callback();
                            }
    
    console.log("Insert new library record", LIBRARY_NS, id);
    
                            return SPINE.data.create(LIBRARY_NS, id, {
                                created_at: new Date(resource.created_at).getTime(),
                                bytes: resource.bytes,
                                width: resource.width,
                                height: resource.height,
                                // TODO: Instead of stringify, optionally fetch and listen to sub-paths
                                urls: JSON.stringify(resource.public_urls)
                            }).then(function () {
                                setTimeout(function () {
                                    callback();
                                }, 1000);
                                return null;
                            });
    
                        }).catch(callback);
                    } catch (err) {
                        throw err;
                    }
                }, 50);

                q.drain = function() {

    console.log("done page");

                    if (fetchedPages >= fetchPages) return;
        
                    if (!data.next_cursor) {
                        syncLibrary._syncing = false;
                        console.log("no more pages");
                        return;
                    }
                    fetchedPages += 1;
    
                    console.log("schedule next page");
                    setTimeout(function () {
                        fetchForCursor(data.next_cursor);
                    }, 5 * 1000);
                }

                data.resources.forEach(function (resource, i) {
                    if (resource.resource_type === "image") {

    console.log("for image", i);

                        var id = resource.public_id.replace(new RegExp(SPINE.config.cloudinary.import.folder + "\\/"), "");
                        q.push({
                            id: id,
                            resource: resource
                        }, function (err) {
                            if (err) throw err;
                        });
                    }
                });
                
            } catch (err) {
                console.error(err.stack || err);
            }
        }
        
        function fetchForCursor (cursor) {
            
            console.log("Fetch for cursor:", cursor);
            
            SPINE.$.ajax({
                type: "POST",
                url: SPINE.config.baseUrl + "/cloudinary.js",
                data: JSON.stringify({
                    action: "list",
                    cursor: cursor || null
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
                success: function (data) {
                    return insertImages(data);
                },
                failure: function (err) {
                    console.error(err.stack || err);
                }
            });
        }

        fetchForCursor(null);
    }
    

    SPINE.events.on("request.library.sync", function (event) {
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
