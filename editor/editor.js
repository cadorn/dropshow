
var tag = require('./editor.tag');

exports.forSpine = function (SPINE) {



    var domOutline = SPINE.DOM_OUTLINE({
        label: "Click to edit",
        onClick: function (element) {
            SPINE.events.trigger("request.edit", {
                el: SPINE.$(element),
                id: SPINE.UTIL.makeIdForNode(SPINE.$(element))
            });
        },
        filter: '[data-id][data-editable]',
        requireContent: true
    });
    var running = false;
    function start () {
        if (running) return;
        running = true;
        domOutline.start();
        
        SPINE.$('[data-id][data-editable]').each(function() {
            var el = SPINE.$(this);
            if (!el.html()) {
                return;
            }
            el.addClass("gunshow-editable");
        });
    }
    function stop () {
        if (!running) return;
        running = false;
        domOutline.stop();

        SPINE.$('[data-id][data-editable]').each(function() {
            var el = SPINE.$(this);
            el.removeClass("gunshow-editable");
        });
    }
    SPINE.events.on("changed.dom", function () {
        if (running) {
            // Re-attach outliner to all matched elements as they may have changed.
            stop();
            start();
        }
    });
    SPINE.events.on("changed.state", function () {
        if (SPINE.state.mode === "edit") {
            start();
        } else {
            stop();
        }
    });




    function impl (opts) {
        var self = this;
        self.state = SPINE.state;
        SPINE.events.on("changed.state", function () {
            self.update();
        });


        var editor = null;
        self.on('mount', function() {
            editor = SPINE.CODEMIRROR.fromTextArea(SPINE.$("textarea#editor").get(0), {
                lineNumbers: true
            });
        });


        var editingContext = null;

        SPINE.events.on("request.edit", function (event) {
            if (
                !event ||
                !event.el
            ) return;
            
            stop();
            
            editingContext = event;

            var data = event.el.html();

            editor.doc.setValue(data);

            SPINE.$.magnificPopup.open({
                items: {
                    src: '#editor-modal'
                },
                type: 'inline',
                preloader: false,
                modal: true,
                callbacks: {
                    open: function() {
                        SPINE.$('.CodeMirror').each(function(i, el) {
                            el.CodeMirror.refresh();
                        });
                    }
                }
            });
        });
        
        self.requestClose = function () {
            var idParts = editingContext.id.split("/");
            var property = idParts.pop();
            var id = idParts.pop();
            var namespace = idParts.join("/");

            SPINE.data.set(namespace, id, property, editor.doc.getValue());

            SPINE.$.magnificPopup.close();
            
            SPINE.events.trigger("request.edit");
            
            start();
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
