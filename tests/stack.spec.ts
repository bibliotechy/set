import { expect } from "chai";
import { Card } from "../card";
import { Stack } from "../stack";


function stack (stack_size=81) {
    return new Stack(stack_size)
}

describe("Stack class", ()=> {
    describe("take_one method", function(){
        it("returns a card", ()=> {
            
            expect(stack().take_one()).to.be.instanceof(Card)
        })

        it("returns an error if the stack is empty", ()=> {    
            expect(function() {
                stack(0).take_one()

            }).to.throw(RangeError)
        })
    })
    describe("take method", ()=>{
        it("returns 3 cards by default", ()=> {
            expect(stack().take()).to.have.length(3)
        })

        it("returns an array of the expected length", ()=> {
            expect(stack().take(9)).to.have.length(9)
        })

        it("can return the entire stack", ()=> {
            expect(stack().take(81)).to.have.length(81)
        })

        it("returns an error if it tries to take too many cards", ()=> {
            expect( function() {
                stack().take(82)
            }).to.throw(RangeError)
        })
    })
})