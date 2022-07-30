import {Shape} from "./attributes"

let squiggleSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M39.4,63.4c0,16.1,11,19.9,10.6,28.3c-0.5,8.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-27.3C1,0.1,21.6-3,33.9,6.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z">
</path>
</svg>
`

let pillSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M25,99.5C14.2,99.5,5.5,90.8,5.5,80V20C5.5,9.2,14.2,0.5,25,0.5S44.5,9.2,44.5,20v60 C44.5,90.8,35.8,99.5,25,99.5z">
</path>
</svg>
`

let diamondSvg = `
<svg class="shape" viewBox="-2 -2 54 104">
<path d="M24 0 L48 48 L24 96 L0 48 Z">
</path>
</svg>
`
 
const SVG_NS = 'http://www.w3.org/2000/svg';



const shapeSVG = function(shape: Shape): string {
    switch(shape) {
        case Shape.Squiggle:
            return squiggleSvg
        case Shape.Diamond: 
            return diamondSvg
        case Shape.Pill: 
            return pillSvg
    }
}

export { shapeSVG }
