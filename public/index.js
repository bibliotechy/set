var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Color;
(function (Color) {
    Color["Red"] = "Red";
    Color["Green"] = "Green";
    Color["Purple"] = "Purple";
})(Color || (Color = {}));
var Shape;
(function (Shape) {
    Shape["Diamond"] = "Diamond";
    Shape["Squiggle"] = "Squiggle";
    Shape["Pill"] = "Pill";
})(Shape || (Shape = {}));
var Count;
(function (Count) {
    Count["One"] = "One";
    Count["Two"] = "Two";
    Count["Three"] = "Three";
})(Count || (Count = {}));
var Fill;
(function (Fill) {
    Fill["Solid"] = "Solid";
    Fill["Shaded"] = "Shaded";
    Fill["Empty"] = "Empty";
})(Fill || (Fill = {}));
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
// Keyboard Nav
//------------//
function keyboardInput(event) {
    var currentEl = document.activeElement;
    if (!currentEl.classList.contains("card")) {
        focusOnFirstCard();
        currentEl = document.activeElement;
    }
    var currentCardIndex = +currentEl.getAttribute("position");
    // PRESS LEFT ARROW
    if (event.keyCode == 37) {
        if (currentCardIndex != 1) {
            var newIndex_1 = "" + (currentCardIndex - 1);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex_1 + "']").focus();
            }, 0);
        }
    }
    // PRESS UP ARROW
    else if (event.keyCode == 38) {
        if (currentCardIndex > 4) {
            var newIndex_2 = "" + (currentCardIndex - 4);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex_2 + "']").focus();
            }, 0);
        }
    }
    // PRESS RIGHT ARROW
    else if (event.keyCode == 39) {
        if (currentCardIndex < lastCardIndex()) {
            var newIndex_3 = "" + (currentCardIndex + 1);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex_3 + "']").focus();
            }, 0);
        }
    }
    // PRESS DOWN ARROW
    else if (event.keyCode == 40) {
        if (currentCardIndex < lastCardIndex() - 3) {
            var newIndex_4 = "" + (currentCardIndex + 4);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex_4 + "']").focus();
            }, 0);
        }
    }
}
// Board Setup
//------------//
var fillSpots = function (stack, board) {
    document.querySelector("#yep-nope").innerHTML = "";
    var currentEmptyCells = allEmptyCells();
    if (currentEmptyCells.length < stack.cards_left()) {
        currentEmptyCells.forEach(function (cell) {
            var card = stack.take_one();
            addCardToCell(cell, card);
            var el = cell;
            var index = el.getAttribute("data-cell-index");
            board[index] = card;
        });
        setCardsLeft();
        focusOnFirstCard();
    }
};
var squiggleSvg = "\n<svg class=\"shape\" viewBox=\"-2 -2 54 104\">\n<path d=\"M39.4,63.4c0,16.1,11,19.9,10.6,28.3c-0.5,8.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-27.3C1,0.1,21.6-3,33.9,6.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z\">\n</path>\n</svg>\n";
var pillSvg = "\n<svg class=\"shape\" viewBox=\"-2 -2 54 104\">\n<path d=\"M25,99.5C14.2,99.5,5.5,90.8,5.5,80V20C5.5,9.2,14.2,0.5,25,0.5S44.5,9.2,44.5,20v60 C44.5,90.8,35.8,99.5,25,99.5z\">\n</path>\n</svg>\n";
var diamondSvg = "\n<svg class=\"shape\" viewBox=\"-2 -2 54 104\">\n<path d=\"M24 0 L48 48 L24 96 L0 48 Z\">\n</path>\n</svg>\n";
var SVG_NS = 'http://www.w3.org/2000/svg';
var shapeSVG = function (shape) {
    switch (shape) {
        case Shape.Squiggle:
            console.log(shape);
            return squiggleSvg;
        case Shape.Diamond:
            return diamondSvg;
        case Shape.Pill:
            return pillSvg;
    }
};
var throwShade = function (color, shape) {
    shape.querySelector("path").setAttributeNS(null, "fill", "url('#shaded-" + color + "')");
};
var drawCard = function (card, position) {
    var spot = +position;
    var cardButton = document.createElement("button");
    cardButton.classList.add("card");
    cardButton.classList.add("hidden");
    cardButton.setAttribute("tabindex", "0");
    cardButton.setAttribute("position", "" + (spot + 1));
    cardButton.setAttribute("role", "button");
    for (var i = 0; i < count_to_num(card.count); i++) {
        cardButton.innerHTML += shapeSVG(card.shape);
    }
    var shapes = cardButton.querySelectorAll(".shape");
    shapes.forEach(function (shape) {
        shape.classList.add("shape");
        shape.classList.add(card.shape);
        shape.classList.add(card.color);
        shape.classList.add(card.fill);
        if (card.fill == Fill.Shaded) {
            throwShade(card.color, shape);
        }
    });
    return cardButton;
};
var addCardToCell = function (cell, card) {
    var position = cell.getAttribute("data-cell-index");
    var cardElement = drawCard(card, position);
    cell.appendChild(cardElement);
    cardElement.classList.remove("hidden");
    cell.classList.remove("empty");
};
// Utils
//---------//
var allEmptyCells = function () {
    return document.querySelectorAll('.cell.empty');
};
var selectedCards = function () {
    return document.querySelectorAll(".card.selected");
};
var incrementSetsFound = function () {
    sets_found += 1;
    document.querySelector("#sets-found").innerHTML = "" + sets_found;
};
var count_to_num = function (c) {
    switch (c) {
        case "One":
            return 1;
        case "Two":
            return 2;
        case "Three":
            return 3;
    }
};
var focusOnFirstCard = function () {
    document.querySelector("[position='1']").focus();
};
var lastCardIndex = function () {
    var allCards = document.querySelectorAll(".card");
    return +allCards[allCards.length - 1].getAttribute("position");
};
var removeAllCards = function () {
    document.querySelectorAll(".card").forEach(function (card) {
        var el = card;
        var cell = el.parentElement;
        cell.classList.add("empty");
        cell.removeChild(el);
    });
};
var handleRestartGame = function () {
    removeAllCards();
    sets_found = 0;
    document.querySelector("#sets-found").innerHTML = "" + sets_found;
    board = [];
    stack = new Stack();
    sets_found = 0;
    fillSpots(stack, board);
};
var handleCheckForAnySets = function () {
    var check = Checker.any_sets(board);
    var text = (check) ? "Yes" : "No";
    document.querySelector("#yep-nope").innerHTML = text;
};
var setCardsLeft = function () {
    document.querySelector("#cards-left").innerHTML = "" + stack.cards_left() + " ";
};
// Main Game Logic here
//----------------------//
var handleCellClick = function (event) {
    // Shoudl handle stopping at three
    var cell = event.target;
    if (cell.classList.contains("shape")) {
        cell = cell.parentElement;
    }
    if (cell.classList.contains("selected")) {
        cell.classList.remove("selected");
    }
    else {
        cell.classList.add("selected");
        var c_1 = [];
        selectedCards().forEach(function (cardElement) {
            return c_1.push(board[cardElement.parentElement.getAttribute("data-cell-index")]);
        });
        if (selectedCards().length == 3) {
            if (Checker.is_set(c_1)) {
                console.log("Yay you found a set");
                selectedCards().forEach(function (cardElement) {
                    cardElement.style.transform = "scale(1.5)";
                    cardElement.style.transform = "scale(0)";
                    cardElement.parentElement.classList.add("empty");
                    setTimeout(function () { return cardElement.parentElement.removeChild(cardElement); }, 1000);
                });
                incrementSetsFound();
                setTimeout(function () { return fillSpots(stack, board); }, 1000);
            }
            else {
                selectedCards().forEach(function (cardElement) { return cardElement.classList.add("shake"); });
                selectedCards().forEach(function (cardElement) { return setTimeout(function () { return cardElement.classList.remove("shake"); }, 500); });
                selectedCards().forEach(function (cardElement) { return cardElement.classList.remove("selected"); });
            }
        }
    }
};
var stack;
var board;
var sets_found;
document.addEventListener('DOMContentLoaded', function (event) {
    board = [];
    stack = new Stack();
    sets_found = 0;
    console.log("Trying to fill the stack!");
    fillSpots(stack, board);
    document.querySelectorAll('.cell').forEach(function (cell) {
        cell.addEventListener('click', handleCellClick);
    });
    document.addEventListener('keydown', keyboardInput);
});
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
document.querySelector('#check-for-sets').addEventListener('click', handleCheckForAnySets);
// document.querySelector('#add-row').addEventListener('click', handleAddRow);
//# sourceMappingURL=index.js.map