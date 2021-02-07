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

const emptyCells = function(): NodeList {
    return document.querySelectorAll('.cell.empty')
}

const selectedCards = function(): NodeList {
    return document.querySelectorAll(".card.selected")
}

const drawCard = function(card: Card): HTMLElement {

    let div = document.createElement("div")
    div.classList.add("card")
    div.classList.add("hidden")
    for (const _ in Array(count_to_num(card.count)).fill("")) {
        let shape = document.createElement("div")
        shape.classList.add("shape")
        shape.classList.add(card.shape)
        shape.classList.add(card.color)
        shape.classList.add(card.fill)
        shape.setAttribute("fill", card.fill)
        div.appendChild(shape)
        let inner = document.createElement('div')
        inner.classList.add("inner")
        shape.appendChild(inner)
    }

    return div
}

const incrementSetsFound = function() {
    sets_found += 1;
    document.querySelector("#sets-found").innerHTML = ""+sets_found
}


const count_to_num = function(c: Count){
    switch (c) {
        case "One":
            return 1
        case "Two":
            return 2
        case "Three":
            return 3
    }
}



const addCardToCell = function(cell: HTMLElement, card: Card): void {
    let cardElement = drawCard(card)
    cell.appendChild(cardElement)
    cardElement.classList.remove("hidden")
    cell.classList.remove("empty")

}

const fillSpots = function(stack: Stack, board: Array<Card>): void {
    document.querySelector("#yep-nope").innerHTML = ""
    let currentEmptyCells = emptyCells()
    if (currentEmptyCells.length < stack.cards_left()) {
        currentEmptyCells.forEach( function(cell) {
            let card = stack.take_one()
            addCardToCell(cell as HTMLElement, card)
            let el = cell as HTMLElement
            let index = el.getAttribute("data-cell-index")
            board[index] = card;
        })
    }
}

const removeAllCards = function(): void {
    document.querySelectorAll(".card").forEach(card => {
        let el = card as HTMLElement
        let cell = el.parentElement
        cell.classList.add("empty")
        cell.removeChild(el)
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


const handleCellClick = function(event: MouseEvent) {
    // Shoudl handle stopping at three
    let cell = event.target as HTMLElement;
    if (cell.className.includes("shape")) {
        cell =  cell.parentElement
    }
    if (cell.classList.contains("selected")) {
        cell.classList.remove("selected")
    }
    else {
        cell.classList.add("selected")
        let c: Array<Card> = []
        setTimeout(() => selectedCards().forEach(cardElement => 
            c.push(board[(cardElement as HTMLElement).parentElement.getAttribute("data-cell-index")] as Card)          
        ), 1000)
        
        
        if (selectedCards().length == 3) {
            if (Checker.is_set(c)) {
                console.log("Yay you found a set")
                selectedCards().forEach( cardElement => {
                    (cardElement as HTMLElement).style.transform = "scale(0)"
                    cardElement.parentElement.classList.add("empty")
                    setTimeout(() => cardElement.parentElement.removeChild(cardElement), 1000)
                    
                })
                incrementSetsFound()
                setTimeout(() => fillSpots(stack, board), 1000)
            }
            else {
                console.log("nope");
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
    
    document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));

  })




document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
document.querySelector('#check-for-sets').addEventListener('click', handleCheckForAnySets);