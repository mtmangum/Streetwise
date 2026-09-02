// Denser 16-bit-style greyhound: same 60x30 footprint, now with contour,
// highlights and four distinct phases of the double-suspension gallop.
export const DOG_GRID={cols:30,rows:15,pixelSize:2};
const C={outline:0x252633,dark:0x555b68,body:0x9299a5,light:0xc7cbd1,eye:0x17131b,collar:0xd84a62};
const r=(x,y,w,h,color)=>({x,y,w,h,color});
const dog=({headX,headY,bodyY,tailY,legs})=>[
  r(3,tailY,7,2,C.outline),r(2,tailY,7,1,C.dark),r(8,bodyY,12,6,C.outline),r(9,bodyY,11,4,C.body),r(10,bodyY,7,1,C.light),r(7,bodyY+2,5,3,C.dark),
  r(18,bodyY-2,5,6,C.outline),r(19,bodyY-2,4,5,C.body),r(20,bodyY-1,2,1,C.light),r(21,bodyY-1,1,4,C.collar),
  r(headX,headY,6,5,C.outline),r(headX+1,headY+1,5,3,C.body),r(headX+1,headY-2,3,3,C.outline),r(headX+2,headY-1,2,2,C.dark),
  r(headX+5,headY+2,5,2,C.outline),r(headX+5,headY+1,4,2,C.body),r(headX+8,headY+1,1,1,C.light),r(headX+4,headY+1,1,1,C.eye),
  ...legs.flatMap(([x,y,w,h])=>[r(x,y,w,h,C.outline),r(x+1,y,Math.max(1,w-1),Math.max(1,h-1),C.dark)])
];
const idlePose=[
  r(20,1,6,5,C.outline),r(21,2,5,3,C.body),r(21,0,3,3,C.outline),r(22,1,2,2,C.dark),
  r(25,3,4,2,C.outline),r(25,2,3,2,C.body),r(28,2,1,1,C.light),r(24,2,1,1,C.eye),
  r(18,5,6,7,C.outline),r(19,5,4,6,C.body),r(20,5,2,2,C.light),r(19,5,1,4,C.collar),
  r(11,8,9,6,C.outline),r(12,8,7,5,C.body),r(12,9,3,3,C.light),r(9,11,6,4,C.outline),r(10,11,5,3,C.dark),
  r(18,10,3,5,C.outline),r(19,10,2,5,C.dark),r(22,10,3,5,C.outline),r(23,10,2,5,C.body),
  r(5,12,7,2,C.outline),r(4,13,7,1,C.dark)
];
const POSES={
 // Alert seated pose used whenever the world is stopped. The upright chest,
 // planted forelegs and folded haunch read as resting rather than frozen mid-run.
 idle:idlePose,
 lick0:idlePose,
 lick1:[...idlePose,r(28,5,2,1,0xf06d91),r(29,6,1,1,0xffa0b8)],
 marking:[
   r(20,1,6,5,C.outline),r(21,2,5,3,C.body),r(21,0,3,3,C.outline),r(22,1,2,2,C.dark),
   r(25,3,4,2,C.outline),r(25,2,3,2,C.body),r(28,2,1,1,C.light),r(24,2,1,1,C.eye),
   r(18,5,6,7,C.outline),r(19,5,4,6,C.body),r(20,5,2,2,C.light),r(19,5,1,4,C.collar),
   r(11,8,9,6,C.outline),r(12,8,7,5,C.body),r(12,9,3,3,C.light),r(9,11,6,4,C.outline),r(10,11,5,3,C.dark),
   r(20,10,3,5,C.outline),r(21,10,2,5,C.dark),
   // Raised rear leg is the readable silhouette for the hydrant gag.
   r(9,9,5,2,C.outline),r(8,8,2,4,C.outline),r(9,9,4,1,C.dark),
   r(5,12,7,2,C.outline),r(4,13,7,1,C.dark)
 ],
 gathered0:dog({headX:21,headY:3,bodyY:5,tailY:6,legs:[[11,10,5,3],[16,9,5,3]]}),gathered1:dog({headX:22,headY:4,bodyY:6,tailY:7,legs:[[9,10,6,3],[17,10,5,3]]}),
 extended0:dog({headX:22,headY:5,bodyY:7,tailY:7,legs:[[4,11,8,2],[19,11,8,2]]}),extended1:dog({headX:21,headY:4,bodyY:6,tailY:6,legs:[[3,10,8,2],[20,10,7,2]]}),
 leap:dog({headX:22,headY:4,bodyY:6,tailY:6,legs:[[4,10,8,2],[20,10,8,2]]}),
 // Alternating high/low head positions and exposed teeth create a readable
 // snapping lunge instead of reusing the ordinary running silhouette.
 attack0:[...dog({headX:20,headY:2,bodyY:6,tailY:7,legs:[[8,11,5,3],[18,10,5,3]]}),r(27,6,3,1,0xf2eee4),r(28,7,2,1,C.outline)],
 attack1:[...dog({headX:20,headY:5,bodyY:7,tailY:6,legs:[[5,11,7,2],[19,11,7,2]]}),r(27,9,3,1,0xf2eee4),r(28,8,2,1,C.outline)]
};
export const DOG_POSES=Object.keys(POSES);
export function dogFrameParts(pose){return POSES[pose];}
