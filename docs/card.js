import { Shape, Color, Count, Fill } from "./attributes.js";
var Card = /** @class */ (function () {
    function Card(attributes) {
        this.shape = attributes.shape;
        this.fill = attributes.fill;
        this.count = attributes.count;
        this.color = attributes.color;
    }
    Card.prototype.attributes = function () {
        return {
            shape: this.shape,
            color: this.color,
            count: this.count,
            fill: this.fill
        };
    };
    Card.random = function () {
        var attrs = {
            shape: randomEnum(Shape),
            color: randomEnum(Color),
            count: randomEnum(Count),
            fill: randomEnum(Fill)
        };
        return new Card(attrs);
    };
    return Card;
}());
var randomEnum = function (enumeration) {
    var values = Object.keys(enumeration);
    var enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
};
export { Card };
//# sourceMappingURL=card.js.map