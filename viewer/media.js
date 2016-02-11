
var tag = require('./media.tag');


var SPINE = null;

exports.forSpine = function (_SPINE) {
    SPINE = _SPINE;

    var opts = {
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


exports.init = function (self, opts) {

    self.state = SPINE.state;
    SPINE.events.on("changed.state", function () {
        self.update();
    });

    self.url = opts.url;
}
