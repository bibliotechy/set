import { Card } from "./card"
import { Stack } from "./stack"

class Board{
    in_play: Set<Card> = new Set();
    stack: Stack;

    constructor(stack: Stack) {
        this.stack = stack;
    }

}


export { Board }