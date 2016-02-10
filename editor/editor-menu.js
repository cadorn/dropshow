
var tag = require('./editor-menu.tag');

exports.mount = function (SPINE) {

    function impl (opts) {
        var self = this;
        self.state = SPINE.state;
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


    return SPINE.RIOT.mount(tag, {
        impl: impl
    });
}
