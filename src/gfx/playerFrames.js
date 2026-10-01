// 16-bit-style procedural art: 21x30 logical pixels at 2x preserves the old
// 42x60 footprint while providing 2.25x more drawable detail.
export const PLAYER_GRID = { cols: 21, rows: 30, pixelSize: 2 };
const C = { outline:0x241b2b, hairDark:0x3f261e, hair:0x71412b, hairLight:0xa5653c, skinDark:0xc47b67, skin:0xf0b59a, skinLight:0xffd2b4, dressDark:0x9e294f, dress:0xe34b75, dressLight:0xff7892, stocking:0xf2d5c8, shoe:0x27273d, shoeLight:0x51516d, eye:0x282038, eyeLight:0x8ee17f, hat:0xd62f3f, hatDark:0x9e1f2f, fur:0xffffff, furDark:0xd3d9e3 };
const r=(x,y,w,h,color)=>({x,y,w,h,color});
// Santa hat: red cone over the hair, white brim, and a pompom that droops
// down the back (left side, since she faces right).
const santaHat=(x,y,w=15)=>[
  r(x+2,y,w-6,3,C.hat),r(x+1,y+1,w-3,2,C.hat),r(x+w-7,y,4,3,C.hatDark),
  r(x-1,y+1,4,3,C.hat),r(x-2,y+3,3,2,C.hatDark),r(x-3,y+4,3,3,C.fur),
  r(x,y+3,w,2,C.fur),r(x,y+4,w,1,C.furDark)
];
const BASE=[
  r(4,1,13,1,C.outline),r(2,3,17,9,C.outline),r(3,2,14,10,C.hairDark),r(4,2,11,1,C.hairLight),
  r(5,3,11,8,C.hair),r(3,5,3,8,C.hairDark),r(15,4,3,9,C.hairDark),r(8,5,8,6,C.skinDark),
  r(8,4,7,6,C.skin),r(9,5,5,2,C.skinLight),r(14,7,1,2,C.eye),r(14,7,1,1,C.eyeLight),
  r(14,10,2,1,C.skinDark),r(8,12,4,2,C.outline),r(9,11,3,3,C.skin),r(5,14,11,8,C.outline),
  r(6,14,9,7,C.dress),r(7,14,3,6,C.dressLight),r(13,16,2,5,C.dressDark),r(3,21,15,5,C.outline),
  r(4,21,13,4,C.dress),r(5,21,4,3,C.dressLight),r(12,22,5,3,C.dressDark),
  ...santaHat(3,0)
];
const arm=(x,y,flip=false)=>[r(x,y,3,6,C.outline),r(x+1,y,2,4,C.dress),r(x+(flip?0:1),y+4,2,3,C.skinDark),r(x+(flip?0:1),y+4,1,2,C.skin)];
const leg=(x,y,dx=0)=>[r(x,y,3,4,C.outline),r(x+1,y,2,3,C.stocking),r(x+dx,y+3,5,2,C.outline),r(x+dx+1,y+3,4,1,C.shoeLight),r(x+dx,y+4,5,1,C.shoe)];
const POSES={
  idle0:[...arm(15,15),...leg(6,25),...leg(12,25,-1)],idle1:[...arm(15,14),...leg(6,25),...leg(12,25,-1),r(4,20,2,1,C.dressLight)],
  walk0:[...arm(15,13),...leg(4,24,-2),...leg(13,25),r(3,22,2,2,C.dressDark)],walk1:[...arm(16,14),...leg(6,25,-1),...leg(11,24)],
  walk2:[...arm(15,16),...leg(7,25,-1),...leg(12,25,-1),r(16,21,2,2,C.dressDark)],walk3:[...arm(14,16),...leg(12,24),...leg(4,25,-2),r(16,22,2,2,C.dressDark)],
  walk4:[...arm(15,15),...leg(11,25,-1),...leg(6,24,-1)],walk5:[...arm(16,14),...leg(7,25,-1),...leg(12,25,-1)],
  jumpRise:[...arm(15,11),...leg(6,23,-1),...leg(12,23,-1),r(3,22,2,2,C.dressDark)],jumpFall:[...arm(14,13),...leg(5,24,-2),...leg(12,23),r(16,21,2,3,C.dressDark)],
  stumble:[...arm(1,12,true),...arm(16,17),...leg(2,24,-2),...leg(14,25),r(2,10,3,2,C.skin),r(18,15,2,2,C.skinLight)]
};

// Full-body recovery drawings cannot reuse the upright BASE. These authored
// silhouettes make the hit read as a forward fall rather than rotating a
// rigid standing sprite around its ankle.
const SPECIAL_POSES={
  fallForward:[
    // Hair and face pitched toward the pavement.
    r(10,13,10,2,C.outline),r(8,15,12,8,C.outline),r(9,14,10,8,C.hairDark),
    r(10,15,8,5,C.hair),r(11,15,5,1,C.hairLight),r(16,19,3,3,C.skin),r(18,21,2,1,C.skinDark),
    // Torso and skirt trail up and back as the hands shoot forward.
    r(5,11,8,9,C.outline),r(6,12,7,7,C.dress),r(6,12,3,5,C.dressLight),
    r(2,9,6,8,C.outline),r(3,10,5,6,C.dressDark),r(1,7,4,4,C.outline),r(2,8,3,3,C.stocking),
    r(13,20,7,3,C.outline),r(14,20,6,2,C.skin),r(17,22,4,2,C.outline),r(18,22,3,1,C.skinLight),
    r(3,16,4,5,C.outline),r(4,17,3,4,C.stocking),r(2,20,6,2,C.outline),r(3,20,5,1,C.shoeLight),
    ...santaHat(9,11,11)
  ],
  prone:[
    // Face-down body lies along the bottom of the same 42x60 texture.
    r(1,22,8,6,C.outline),r(2,21,7,6,C.hairDark),r(3,21,5,3,C.hair),r(7,24,3,2,C.skinDark),
    r(8,20,9,7,C.outline),r(9,21,8,5,C.dress),r(10,21,3,2,C.dressLight),
    r(15,22,5,5,C.outline),r(16,23,4,3,C.dressDark),
    r(4,26,11,3,C.outline),r(5,26,9,2,C.skin),r(17,25,4,3,C.outline),r(17,26,4,2,C.stocking),
    r(18,27,3,2,C.shoe),r(0,28,21,1,C.outline),
    ...santaHat(2,17,8)
  ],
  kneel:[
    // Hands-and-knees push-up frame before she springs upright.
    r(9,10,10,2,C.outline),r(8,12,11,8,C.outline),r(9,11,9,8,C.hairDark),r(10,12,7,5,C.hair),
    r(15,16,3,3,C.skin),r(6,18,11,7,C.outline),r(7,18,9,6,C.dress),r(8,18,3,3,C.dressLight),
    r(15,23,5,3,C.outline),r(16,23,4,2,C.skin),r(3,22,6,5,C.outline),r(4,22,5,4,C.dressDark),
    r(2,26,7,3,C.outline),r(3,26,6,2,C.stocking),r(13,26,6,3,C.outline),r(14,26,5,2,C.shoeLight),
    ...santaHat(9,7,10)
  ]
};

export const PLAYER_POSES=[...Object.keys(POSES),...Object.keys(SPECIAL_POSES)];
export function playerFrameParts(pose){return SPECIAL_POSES[pose]??[...BASE,...POSES[pose]];}
