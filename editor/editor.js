
var tag = require('./editor.tag');

exports.mount = function (SPINE) {



    const DOM_OUTLINE = require("../lib/dom-outline").DomOutline;
    var domOutline = DOM_OUTLINE({
        label: "Click to edit",
        onClick: function (element) {
            SPINE.events.trigger("request.edit", {
                el: $(element),
                id: SPINE.UTIL.makeIdForNode($(element))
            });
        },
        filter: '[data-id][data-editable]'
    });
    var running = false;
    function start () {
        running = true;
        domOutline.start();
    }
    function stop () {
        running = false;
        domOutline.stop();
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
            editor = window.CodeMirror.fromTextArea($("textarea#editor").get(0), {
                lineNumbers: true
            });
        });


        var editingContext = null;

        SPINE.events.on("request.edit", function (event) {
            if (
                !event ||
                !event.el
            ) return;
            
            editingContext = event;

            var data = event.el.html();

            editor.doc.setValue(data);

            $.magnificPopup.open({
                items: {
                    src: '#editor-modal'
                },
                type: 'inline',
                preloader: false,
                modal: true,
                callbacks: {
                    open: function() {
                        $('.CodeMirror').each(function(i, el) {
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

            $.magnificPopup.close();
        }
    }



    return SPINE.RIOT.mount(tag, {
        impl: impl
    });
}
