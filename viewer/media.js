
var tag = require('./media.tag');


var SPINE = null;

exports.mount = function (_SPINE) {
    SPINE = _SPINE;

    return SPINE.RIOT.mount(tag, {
//        impl: impl
    });
}


exports.init = function (self, opts) {

    self.state = SPINE.state;
    SPINE.events.on("changed.state", function () {
        self.update();
    });

    self.url = opts.url;
}
