
var tag = require('./library.tag');

exports.mount = function (SPINE) {


    function impl (opts) {
        var self = this;
        self.state = SPINE.state;
        SPINE.events.on("changed.state", function () {
            self.update();
        });

    }


    return SPINE.RIOT.mount(tag, {
        impl: impl
    });
}
