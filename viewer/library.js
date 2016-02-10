
var tag = require('./library.tag');

exports.mount = function (SPINE) {


    function impl (opts) {
        var self = this;
        self.state = SPINE.state;
        SPINE.events.on("changed.state", function () {
            self.update();
        });

    
        var insertionContext = null;
    
        SPINE.events.on("request.library", function (event) {
            if (
                !event ||
                !event.el
            ) return;
            
            insertionContext = event;
    
            $.magnificPopup.open({
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
                        $("#library-modal").height($(window).height() - 120);
                    }
                }
            });
        });
        
        self.requestClose = function () {
    
console.log("insert", insertionContext);
/*
            var idParts = insertionContext.id.split("/");
            var property = idParts.pop();
            var id = idParts.pop();
            var namespace = idParts.join("/");
    
            SPINE.data.set(namespace, id, property, editor.doc.getValue());
*/
            $.magnificPopup.close();
        }
    }

    return SPINE.RIOT.mount(tag, {
        impl: impl
    });
}
