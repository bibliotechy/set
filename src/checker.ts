import { Card } from "./card"
import { Color, Shape, Count, Fill } from "./attributes"

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

export { Checker }

