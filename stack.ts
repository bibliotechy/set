import { Card } from "./card"
import { Color, Shape, Count, Fill } from "./attributes"


class Stack {
    cards: Card[] = [];
    constructor() {
        Object.keys(Color).forEach(color => {
            Object.keys(Shape).forEach(shape => {
                Object.keys(Count).forEach(count => {
                    Object.keys(Fill).forEach(fill => {
                        let card = new Card({color: Color[color], shape: Shape[shape], count: Count[count], fill: Fill[fill]})
                        this.cards.push(card)
                    })
                })
            })
            
        });
    }

    // Expose the size of the stack at the top level of the object
    cards_left = this.cards.length

    take_one(): Card | Error {
        if (this.cards_left > 0) {
            let card = this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0]
        }
        else {
            return new Error("This is an empty stack. Cannot take anny cards from it")
        }
    }

    take(n: number): Card[] | Error {
        if (n < this.cards_left){
            let cards = [];
            [...Array(n)].forEach(i =>{
                cards.push(this.take_one())
            })
    
            return cards
        }
        else {
            // Do I want to return an error here? Or an empty array?
            return new Error("Not enough cards left in the stack to take.")
        }

    }
}

export { Stack }