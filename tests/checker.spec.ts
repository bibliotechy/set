import { expect } from "chai";
import { Card } from "../card";
import { Color, Shape, Fill, Count } from "../attributes";
import { Checker } from "../checker";
import { Stack } from "../stack";

describe("SetChecker", ()=> {
    let c1 = new Card({shape: Shape.Diamond, color: Color.Red,    count: Count.One,   fill: Fill.Solid})
    let c2 = new Card({shape: Shape.Diamond, color: Color.Red,    count: Count.Two,   fill: Fill.Solid})
    let c3 = new Card({shape: Shape.Diamond, color: Color.Red,    count: Count.Three, fill: Fill.Solid})
    let c4 = new Card({shape: Shape.Diamond, color: Color.Green,  count: Count.One,   fill: Fill.Solid})
    let c5 = new Card({shape: Shape.Pill,    color: Color.Purple, count: Count.One,   fill: Fill.Solid})
    let c6 = new Card({shape: Shape.Pill,    color: Color.Red,    count: Count.One,   fill: Fill.Solid })

    describe("is_set function", ()=> {
        it("returns true when the cards are a set", ()=> {
            expect(Checker.is_set([c1, c2, c3])).to.be.true
        })

        it("returns false when the cards are not a set", ()=> {
            expect(Checker.is_set([c1, c2, c4])).to.be.false 
        })
    })

    describe("any_sets function", ()=> {
        it("when given n cards that contain a set, it does the thing", ()=> {
            let table = [c1,c2,c3,c4,c5, c6]
            expect(Checker.any_sets(table)).to.be.true
        })

        it("when given n cards that do not contain a set, it does the thing", ()=> {
            let table = [c1,c2,c4,c5,c6]
            expect(Checker.any_sets(table)).to.be.false
        })

    })
});
