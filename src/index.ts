import A11yDialog from 'a11y-dialog'
import { Color,Shape, Fill, Count} from "./attributes"
import { Card } from './card';
import { Stack} from "./stack"
import { Checker} from "./checker"
import {shapeSVG} from "./svg"


// Keyboard Nav
//------------//
function keyboardInput(event: KeyboardEvent) {
    let currentEl = document.activeElement
    let numRows = getNumberOfRows()
    let numCards = numberOfCards() 
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
        if (currentCardIndex > (numCards / numRows)) {
            let newIndex: string = "" + (currentCardIndex - (numCards /numRows));
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
        if (currentCardIndex < lastCardIndex() - (numCards/numRows -1)) {
            let newIndex: string = "" + (currentCardIndex + (numCards/numRows));
            window.setTimeout( function() {
               (document.querySelector("[position='" + newIndex +"']") as HTMLElement).focus()}, 
               0);
        }
    }
 }

 const getNumberOfRows = function () : number {
     const gc = document.querySelector(".game--container")
     const gtc = getComputedStyle(gc).getPropertyValue('grid-template-rows')
     let perRow = gtc.split(" ").length
    return perRow
 }


 // Board Setup
 //------------//

 const fillSpots = function(stack: Stack, board: Array<Card>): void {
    
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


const throwShade = function(color: Color, shape: HTMLElement) {
    shape.querySelector("path").setAttributeNS(null, "fill", "url('#shaded-" + color + "')")
}

const drawCard = function(card: Card, position: string): HTMLElement {

    let spot: number = +position;

    let cardButton = document.createElement("button")
    cardButton.classList.add("card")
    cardButton.classList.add("hidden")
    cardButton.classList.add(card.count)
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
    //debugger
    let extras = [12, 13, 14]
        .map((n) => document.querySelector("[data-cell-index='" + n +  "']"))
    const empty_extras = extras.filter((node) => node.classList?.contains("empty"))
    empty_extras.forEach((node) => node.parentElement.removeChild(node))
    
    extras = extras.filter((node) => {
        if (!node.classList?.contains("empty")) 
            return node
        })

    
    
    for (let i = 0; i < 12; i++) {
        let node = document.querySelector("[data-cell-index='" + i+  "']")
        if (node.classList?.contains("empty")) {
            let last = extras.pop()
            node.classList.remove("empty")
            node.innerHTML = last.innerHTML
            let card = node.querySelector("button.card")
            card.setAttribute("position", String(i+1))
            last.parentElement.removeChild(last)
        }
    }
    document.querySelector(".game--container").classList.remove("extra-column")
    toggleMoreCardsButton()
}

const handleAddThreeCards = function(): void{
    let container = document.querySelector(".game--container")
    container.classList.add("extra-column")
    for ( let i = 12; i <= 14; i++) {
        let d = document.createElement('div')
        d.classList.add('cell','empty')
        d.setAttribute('data-cell-index',String(i))
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
    ensureOnly12Cards()
    fillSpots(stack, board);
}

const handleCheckForAnySets = function(){
    let check = Checker.any_sets(board)
    let text = (check) ? "There is at least one set on the board." : "There are no sets on the board. Add some cards.";
    const yepNope = document.querySelector("#any-sets")
    yepNope.innerHTML = text

}

const ensureOnly12Cards = function() {
    ["12","13", "14"].forEach((number) => {
        document.querySelector(`[data-cell-index='${number}']`)?.remove()
    })
    document.querySelector(".game--container").classList.remove("extra-column")
    toggleMoreCardsButton()
    
} 



const setCardsLeft = function(): void {
    document.querySelector("#cards-left").innerHTML = ""+stack.cards_left() + " "
}

// Color change logic
const handleColorChange = function(event : Event, color: string): void {
    const currentElem = event.target as HTMLInputElement;
    const hex = currentElem.value
    var colorStyle = document.getElementById("colorStyle");
    colorStyle.append("." + color +".Solid { fill: " + hex+ "} ." + color + "{stroke: "  + hex +  "}");
    document.getElementById("shaded-"+ color +"-path").setAttribute("style","stroke:" + hex +"; stroke-width:1")
}

const handleRedColorChange = function(event: Event) {
    handleColorChange(event, "Red")
}

const handleGreenColorChange = function(event: Event) {
    handleColorChange(event, "Green")
}

const handlePurpleColorChange = function(event: Event) {
    handleColorChange(event, "Purple")
}


// Main Game Logic here
//----------------------//
const handleCellClick = function(event: MouseEvent | KeyboardEvent| TouchEvent) {
    // Should handle stopping at three
    let cell = event.target as HTMLElement;
    if (cell.classList.contains("shape")) {
        cell =  cell.parentElement
    }

    if (cell.tagName == "path") {
        cell =  cell.parentElement.parentElement
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
                selectedCards().forEach( cardElement => {
                    (cardElement as HTMLElement).style.transform = "scale(1.5)";
                    (cardElement as HTMLElement).style.transform = "scale(0)";
                    cardElement.parentElement.classList.add("empty")
                    setTimeout(() => cardElement.parentElement.removeChild(cardElement), 200)
                    
                })
                incrementSetsFound()
                if (numberOfCards() == 15) {
                    setTimeout(() => pushCardsBack(), 1000)
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
    fillSpots(stack, board);
    addCellClickHandlers();
    screen.orientation.lock("portrait")

    document.addEventListener('keydown', keyboardInput);
    
    const helpDialog   = new A11yDialog(document.getElementById('help-dialog'))
    helpDialog.on("hide", () => handleDialogClose(event))
    const colorDialog = new A11yDialog(document.getElementById('color-dialog'))
    colorDialog.on("hide", () => handleDialogClose(event))
    const checkDialog = new A11yDialog(document.getElementById('check-dialog'))
    checkDialog.on("hide", () => handleDialogClose(event))    
  })


function handleDialogClose(event: Event) {
    (document.querySelector(".game--container button:nth-of-type(1)") as HTMLElement).focus()
}

document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
document.querySelector('#check-for-sets').addEventListener('click', handleCheckForAnySets);
document.querySelector('#add-column').addEventListener('click', handleAddThreeCards);
document.getElementById("red-color-selector").addEventListener("input", handleRedColorChange);
document.getElementById("green-color-selector").addEventListener("input", handleGreenColorChange);
document.getElementById("purple-color-selector").addEventListener("input", handlePurpleColorChange);
