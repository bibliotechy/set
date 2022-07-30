var focusableSelectors = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
];

var TAB_KEY = 9;
var ESCAPE_KEY = 27;

/**
 * Define the constructor to instantiate a dialog
 *
 * @constructor
 * @param {Element} element
 */
function A11yDialog(element) {
  // Prebind the functions that will be bound in addEventListener and
  // removeEventListener to avoid losing references
  this._show = this.show.bind(this);
  this._hide = this.hide.bind(this);
  this._maintainFocus = this._maintainFocus.bind(this);
  this._bindKeypress = this._bindKeypress.bind(this);

  this.$el = element;
  this.shown = false;
  this._id = this.$el.getAttribute('data-a11y-dialog') || this.$el.id;
  this._previouslyFocused = null;
  this._listeners = {};

  // Initialise everything needed for the dialog to work properly
  this.create();
}

/**
 * Set up everything necessary for the dialog to be functioning
 *
 * @param {(NodeList | Element | string)} targets
 * @return {this}
 */
A11yDialog.prototype.create = function () {
  this.$el.setAttribute('aria-hidden', true);
  this.$el.setAttribute('aria-modal', true);
  this.$el.setAttribute('tabindex', -1);

  if (!this.$el.hasAttribute('role')) {
    this.$el.setAttribute('role', 'dialog');
  }

  // Keep a collection of dialog openers, each of which will be bound a click
  // event listener to open the dialog
  this._openers = $$('[data-a11y-dialog-show="' + this._id + '"]');
  this._openers.forEach(
    function (opener) {
      opener.addEventListener('click', this._show);
    }.bind(this)
  );

  // Keep a collection of dialog closers, each of which will be bound a click
  // event listener to close the dialog
  this._closers = $$('[data-a11y-dialog-hide]', this.$el).concat(
    $$('[data-a11y-dialog-hide="' + this._id + '"]')
  );
  this._closers.forEach(
    function (closer) {
      closer.addEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `create` event
  this._fire('create');

  return this
};

/**
 * Show the dialog element, disable all the targets (siblings), trap the
 * current focus within it, listen for some specific key presses and fire all
 * registered callbacks for `show` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.show = function (event) {
  // If the dialog is already open, abort
  if (this.shown) {
    return this
  }

  // Keep a reference to the currently focused element to be able to restore
  // it later
  this._previouslyFocused = document.activeElement;
  this.$el.removeAttribute('aria-hidden');
  this.shown = true;

  // Set the focus to the dialog element
  moveFocusToDialog(this.$el);

  // Bind a focus event listener to the body element to make sure the focus
  // stays trapped inside the dialog while open, and start listening for some
  // specific key presses (TAB and ESC)
  document.body.addEventListener('focus', this._maintainFocus, true);
  document.addEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `show` event
  this._fire('show', event);

  return this
};

/**
 * Hide the dialog element, enable all the targets (siblings), restore the
 * focus to the previously active element, stop listening for some specific
 * key presses and fire all registered callbacks for `hide` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.hide = function (event) {
  // If the dialog is already closed, abort
  if (!this.shown) {
    return this
  }

  this.shown = false;
  this.$el.setAttribute('aria-hidden', 'true');

  // If there was a focused element before the dialog was opened (and it has a
  // `focus` method), restore the focus back to it
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
  if (this._previouslyFocused && this._previouslyFocused.focus) {
    this._previouslyFocused.focus();
  }

  // Remove the focus event listener to the body element and stop listening
  // for specific key presses
  document.body.removeEventListener('focus', this._maintainFocus, true);
  document.removeEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `hide` event
  this._fire('hide', event);

  return this
};

/**
 * Destroy the current instance (after making sure the dialog has been hidden)
 * and remove all associated listeners from dialog openers and closers
 *
 * @return {this}
 */
A11yDialog.prototype.destroy = function () {
  // Hide the dialog to avoid destroying an open instance
  this.hide();

  // Remove the click event listener from all dialog openers
  this._openers.forEach(
    function (opener) {
      opener.removeEventListener('click', this._show);
    }.bind(this)
  );

  // Remove the click event listener from all dialog closers
  this._closers.forEach(
    function (closer) {
      closer.removeEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `destroy` event
  this._fire('destroy');

  // Keep an object of listener types mapped to callback functions
  this._listeners = {};

  return this
};

/**
 * Register a new callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.on = function (type, handler) {
  if (typeof this._listeners[type] === 'undefined') {
    this._listeners[type] = [];
  }

  this._listeners[type].push(handler);

  return this
};

/**
 * Unregister an existing callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.off = function (type, handler) {
  var index = (this._listeners[type] || []).indexOf(handler);

  if (index > -1) {
    this._listeners[type].splice(index, 1);
  }

  return this
};

/**
 * Iterate over all registered handlers for given type and call them all with
 * the dialog element as first argument, event as second argument (if any). Also
 * dispatch a custom event on the DOM element itself to make it possible to
 * react to the lifecycle of auto-instantiated dialogs.
 *
 * @access private
 * @param {string} type
 * @param {CustomEvent} event
 */
A11yDialog.prototype._fire = function (type, event) {
  var listeners = this._listeners[type] || [];
  var domEvent = new CustomEvent(type, { detail: event });

  this.$el.dispatchEvent(domEvent);

  listeners.forEach(
    function (listener) {
      listener(this.$el, event);
    }.bind(this)
  );
};

/**
 * Private event handler used when listening to some specific key presses
 * (namely ESCAPE and TAB)
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._bindKeypress = function (event) {
  // This is an escape hatch in case there are nested dialogs, so the keypresses
  // are only reacted to for the most recent one
  if (!this.$el.contains(document.activeElement)) return

  // If the dialog is shown and the ESCAPE key is being pressed, prevent any
  // further effects from the ESCAPE key and hide the dialog, unless its role
  // is 'alertdialog', which should be modal
  if (
    this.shown &&
    event.which === ESCAPE_KEY &&
    this.$el.getAttribute('role') !== 'alertdialog'
  ) {
    event.preventDefault();
    this.hide(event);
  }

  // If the dialog is shown and the TAB key is being pressed, make sure the
  // focus stays trapped within the dialog element
  if (this.shown && event.which === TAB_KEY) {
    trapTabKey(this.$el, event);
  }
};

/**
 * Private event handler used when making sure the focus stays within the
 * currently open dialog
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._maintainFocus = function (event) {
  // If the dialog is shown and the focus is not within a dialog element (either
  // this one or another one in case of nested dialogs) or within an element
  // with the `data-a11y-dialog-focus-trap-ignore` attribute, move it back to
  // its first focusable child.
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/177
  if (
    this.shown &&
    !event.target.closest('[aria-modal="true"]') &&
    !event.target.closest('[data-a11y-dialog-ignore-focus-trap]')
  ) {
    moveFocusToDialog(this.$el);
  }
};

/**
 * Convert a NodeList into an array
 *
 * @param {NodeList} collection
 * @return {Array<Element>}
 */
function toArray(collection) {
  return Array.prototype.slice.call(collection)
}

/**
 * Query the DOM for nodes matching the given selector, scoped to context (or
 * the whole document)
 *
 * @param {String} selector
 * @param {Element} [context = document]
 * @return {Array<Element>}
 */
function $$(selector, context) {
  return toArray((context || document).querySelectorAll(selector))
}

/**
 * Set the focus to the first element with `autofocus` with the element or the
 * element itself
 *
 * @param {Element} node
 */
function moveFocusToDialog(node) {
  var focused = node.querySelector('[autofocus]') || node;

  focused.focus();
}

/**
 * Get the focusable children of the given element
 *
 * @param {Element} node
 * @return {Array<Element>}
 */
function getFocusableChildren(node) {
  return $$(focusableSelectors.join(','), node).filter(function (child) {
    return !!(
      child.offsetWidth ||
      child.offsetHeight ||
      child.getClientRects().length
    )
  })
}

/**
 * Trap the focus inside the given element
 *
 * @param {Element} node
 * @param {Event} event
 */
function trapTabKey(node, event) {
  var focusableChildren = getFocusableChildren(node);
  var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

  // If the SHIFT key is being pressed while tabbing (moving backwards) and
  // the currently focused item is the first one, move the focus to the last
  // focusable item from the dialog element
  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren[focusableChildren.length - 1].focus();
    event.preventDefault();
    // If the SHIFT key is not being pressed (moving forwards) and the currently
    // focused item is the last one, move the focus to the first focusable item
    // from the dialog element
  } else if (
    !event.shiftKey &&
    focusedItemIndex === focusableChildren.length - 1
  ) {
    focusableChildren[0].focus();
    event.preventDefault();
  }
}

function instantiateDialogs() {
  $$('[data-a11y-dialog]').forEach(function (node) {
    new A11yDialog(node);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instantiateDialogs);
  } else {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(instantiateDialogs);
    } else {
      window.setTimeout(instantiateDialogs, 16);
    }
  }
}

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

class Card {
    constructor(attributes) {
        this.shape = attributes.shape;
        this.fill = attributes.fill;
        this.count = attributes.count;
        this.color = attributes.color;
    }
    attributes() {
        return {
            shape: this.shape,
            color: this.color,
            count: this.count,
            fill: this.fill
        };
    }
    static random() {
        let attrs = {
            shape: randomEnum(Shape),
            color: randomEnum(Color),
            count: randomEnum(Count),
            fill: randomEnum(Fill)
        };
        return new Card(attrs);
    }
}
const randomEnum = (enumeration) => {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
};

class Stack {
    constructor(stack_size = 81) {
        this.cards = [];
        Object.keys(Color).forEach(color => {
            Object.keys(Shape).forEach(shape => {
                Object.keys(Count).forEach(count => {
                    Object.keys(Fill).forEach(fill => {
                        if (this.cards.length < stack_size) {
                            let card = new Card({ color: Color[color], shape: Shape[shape], count: Count[count], fill: Fill[fill] });
                            this.cards.push(card);
                        }
                    });
                });
            });
        });
    }
    // Expose the size of the stack at the top level of the object
    cards_left() {
        return this.cards.length;
    }
    take_one() {
        if (this.cards_left() > 0) {
            return this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0];
        }
        else {
            throw new RangeError("This is an empty stack. Cannot take any cards from it");
        }
    }
    take(n = 3) {
        if (n <= this.cards_left()) {
            let cards = [];
            [...Array(n)].forEach(_ => {
                cards.push(this.take_one());
            });
            if (cards.length > 0) {
                return cards;
            }
            else {
                throw new RangeError("Not enough cards left in the stack to take.");
            }
        }
        else {
            // Do I want to return an error here? Or an empty array?
            throw new RangeError("Not enough cards left in the stack to take.");
        }
    }
}

class Checker {
    static is_set(cards) {
        let colors = new Set();
        let shapes = new Set();
        let counts = new Set();
        let fills = new Set();
        cards.forEach(card => {
            colors.add(card.color);
            counts.add(card.count);
            fills.add(card.fill);
            shapes.add(card.shape);
        });
        if ([colors, counts, shapes, fills].some((set) => set.size == 2)) {
            return false;
        }
        return true;
    }
    static any_sets(cards) {
        if (cards.length < 3) {
            throw (RangeError("Not enough cards to check for a set"));
        }
        for (let first = 0; cards.length - 2 > first; first++) {
            for (let second = first + 1; cards.length - 1 > second; second++) {
                for (let third = second + 1; cards.length > third; third++) {
                    if (Checker.is_set([cards[first], cards[second], cards[third]])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

let squiggleSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M39.4,63.4c0,16.1,11,19.9,10.6,28.3c-0.5,8.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-27.3C1,0.1,21.6-3,33.9,6.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z">
</path>
</svg>
`;
let pillSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M25,99.5C14.2,99.5,5.5,90.8,5.5,80V20C5.5,9.2,14.2,0.5,25,0.5S44.5,9.2,44.5,20v60 C44.5,90.8,35.8,99.5,25,99.5z">
</path>
</svg>
`;
let diamondSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M24 0 L48 48 L24 96 L0 48 Z">
</path>
</svg>
`;
const shapeSVG = function (shape) {
    switch (shape) {
        case Shape.Squiggle:
            return squiggleSvg;
        case Shape.Diamond:
            return diamondSvg;
        case Shape.Pill:
            return pillSvg;
    }
};

// Keyboard Nav
//------------//
function keyboardInput(event) {
    let currentEl = document.activeElement;
    let numRows = getNumberOfRows();
    let numCards = numberOfCards();
    let currentCardIndex = +currentEl.getAttribute("position");
    // PRESS LEFT ARROW
    if (event.keyCode == 37) {
        if (currentCardIndex != 1) {
            let newIndex = "" + (currentCardIndex - 1);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex + "']").focus();
            }, 0);
        }
    }
    // PRESS UP ARROW
    else if (event.keyCode == 38) {
        if (currentCardIndex > (numCards / numRows)) {
            let newIndex = "" + (currentCardIndex - (numCards / numRows));
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex + "']").focus();
            }, 0);
        }
    }
    // PRESS RIGHT ARROW
    else if (event.keyCode == 39) {
        if (currentCardIndex < lastCardIndex()) {
            let newIndex = "" + (currentCardIndex + 1);
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex + "']").focus();
            }, 0);
        }
    }
    // PRESS DOWN ARROW
    else if (event.keyCode == 40) {
        if (currentCardIndex < lastCardIndex() - (numCards / numRows - 1)) {
            let newIndex = "" + (currentCardIndex + (numCards / numRows));
            window.setTimeout(function () {
                document.querySelector("[position='" + newIndex + "']").focus();
            }, 0);
        }
    }
}
const getNumberOfRows = function () {
    const gc = document.querySelector(".game--container");
    const gtc = getComputedStyle(gc).getPropertyValue('grid-template-rows');
    let perRow = gtc.split(" ").length;
    return perRow;
};
// Board Setup
//------------//
const fillSpots = function (stack, board) {
    document.querySelector("#yep-nope").innerHTML = "";
    let currentEmptyCells = allEmptyCells();
    if (currentEmptyCells.length < stack.cards_left()) {
        currentEmptyCells.forEach(function (cell) {
            let card = stack.take_one();
            addCardToCell(cell, card);
            let el = cell;
            let index = el.getAttribute("data-cell-index");
            board[index] = card;
        });
        setCardsLeft();
        focusOnFirstCard();
    }
};
const throwShade = function (color, shape) {
    shape.querySelector("path").setAttributeNS(null, "fill", "url('#shaded-" + color + "')");
};
const drawCard = function (card, position) {
    let spot = +position;
    let cardButton = document.createElement("button");
    cardButton.classList.add("card");
    cardButton.classList.add("hidden");
    cardButton.classList.add(card.count);
    cardButton.setAttribute("tabindex", "0");
    cardButton.setAttribute("position", "" + (spot + 1));
    cardButton.setAttribute("role", "button");
    for (let i = 0; i < count_to_num(card.count); i++) {
        cardButton.innerHTML += shapeSVG(card.shape);
    }
    let shapes = cardButton.querySelectorAll(".shape");
    shapes.forEach(shape => {
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
const addCardToCell = function (cell, card) {
    let position = cell.getAttribute("data-cell-index");
    let cardElement = drawCard(card, position);
    cell.appendChild(cardElement);
    cardElement.classList.remove("hidden");
    cell.classList.remove("empty");
};
// Utils
//---------//
const allEmptyCells = function () {
    return document.querySelectorAll('.cell.empty');
};
const selectedCards = function () {
    return document.querySelectorAll(".card.selected");
};
const incrementSetsFound = function () {
    sets_found += 1;
    document.querySelector("#sets-found").innerHTML = "" + sets_found;
};
const count_to_num = function (c) {
    switch (c) {
        case "One":
            return 1;
        case "Two":
            return 2;
        case "Three":
            return 3;
    }
};
const focusOnFirstCard = function () {
    document.querySelector("[position='1']").focus();
};
const allCards = function () {
    return document.querySelectorAll(".card");
};
const numberOfCards = function () {
    return allCards().length;
};
const lastCardIndex = function () {
    return +allCards()[numberOfCards() - 1].getAttribute("position");
};
const removeAllCards = function () {
    document.querySelectorAll(".card").forEach(card => {
        let el = card;
        let cell = el.parentElement;
        cell.classList.add("empty");
        cell.removeChild(el);
    });
};
const pushCardsBack = function () {
    var _a;
    //debugger
    let extras = [12, 13, 14]
        .map((n) => document.querySelector("[data-cell-index='" + n + "']"));
    const empty_extras = extras.filter((node) => { var _a; return (_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains("empty"); });
    empty_extras.forEach((node) => node.parentElement.removeChild(node));
    extras = extras.filter((node) => {
        var _a;
        if (!((_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains("empty")))
            return node;
    });
    for (let i = 0; i < 12; i++) {
        let node = document.querySelector("[data-cell-index='" + i + "']");
        if ((_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains("empty")) {
            let last = extras.pop();
            node.classList.remove("empty");
            node.innerHTML = last.innerHTML;
            let card = node.querySelector("button.card");
            card.setAttribute("position", String(i + 1));
            last.parentElement.removeChild(last);
        }
    }
    document.querySelector(".game--container").classList.remove("extra-column");
    toggleMoreCardsButton();
};
const handleAddThreeCards = function () {
    let container = document.querySelector(".game--container");
    container.classList.add("extra-column");
    for (let i = 12; i <= 14; i++) {
        let d = document.createElement('div');
        d.classList.add('cell', 'empty');
        d.setAttribute('data-cell-index', String(i));
        container.appendChild(d);
    }
    setTimeout(() => fillSpots(stack, board), 700);
    toggleMoreCardsButton();
    addCellClickHandlers();
};
const toggleMoreCardsButton = function () {
    document.querySelector("#add-column").toggleAttribute("disabled");
};
const addCellClickHandlers = function () {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
};
const handleRestartGame = function () {
    removeAllCards();
    sets_found = 0;
    document.querySelector("#sets-found").innerHTML = "" + sets_found;
    board = [];
    stack = new Stack();
    sets_found = 0;
    fillSpots(stack, board);
};
const handleCheckForAnySets = function () {
    let check = Checker.any_sets(board);
    let text = (check) ? "Yes" : "No";
    document.querySelector("#yep-nope").innerHTML = text;
};
const setCardsLeft = function () {
    document.querySelector("#cards-left").innerHTML = "" + stack.cards_left() + " ";
};
// Color change logic
const handleColorChange = function (event, color) {
    const currentElem = event.target;
    const hex = currentElem.value;
    var colorStyle = document.getElementById("colorStyle");
    colorStyle.append("." + color + ".Solid { fill: " + hex + "} ." + color + "{stroke: " + hex + "}");
    document.getElementById("shaded-" + color + "-path").setAttribute("style", "stroke:" + hex + "; stroke-width:1");
};
const handleRedColorChange = function (event) {
    handleColorChange(event, "Red");
};
const handleGreenColorChange = function (event) {
    handleColorChange(event, "Green");
};
const handlePurpleColorChange = function (event) {
    handleColorChange(event, "Purple");
};
// Main Game Logic here
//----------------------//
const handleCellClick = function (event) {
    // Shoudl handle stopping at three
    let cell = event.target;
    if (cell.classList.contains("shape")) {
        cell = cell.parentElement;
    }
    if (cell.classList.contains("selected")) {
        cell.classList.remove("selected");
    }
    else {
        cell.classList.add("selected");
        let c = [];
        selectedCards().forEach(cardElement => c.push(board[cardElement.parentElement.getAttribute("data-cell-index")]));
        if (selectedCards().length == 3) {
            if (Checker.is_set(c)) {
                console.log("Yay you found a set");
                selectedCards().forEach(cardElement => {
                    cardElement.style.transform = "scale(1.5)";
                    cardElement.style.transform = "scale(0)";
                    cardElement.parentElement.classList.add("empty");
                    setTimeout(() => cardElement.parentElement.removeChild(cardElement), 200);
                });
                incrementSetsFound();
                if (numberOfCards() == 15) {
                    setTimeout(() => pushCardsBack(), 1000);
                }
                else {
                    setTimeout(() => fillSpots(stack, board), 1000);
                }
            }
            else {
                selectedCards().forEach(cardElement => cardElement.classList.add("shake"));
                selectedCards().forEach(cardElement => setTimeout(() => cardElement.classList.remove("shake"), 500));
                selectedCards().forEach(cardElement => cardElement.classList.remove("selected"));
            }
        }
    }
};
let stack;
let board;
let sets_found;
document.addEventListener('DOMContentLoaded', (event) => {
    board = [];
    stack = new Stack();
    sets_found = 0;
    console.log("Trying to fill the stack!");
    fillSpots(stack, board);
    addCellClickHandlers();
    document.addEventListener('keydown', keyboardInput);
    new A11yDialog(document.getElementById('help-dialog'));
    new A11yDialog(document.getElementById('color-dialog'));
});
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
document.querySelector('#check-for-sets').addEventListener('click', handleCheckForAnySets);
document.querySelector('#add-column').addEventListener('click', handleAddThreeCards);
document.getElementById("red-color-selector").addEventListener("input", handleRedColorChange);
document.getElementById("green-color-selector").addEventListener("input", handleGreenColorChange);
document.getElementById("purple-color-selector").addEventListener("input", handlePurpleColorChange);
//# sourceMappingURL=index.js.map
