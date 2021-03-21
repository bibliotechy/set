var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Card } from "./card.js";
import { Color, Shape, Count, Fill } from "./attributes.js";
var Stack = /** @class */ (function () {
    function Stack(stack_size) {
        var _this = this;
        if (stack_size === void 0) { stack_size = 81; }
        this.cards = [];
        Object.keys(Color).forEach(function (color) {
            Object.keys(Shape).forEach(function (shape) {
                Object.keys(Count).forEach(function (count) {
                    Object.keys(Fill).forEach(function (fill) {
                        if (_this.cards.length < stack_size) {
                            var card = new Card({ color: Color[color], shape: Shape[shape], count: Count[count], fill: Fill[fill] });
                            _this.cards.push(card);
                        }
                    });
                });
            });
        });
    }
    // Expose the size of the stack at the top level of the object
    Stack.prototype.cards_left = function () {
        return this.cards.length;
    };
    Stack.prototype.take_one = function () {
        if (this.cards_left() > 0) {
            return this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0];
        }
        else {
            throw new RangeError("This is an empty stack. Cannot take any cards from it");
        }
    };
    Stack.prototype.take = function (n) {
        var _this = this;
        if (n === void 0) { n = 3; }
        if (n <= this.cards_left()) {
            var cards_1 = [];
            __spreadArrays(Array(n)).forEach(function (_) {
                cards_1.push(_this.take_one());
            });
            if (cards_1.length > 0) {
                return cards_1;
            }
            else {
                throw new RangeError("Not enough cards left in the stack to take.");
            }
        }
        else {
            // Do I want to return an error here? Or an empty array?
            throw new RangeError("Not enough cards left in the stack to take.");
        }
    };
    return Stack;
}());
export { Stack };
//# sourceMappingURL=stack.js.map