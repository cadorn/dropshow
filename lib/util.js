
exports.forSpine = function (SPINE) {
    
    var exports = {};

    exports.makeId = function () {
        return SPINE.UUID.v4();
    }
    
    exports.makeIdForNode = function (node) {
        var parts = [];
        function traverse (node) {
            var id = node.attr("data-id");
            if (id) {
                parts.push(id);
            }
            if (node.parent().length > 0) {
                traverse(node.parent());
            }
        }
        traverse(node);
        parts.reverse();
        return parts.join("/");
    }

    return exports;
}
