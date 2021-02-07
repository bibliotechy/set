import { Card } from "./card.js"
import { Stack } from "./stack.js"

class Board{
    in_play: Set<Card> = new Set();
    stack: Stack;

    constructor(stack: Stack) {
        this.stack = stack;
    }

}


export { Board }