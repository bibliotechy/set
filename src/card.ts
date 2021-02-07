import { Shape, Color, Count, Fill} from  "./attributes.js"

class Card {
    shape: Shape;
    color: Color;
    count: Count;
    fill:  Fill; 

    constructor(attributes: CardParameters) {
        this.shape = attributes.shape;
        this.fill  = attributes.fill;
        this.count = attributes.count;
        this.color = attributes.color;
    }

    attributes(): CardParameters {
        return {
            shape: this.shape,
            color: this.color,
            count: this.count,
            fill:  this.fill
        }
    }
    
    static random(): Card {
        let attrs = {
            shape: randomEnum(Shape),
            color: randomEnum(Color),
            count: randomEnum(Count),
            fill:  randomEnum(Fill)
        }
        return new Card(attrs)
    }
}
interface CardParameters {
    shape: Shape
    color: Color;
    count: Count;
    fill:  Fill; 
}


const randomEnum = (enumeration: any) => {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
}




export { Card }

