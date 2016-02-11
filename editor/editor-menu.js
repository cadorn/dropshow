
var tag = require('./editor-menu.tag');

exports.forSpine = function (SPINE) {

    function impl (opts) {
        var self = this;
        self.state = SPINE.state;
        self.config = SPINE.config;
        SPINE.events.on("changed.state", function () {
            self.update();
        });


        self.requestEdit = function () {
            SPINE.events.trigger("request.edit");
        }
        self.requestPresent = function () {
            SPINE.events.trigger("request.present");
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
