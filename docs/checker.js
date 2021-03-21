var Checker = /** @class */ (function () {
    function Checker() {
    }
    Checker.is_set = function (cards) {
        var colors = new Set();
        var shapes = new Set();
        var counts = new Set();
        var fills = new Set();
        cards.forEach(function (card) {
            colors.add(card.color);
            counts.add(card.count);
            fills.add(card.fill);
            shapes.add(card.shape);
        });
        if ([colors, counts, shapes, fills].some(function (set) { return set.size == 2; })) {
            return false;
        }
        return true;
    };
    Checker.any_sets = function (cards) {
        if (cards.length < 3) {
            throw (RangeError("Not enough cards to check for a set"));
        }
        for (var first = 0; cards.length - 2 > first; first++) {
            for (var second = first + 1; cards.length - 1 > second; second++) {
                for (var third = second + 1; cards.length > third; third++) {
                    if (Checker.is_set([cards[first], cards[second], cards[third]])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    return Checker;
}());
export { Checker };
//# sourceMappingURL=checker.js.map