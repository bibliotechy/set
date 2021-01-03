import { expect } from "chai";
import { Card } from "../card";
import { Color, Shape, Fill, Count } from "../attributes";
import { Checker } from "../checker";

describe("SetChecker", function() {
    let c1 = new Card({shape: Shape.Diamond, color: Color.Red,   count: Count.One,   fill: Fill.Solid})
    let c2 = new Card({shape: Shape.Diamond, color: Color.Red,   count: Count.Two,   fill: Fill.Solid})
    let c3 = new Card({shape: Shape.Diamond, color: Color.Red,   count: Count.Three, fill: Fill.Solid})
    let c4 = new Card({shape: Shape.Diamond, color: Color.Green, count: Count.One,   fill: Fill.Solid})

    it("returns true when the cards are a set", function(){
        expect(Checker.is_set([c1, c2, c3])).to.be.true
    })

    it("returns false when the cards are not a set", function(){
       expect(Checker.is_set([c1, c2, c4])).to.be.false 
    })
  });
