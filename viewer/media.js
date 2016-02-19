
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
    
    self.url = "";
    self.id = "";

    function syncOptions () {
        self.id = opts.id;
        if (opts.url) {
            var m = opts.url.match(/(^https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]+)\/(.+?)(\.[^\.]+$)/);
            if (m) {
                //http://res.cloudinary.com/dwghobs3w/image/upload/v1454907540/originals/DSCF2432_1.jpg
                //http://res.cloudinary.com/dwghobs3w/image/upload/h_180,w_275,c_fill,g_center,e_improve/v1/originals/DSCF2432_1
                self.url = m[1] + "w_" + opts.width + ",h_" + opts.height + ",c_fill,g_center,e_improve" + "/v1/" + m[3];
            }
        }
    }

    self.on("update", syncOptions);
    syncOptions();
}
