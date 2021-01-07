var expect    = require("chai").expect;
var card = require("../card");
var attributes = require("../attributes") 

describe("Card", ()=> {
    describe("has expected attributes", ()=> {
        let c = new card.Card({shape: attributes.Shape.Diamond, color: attributes.Color.Red, count: attributes.Count.One, fill: attributes.Fill.Solid})
        it("has a color attribute", ()=> {
            expect(c).to.haveOwnProperty("color")
            expect(c.color).to.eq(attributes.Color.Red)
  
        });
        it("has a shape attribute", ()=> {
            expect(c).to.haveOwnProperty("shape")
            expect(c.shape).to.eq(attributes.Shape.Diamond)
  
        });
        it("has a count attributes", ()=> {
            expect(c).to.haveOwnProperty("count")
            expect(c.count).to.eq(attributes.Count.One)
  
        });
        it("has a fill attribute", ()=> {
            expect(c).to.haveOwnProperty("fill")
            expect(c.fill).to.eq(attributes.Fill.Solid)
  
        });
    });
  });

  describe("Card random function", ()=> {
    describe("returns a random card object", ()=> {
        let c = card.Card.random()
        it("has a color attribute", ()=> {
            expect(c).to.haveOwnProperty("color")
            expect(c.color.valueOf()).to.oneOf(Object.keys(attributes.Color))
  
        });
        it("has a shape attribute", ()=> {
            expect(c).to.haveOwnProperty("shape")
            expect(c.shape.valueOf()).to.oneOf(Object.keys(attributes.Shape))
  
        });
        it("has a count attributes", ()=> {
            expect(c).to.haveOwnProperty("count")
            expect(c.count.valueOf()).to.oneOf(Object.keys(attributes.Count))  
        });

        it("has a fill attribute", ()=> {
            expect(c).to.haveOwnProperty("fill")
            expect(c.fill.valueOf()).to.oneOf(Object.keys(attributes.Fill))
        });
    });
  });



