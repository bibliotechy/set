enum Color { 
    Red    = "Red",
    Green  = "Green", 
    Purple = "Purple"
}

enum Shape { 
    Diamond  = "Diamond", 
    Squiggle = "Squiggle", 
    Pill     = "Pill"
}

enum Count { 
    One   = "One", 
    Two   = "Two", 
    Three = "Three"
}

enum Fill  { 
    Solid  = "Solid", 
    Shaded = "Shaded", 
    Empty  = "Empty"
}

class Card {
    shape: Shape;
    color: Color;
    count: Count;
    fill:  Fill; 

    constructor(attributes: CardParameters) {
        this.shape = attributes.shape;
        this.fill  = attributes.fill;
        this.count = attributes.count;
        this.color = attributes.color;
    }

    attributes(): CardParameters {
        return {
            shape: this.shape,
            color: this.color,
            count: this.count,
            fill:  this.fill
        }
    }
    
    static random(): Card {
        let attrs = {
            shape: randomEnum(Shape),
            color: randomEnum(Color),
            count: randomEnum(Count),
            fill:  randomEnum(Fill)
        }
        return new Card(attrs)
    }
}
interface CardParameters {
    shape: Shape
    color: Color;
    count: Count;
    fill:  Fill; 
}


const randomEnum = (enumeration: any) => {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
}

class Stack {
    cards: Card[] = [];
    constructor(stack_size: number = 81) {
        Object.keys(Color).forEach(color => {
            Object.keys(Shape).forEach(shape => {
                Object.keys(Count).forEach(count => {
                    Object.keys(Fill).forEach(fill => {
                        if (this.cards.length < stack_size) {
                            let card = new Card({color: Color[color as keyof typeof Color], shape: Shape[shape as keyof typeof Shape], count: Count[count as keyof typeof Count], fill: Fill[fill as keyof typeof Fill]})
                            this.cards.push(card)
                        }
                    })
                })
            })
        });
    }

    // Expose the size of the stack at the top level of the object
    cards_left(): number {
        return this.cards.length
    }
    

    take_one(): Card {
        if (this.cards_left() > 0) {
            return this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0]
        }
        else {
            throw new RangeError("This is an empty stack. Cannot take any cards from it")
        }
    }

    take(n: number = 3): Card[] {
        if (n <= this.cards_left()){
            let cards: Card[] = [];
            [...Array(n)].forEach(_ =>{
                cards.push(this.take_one())
            })
            if (cards.length > 0) {
                return cards
            }
            else {
                throw new RangeError("Not enough cards left in the stack to take.")
            }

        }
        else {
            // Do I want to return an error here? Or an empty array?
            throw new RangeError("Not enough cards left in the stack to take.")
        }
    }
}

class Checker{
    
    static is_set (cards: Array<Card>): Boolean {
        let colors: Set<Color> = new Set();
        let shapes: Set<Shape> = new Set();
        let counts: Set<Count> = new Set();
        let fills:  Set<Fill>  = new Set();
        cards.forEach(card => {
            colors.add(card.color)
            counts.add(card.count)
            fills.add(card.fill)
            shapes.add(card.shape)
        }); 
        if ([colors, counts, shapes, fills].some( (set) => set.size == 2)) {
            return false
        }
        return true
    }

    static any_sets(cards: Card[]): Boolean {
        if (cards.length < 3) {
            throw(RangeError("Not enough cards to check for a set"))
        }
        for(let first = 0; cards.length -2 > first; first++) {
            for (let second = first + 1; cards.length -1 > second; second++ ){
                for (let third = second + 1; cards.length > third; third++) {
                    if (Checker.is_set([cards[first], cards[second], cards[third]])) {
                        return true
                    }
                }
            }
        }
        return false
    }
}


// Keyboard Nav
//------------//
function keyboardInput(event: KeyboardEvent) {
    let currentEl = document.activeElement
    if (!currentEl.classList.contains("card")){
        focusOnFirstCard()
        currentEl = document.activeElement
    }

    let currentCardIndex: number = +currentEl.getAttribute("position")

    // PRESS LEFT ARROW
    if (event.keyCode == 37) {
       if (currentCardIndex != 1) {
            let newIndex: string = "" + (currentCardIndex - 1);
            window.setTimeout( function() {
              (document.querySelector("[position='" + newIndex +"']") as HTMLElement).focus()}, 
              0);
       }
    }
    // PRESS UP ARROW
    else if (event.keyCode == 38) {
        if (currentCardIndex > (numberOfCards() / 3)) {
            let newIndex: string = "" + (currentCardIndex - (numberOfCards() /3));
            window.setTimeout( function() {
               (document.querySelector("[position='" + newIndex +"']") as HTMLElement).focus()}, 
               0);
        }
     }

    // PRESS RIGHT ARROW
    else if (event.keyCode == 39) {
        if (currentCardIndex < lastCardIndex() ) {
            let newIndex: string = "" + (currentCardIndex + 1);
            window.setTimeout( function() {
              (document.querySelector("[position='" + newIndex +"']") as HTMLElement).focus()}, 
              0);
       }
    }
    // PRESS DOWN ARROW
    else if (event.keyCode == 40) {
        if (currentCardIndex < lastCardIndex() - (numberOfCards()/3 -1)) {
            let newIndex: string = "" + (currentCardIndex + (numberOfCards()/3));
            window.setTimeout( function() {
               (document.querySelector("[position='" + newIndex +"']") as HTMLElement).focus()}, 
               0);
        }
    }
 }


 // Board Setup
 //------------//

 const fillSpots = function(stack: Stack, board: Array<Card>): void {
    document.querySelector("#yep-nope").innerHTML = ""
    let currentEmptyCells = allEmptyCells()
    if (currentEmptyCells.length < stack.cards_left()) {
        currentEmptyCells.forEach( function(cell) {
            let card = stack.take_one()
            addCardToCell(cell as HTMLElement, card)
            let el = cell as HTMLElement
            let index = el.getAttribute("data-cell-index")
            board[index] = card;
        })

        setCardsLeft();
        focusOnFirstCard() 
    }
}

let squiggleSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M39.4,63.4c0,16.1,11,19.9,10.6,28.3c-0.5,8.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-27.3C1,0.1,21.6-3,33.9,6.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z">
</path>
</svg>
`

let pillSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M25,99.5C14.2,99.5,5.5,90.8,5.5,80V20C5.5,9.2,14.2,0.5,25,0.5S44.5,9.2,44.5,20v60 C44.5,90.8,35.8,99.5,25,99.5z">
</path>
</svg>
`

let diamondSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M24 0 L48 48 L24 96 L0 48 Z">
</path>
</svg>
`
 
const SVG_NS = 'http://www.w3.org/2000/svg';



const shapeSVG = function(shape: Shape): string {
    switch(shape) {
        case Shape.Squiggle:
            console.log(shape)
            return squiggleSvg
        case Shape.Diamond: 
            return diamondSvg
        case Shape.Pill: 
            return pillSvg
    }
}


const throwShade = function(color: Color, shape: HTMLElement) {
    shape.querySelector("path").setAttributeNS(null, "fill", "url('#shaded-" + color + "')")
}

const drawCard = function(card: Card, position: string): HTMLElement {

    let spot: number = +position;

    let cardButton = document.createElement("button")
    cardButton.classList.add("card")
    cardButton.classList.add("hidden")
    cardButton.setAttribute("tabindex", "0")
    cardButton.setAttribute("position", ""+(spot + 1))
    cardButton.setAttribute("role", "button")
    for (let i =  0; i < count_to_num(card.count); i++) {
        cardButton.innerHTML += shapeSVG(card.shape)
    }
    let shapes = cardButton.querySelectorAll(".shape")
    shapes.forEach( shape => {
        shape.classList.add("shape")
        shape.classList.add(card.shape)
        shape.classList.add(card.color)
        shape.classList.add(card.fill)
        if (card.fill == Fill.Shaded) {
            throwShade(card.color, shape as HTMLElement)
        }})

    return cardButton
}

const addCardToCell = function(cell: HTMLElement, card: Card): void {
    let position = cell.getAttribute("data-cell-index")
    let cardElement = drawCard(card, position)
    cell.appendChild(cardElement)
    cardElement.classList.remove("hidden")
    cell.classList.remove("empty")

}


// Utils
//---------//
const allEmptyCells = function(): NodeList {
    return document.querySelectorAll('.cell.empty')
}

const selectedCards = function(): NodeList {
    return document.querySelectorAll(".card.selected")
}


const incrementSetsFound = function() {
    sets_found += 1;
    document.querySelector("#sets-found").innerHTML = ""+sets_found
}


const count_to_num = function(c: Count): number{
    switch (c) {
        case "One":
            return 1
        case "Two":
            return 2
        case "Three":
            return 3
    }
}



const focusOnFirstCard = function() {
    (document.querySelector("[position='1']") as HTMLElement).focus();
}

const allCards = function(): NodeList {
    return document.querySelectorAll(".card")
}

const numberOfCards = function(): number {
    return allCards().length
}

const lastCardIndex = function(): number {
    return +(allCards()[numberOfCards() -1] as HTMLElement).getAttribute("position")
}

const removeAllCards = function(): void {
    document.querySelectorAll(".card").forEach(card => {
        let el = card as HTMLElement
        let cell = el.parentElement
        cell.classList.add("empty")
        cell.removeChild(el)
    })
}


const pushCardsBack = function(): void {
    let cellWithoutCard = document.querySelectorAll(".cell:empty")
    for (let i = 12; i <= 14; i++) {
        
    }
}

const handleAddRow = function(): void{
    let container = document.querySelector(".game--container")
    container.classList.add("extra-column")
    for ( let i = 12; i <= 14; i++) {
        let d = document.createElement('div')
        d.classList.add('cell','empty')
        d.setAttribute('data-cell-index',''+i)
        container.appendChild(d)
    }
    setTimeout(()=> fillSpots(stack, board), 700)
    toggleMoreCardsButton();
    addCellClickHandlers();
    
}

const toggleMoreCardsButton = function(): void {
    document.querySelector("#add-column").toggleAttribute("disabled")
}

const addCellClickHandlers = function(): void {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    })
}

const handleRestartGame = function(): void {
    removeAllCards();
    sets_found = 0;
    document.querySelector("#sets-found").innerHTML = ""+sets_found
    board = []
    stack = new Stack()
    sets_found = 0;
    fillSpots(stack, board);
}

const handleCheckForAnySets = function(){
    let check = Checker.any_sets(board)
    let text = (check) ? "Yes" : "No";
    document.querySelector("#yep-nope").innerHTML = text
}


const setCardsLeft = function(): void {
    document.querySelector("#cards-left").innerHTML = ""+stack.cards_left() + " "
}


// Main Game Logic here
//----------------------//
const handleCellClick = function(event: MouseEvent | KeyboardEvent) {
    // Shoudl handle stopping at three
    let cell = event.target as HTMLElement;
    if (cell.classList.contains("shape")) {
        cell =  cell.parentElement
    }
    if (cell.classList.contains("selected")) {
        cell.classList.remove("selected")
    }
    else {
        cell.classList.add("selected")
        let c: Card[] = []
        selectedCards().forEach(cardElement => 
            c.push(board[(cardElement as HTMLElement).parentElement.getAttribute("data-cell-index")] as Card)          
        )
        
        if (selectedCards().length == 3) {
            if (Checker.is_set(c)) {
                console.log("Yay you found a set")
                selectedCards().forEach( cardElement => {
                    (cardElement as HTMLElement).style.transform = "scale(1.5)";
                    (cardElement as HTMLElement).style.transform = "scale(0)";
                    cardElement.parentElement.classList.add("empty")
                    setTimeout(() => cardElement.parentElement.removeChild(cardElement), 1000)
                    
                })
                incrementSetsFound()
                if (numberOfCards() == 15) {
                    pushCardsBack()
                }
                else {                
                    setTimeout(() => fillSpots(stack, board), 1000)
                }
            }
            else {
                selectedCards().forEach( cardElement => (cardElement as HTMLElement).classList.add("shake") )
                selectedCards().forEach( cardElement => setTimeout(() => (cardElement as HTMLElement).classList.remove("shake"), 500))
                selectedCards().forEach( cardElement => (cardElement as HTMLElement).classList.remove("selected") )
            }
        }
    }
}


let stack: Stack;
let board: Array<Card>;
let sets_found: number;



document.addEventListener('DOMContentLoaded', (event) => {
    board = []
    stack = new Stack()
    sets_found = 0;
    console.log("Trying to fill the stack!")
    fillSpots(stack, board);
    addCellClickHandlers();

    document.addEventListener('keydown', keyboardInput);


        
  })




document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
document.querySelector('#check-for-sets').addEventListener('click', handleCheckForAnySets);
document.querySelector('#add-column').addEventListener('click', handleAddRow);
