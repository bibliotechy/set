import { Card } from "./card"
import { Board } from "./board"
import { Color, Shape, Count, Fill } from "./attributes"

class Checker{
    
    static is_set (cards: [Card, Card, Card]): Boolean {
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

    static any_sets(board: Board): Boolean {
        return false
    }
}

export { Checker }

