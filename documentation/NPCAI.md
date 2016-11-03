# NPC AI


## Wandering

 - 0 (We don't have a target yet)
  - Every 10th simulation, look for target
  - If we don't have a moveTarget
    - Pick a location 1 tile away from where we are now
    - Check if it is blocked by terrain
    - Set it to be our moveTarget if it isn't
 - 1 (We have a target)
  - Find a path to the target
  - Set moveTarget to the first node of the path
  - Attack target

## Dummy

 - 0 (We don't have a target yet)
  - Do nothing

## Static

 - 0 (We don't have a target yet)
  - Every 10th simulation, look for target
  -  If we don't have a moveTarget
    - Pick a random location around our static position (48+-)
    - Check if it is blocked by terrain
    - Set it to be our moveTarget if it isn't
 - 1 (We have a target)
  - Attack target
  -  If we don't have a moveTarget
    - Pick a random location around our static position (48+-)
    - Check if it is blocked by terrain
    - Set it to be our moveTarget if it isn't

## Caster
 - 0 (We don't have a target yet)
  - Every 10th simulation, look for target
 - 1 (We have a target)
  - Find a path to the target if distance to it is more than 200
  - Set moveTarget to the first node of the path
  - Attack target
