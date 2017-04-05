# Object Descriptions

## Enemy
 - shape: SAT.Box
 - image: STRING
 - stats: { health, vitality, strength, dexterity, defence, speed }
 - collideToTerrain: BOOLEAN
 - type: 'dummy' | 'wandering' | 'caster' | 'static'
 - state: INTEGER
 - simulations: INTEGER
 - moveTarget: {x, y}
 - target: player / gameobjects
 - lastBroadCastedPosition: {x, y}
 - hash: STRING
 - projectileType: STRING
 - projectiles: [Projectile objects]


## Player
 - shape: SAT.Box
 - stats: { health, vitality, strength, dexterity, defence, speed }
 - id: STRING
 - x: DOUBLE
 - y: DOUBLE
 - room: STRING
 - characterdata: db {}


## Projectile
 - image: STRING
 - angle: DOUBLE
 - speed: INTEGER
 - currentTravelDistance: DOUBLE
 - maxTravelDistance: DOUBLE
 - path: STRING
 - damage: INTEGER
 - guid: STRING
 - team: INTEGER
 - collideToTerrain: BOOLEAN
 - shape: SAT.Box
