# Object Descriptions

## Enemy
 - shape: SAT.Box
 - image: INTEGER
 - stats: { health, vitality, strength, dexterity, defence, speed }
 - collideToTerrain: BOOLEAN
 - name: STRING
 - type: 'dummy' | 'wandering' | 'caster' | 'static'
 - hitsound: STRING
 - deathsound: STRING
 - state: INTEGER
 - extra: {}
 - simulations: INTEGER
 - moveTarget: {x, y}
 - target: player / gameobjects
 - lastBroadCastedPosition: {x, y}
 - hash: STRING
 - projectiles: [Projectile objects]
 - zone: Zone
 - loot: [Object]
 - exp: INTEGER
 - x: INTEGER,
 - y: INTEGER,


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
 - cooldown: INTEGER
 - damage: INTEGER
 - lastShotTime: INTEGER
 - guid: STRING
 - team: INTEGER
 - collideToTerrain: BOOLEAN
 - shape: SAT.Box
 - width: INTEGER
 - height: INTEGER
 - onTerrainCollision: function

## Zone
 - x: INTEGER
 - y: INTEGER
 - enemies: Array[Enemy]

## Item slots
 - 0 = Helmet
 - 1 = Pants
 - 2 = Shoulders
 - 3 = Weapon
 - 4 = Chest
 - 5 = Boots
 - 6 = Ring
 - 7 = Relic

## Item rarity
 - 0 = basic / white
 - 1 = good / green
 - 2 = great / yellow
 - 3 = epic / magenta


## Item attribute mapping
 - 1 = maxhealth
 - 2 = vitality
 - 3 = strength
 - 4 = dexterity
 - 5 = defence
 - 6 = speed
 - 10 = weapon projectile
 - 11 = projectile speed
 - 12 = projectile maxTravelDistance
