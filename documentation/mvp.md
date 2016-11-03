# Minimal Viable Product



## Server implements the following features:

### 4 person rooms
 - Player can join
 - Player can leave
 - Player can die
 - Only one zone can be active at one time

### Player move syncronization to every player

### A new zone can be loaded while playing
- All players teleport to the new zone

### NPC AI
 - Hostile NPCs will spawn randomly around the zone
 - Monster types are decided by zone
 - Non-hostile NPCs too
 - NPCs drop items
 - NPC types
  - Wandering
    - Will move around until finds a target and then tries to attack it and chasing
  - Static
    - Will attack player if it will get close, otherwise minds own business, does not chase player
  - Caster
    - Will move around until finds a target, chases but always keeps a distance
  - Dummy
   - Doesn't move or attack

 - NPC location is tracked on serverside

### Projectiles
 - Are tracked serverside
 - Collision checks are on serverside
 - Different projectile types
  - Straight
  - Wiggling
  - Orbitting

### Items
 - Lootbags that contain Items
 - If item is dropped, it will appear on the ground in a lootbag
 - Player can pick up an item from ground
 - Are dropped by NPCs

### Random Map generation
 - Made using https://github.com/mxgmn/WaveFunctionCollapse
 - Can generate enterances to other zones and proper enemies
