var expect    = require("chai").expect;
var card = require("../index");
var attributes = require("../attributes") 

describe("Card", function() {
    describe("has expected attributes", function() {
        let c = new card.Card({shape: attributes.Shape.Diamond, color: attributes.Color.Red, count: attributes.Count.One, fill: attributes.Fill.Solid})
        it("has a color attribute", function() {
            expect(c).to.haveOwnProperty("color")
            expect(c.color).to.eq(attributes.Color.Red)
  
        });
        it("has a shape attribute", function() {
            expect(c).to.haveOwnProperty("shape")
            expect(c.shape).to.eq(attributes.Shape.Diamond)
  
        });
        it("has a count attributes", function() {
            expect(c).to.haveOwnProperty("count")
            expect(c.count).to.eq(attributes.Count.One)
  
        });
        it("has a fill attribute", function() {
            expect(c).to.haveOwnProperty("fill")
            expect(c.fill).to.eq(attributes.Fill.Solid)
  
        });
    });
  });

  describe("Card random function", function() {
    describe("returns a random card object", function() {
        let c = card.Card.random()
        it("has a color attribute", function() {
            expect(c).to.haveOwnProperty("color")
            expect(c.color.valueOf()).to.oneOf(Object.keys(attributes.Color))
  
        });
        it("has a shape attribute", function() {
            expect(c).to.haveOwnProperty("shape")
            expect(c.shape.valueOf()).to.oneOf(Object.keys(attributes.Shape))
  
        });
        it("has a count attributes", function() {
            expect(c).to.haveOwnProperty("count")
            expect(c.count.valueOf()).to.oneOf(Object.keys(attributes.Count))  
        });

        it("has a fill attribute", function() {
            expect(c).to.haveOwnProperty("fill")
              expect(c.fill.valueOf()).to.oneOf(Object.keys(attributes.Fill))
        });
    });
  });



