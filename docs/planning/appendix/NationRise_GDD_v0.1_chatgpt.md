# Nation Rise - Game Design Document (GDD) v0.1

> **Working title:** Nation Rise  
> **Genre:** Lightweight Grand Strategy / 4X Lite / Nation Building  
> **Core fantasy:** Choose a nation and an era, build its power, master warfare, conquer territory, transform the nation, and rewrite history.

---

## 1. Executive Summary

Nation Rise is a lightweight grand-strategy game centered on **warfare, territorial expansion, military development, and nation building**.

The player can choose different nations and different historical starting scenarios, such as a Majapahit-era scenario, World War I, World War II, or the modern world. From that starting point, the player is free to change the course of history.

The game intentionally avoids becoming a highly detailed political or economic simulator. The goal is to make the player feel like a national leader and military strategist rather than an accountant or bureaucrat.

The strongest fantasy is:

> **Start with a nation. Build its strength. Win wars through smart strategy. Expand its territory. Turn it into a superpower. Then look back at the history you created.**

---

## 2. Core Design Pillars

### 2.1 Warfare - Primary Pillar

Warfare is the heart of the game. Battles should not be decided only by a simple military-power comparison.

The player should be rewarded for:

- Terrain selection
- Positioning
- Flanking
- Encirclement
- Siege
- Supply disruption
- Morale management
- Timing
- Intelligence and scouting
- Deception / diversion
- Naval invasion
- Strategic retreat

Historical warfare is inspiration for gameplay mechanics. The game is not intended to be a literal military simulator.

### 2.2 Expansion - Primary Pillar

The main strategic question should often be:

> **Who should I attack next, and why?**

Conquering territory should produce immediately understandable benefits such as population, economy, resources, strategic locations, and access to new cities or ports.

### 2.3 Military Building - Primary Pillar

The player builds and evolves:

- Army
- Air Force
- Navy
- Military infrastructure
- Military technology
- Command structure / commanders
- Military doctrine

### 2.4 Nation Building - Supporting Pillar

Newly conquered territory should be developed into a stronger nation, but city and economy systems should stay simple.

### 2.5 Technology - Supporting Pillar

Technology provides a satisfying progression from early historical warfare to industrial, modern, and potentially speculative late-game capabilities.

### 2.6 Alternate History - Signature Pillar

The campaign should remember what happened and allow the player to create a different timeline than the historical baseline.

---

## 3. Target Player Experience

The player should quickly understand:

> **I have a country. I can make it stronger. I can build an army and a fleet. I can choose whom to fight. I can win by using better strategy. I can take their land.**

But mastery should require understanding:

- Terrain
- Chokepoints
- Supply
- Morale
- Enemy composition
- Timing
- Naval access
- Strategic objectives
- Commander strengths

The design principle is:

> **Easy to understand, hard to master.**

---

## 4. Core Gameplay Loop

```text
Choose Scenario
      ↓
Choose Nation
      ↓
Develop Nation
      ↓
Research Technology
      ↓
Build Military
      ↓
Scout / Gather Intelligence
      ↓
Choose Target
      ↓
Plan War
      ↓
Fight Battle
      ↓
Conquer Territory
      ↓
Develop New Territory
      ↓
Build Stronger Military
      ↓
Fight Stronger Enemies
      ↓
Rewrite History
      ↓
Become a Superpower
```

The intended emotional loop is:

> **Build -> Prepare -> Attack -> Outplay -> Conquer -> Grow -> Repeat**

---

## 5. Game Structure: Two Strategic Layers

### 5.1 World Strategy Layer

The world map is the primary interface.

Player actions include:

- Move armies
- Move fleets
- Scout regions
- Inspect enemy positions
- Develop cities
- Research technology
- Recruit / build units
- Choose commanders
- Set military doctrine
- Declare war
- Manage diplomacy
- Decide where to expand

### 5.2 Tactical Warfare Layer

When armies engage, the player makes meaningful tactical decisions without needing a full real-time battlefield simulator.

Possible actions:

- Frontal assault
- Flanking
- Encirclement
- Ambush
- Siege
- Defensive position
- Retreat
- Naval invasion
- Blockade
- Diversion

The goal is to create situations where a weaker army can defeat a stronger one through better decisions.

---

## 6. Warfare System

### 6.1 Combat Model

Avoid a single "Military Power" number deciding everything.

Suggested conceptual formula:

```text
Combat Outcome =
Army Strength
+ Technology
+ Terrain
+ Morale
+ Supply
+ Commander
+ Tactics
+ Situation
```

This is a design model rather than a final mathematical formula.

### 6.2 Strength

Represents the basic fighting capability of an army or fleet.

### 6.3 Morale

Morale should make units able to retreat, rout, or surrender before complete destruction.

A weaker army may win if it breaks the enemy's morale.

### 6.4 Supply

Supply should be important but intentionally simple.

Low supply can cause:

- Lower combat effectiveness
- Lower morale
- Higher attrition

This creates meaningful reasons to use blockades, encirclement, and shorter supply routes.

### 6.5 Terrain

Suggested terrain types:

| Terrain | Main gameplay effect |
|---|---|
| Plains | Balanced |
| Mountain | Strong defense |
| Forest | Ambush advantage |
| Jungle | Movement / visibility penalty |
| Desert | Supply penalty |
| Coast | Enables naval operations |
| Strait | Chokepoint |
| Island | Requires naval access |

### 6.6 Intelligence / Fog of War

Enemy information should initially be uncertain.

Example:

```text
Enemy Army: ~70-100
```

After scouting:

```text
Enemy Army: 86
```

Better intelligence may reveal:

- Main army location
- Defensive positions
- Fleet location
- Weak borders
- Supply situation

This makes scouting a strategic action rather than a cosmetic feature.

---

## 7. Tactical Concepts Inspired by Historical Warfare

The following concepts are central inspirations:

| Historical concept | Game mechanic |
|---|---|
| Flanking | Attack from a vulnerable side |
| Encirclement | Cut off enemy forces |
| Ambush | Exploit terrain and visibility |
| Siege | Reduce fortified city defenses |
| Chokepoint | Hold strategic passes / straits |
| Blockade | Disrupt ports, supply, and economy |
| Diversion | Pull enemy forces away from the real objective |
| Strategic retreat | Preserve forces or bait the enemy |
| Naval invasion | Open a new front by sea |
| Scouting | Improve enemy intelligence |

Historical figures and campaigns such as Mehmed II / Al-Fatih and Salahuddin are inspiration for the idea that **position, timing, terrain, logistics, siegecraft, and deception can matter as much as raw numbers**.

The design goal is to translate those principles into approachable game systems rather than recreate historical battles exactly.

---

## 8. Commander System

Each major army or fleet can have a commander.

Example:

### General Arka

```text
Defense      +15%
Mountain     +20%
Movement      -5%
```

### General Raka

```text
Flanking     +20%
Ambush       +15%
```

### Admiral Jaya

```text
Naval Attack +20%
Naval Speed  +10%
```

Commander traits should be simple enough to understand at a glance.

### Commander archetypes

- Aggressive
- Defensive
- Strategist
- Siege specialist
- Naval specialist
- Mobile / maneuver specialist

---

## 9. Military Doctrine

The player can choose a broad doctrine that shapes the army.

### Aggressive

- Higher attack
- Higher risk / casualties

### Defensive

- Stronger defense
- Better fortress performance

### Strategist

- Better flanking
- Better encirclement

### Naval

- Stronger naval operations
- Better amphibious warfare

Doctrine changes the style of play without requiring a huge ruleset.

---

## 10. Military Branches

### 10.1 Army

Initial simple unit families:

- Infantry
- Mechanized
- Tank
- Artillery

### 10.2 Air Force

- Fighter
- Bomber
- Transport

### 10.3 Navy

- Frigate
- Destroyer
- Cruiser
- Carrier
- Submarine
- Transport

The exact unit roster depends on the scenario and era.

---

## 11. Naval Warfare - Signature Feature

Navy should receive unusually strong design attention because it supports the game's expansion fantasy and is especially relevant to an archipelagic faction such as Nusantara.

Fleet missions:

- Patrol
- Escort
- Raid
- Blockade
- Naval battle
- Naval invasion

The player should not micromanage every individual ship.

Instead, the player controls fleets and strategic missions.

### Naval Invasion

A key gameplay situation:

```text
Enemy Mainland
██████████████

~~~~~~~~~~~~~~~
   NUSANTARA
    FLEET
      ↓↓↓
  Coastal Landing
```

This enables strategies such as:

- Diversion on one front
- Surprise landing on another
- Coastal bombardment
- Port capture
- Encirclement after landing

---

## 12. City Development

City building is intentionally simplified.

### City progression

```text
Settlement
   ↓
Town
   ↓
City
   ↓
Major City
   ↓
Metropolis
```

Cities mainly contribute to:

- Population
- Economy
- Production
- Research

### City specialization

| City type | Main function |
|---|---|
| Capital | Administration / economy / research |
| Industrial | Military production |
| Port | Naval production and logistics |
| Fortress | Defense |
| Resource | Resource extraction |

Do not turn the game into a full city simulator with traffic, sewage, individual citizens, etc.

---

## 13. Economy

Keep the economy intentionally light.

### Treasury

Used for:

- Construction
- Research
- Military
- Strategic decisions

### Population

Used for:

- Workforce
- Recruitment

### Resources

Used for:

- Industry
- Military production

The exact number of resource types should remain low.

---

## 14. Technology Tree

Technology should feel like visible progression.

### Civilian progression

```text
Agriculture
   ↓
Industry
   ↓
Electricity
   ↓
Computing
   ↓
AI
```

### Military progression

```text
Infantry
   ↓
Mechanization
   ↓
Tank
   ↓
Missile
   ↓
Advanced Weapons
```

### Naval progression

```text
Sailing
   ↓
Steam
   ↓
Destroyer
   ↓
Submarine
   ↓
Carrier
   ↓
Nuclear Submarine
```

The actual tree changes according to the era.

---

## 15. Era and Scenario System

Era selection is a major replayability feature.

The game should present **scenarios**, not merely dates.

### Initial scenario candidates

| Scenario | Approx. starting point | Gameplay identity |
|---|---:|---|
| Age of Kingdoms | Ancient period | Kingdom building, infantry, cavalry, siege |
| Majapahit | c. 1350 | Maritime kingdom, regional conquest |
| Age of Sail | c. 1600 | Trade, exploration, colonies, naval power |
| Napoleonic | 1803 | Mass armies, artillery, maneuver |
| World War I | 1914 | Industrial war, trenches, artillery, attrition |
| World War II | 1939 | Combined arms, air, land, naval warfare |
| Modern World | 2026 | Modern military, intelligence, missiles, advanced navy |

The specific scenario list can change after prototyping.

### Important design rule

Every era should change the **way the game is played**, not just the visual theme.

---

## 16. Suggested Era Gameplay Identity

### Ancient

- Infantry
- Archers
- Cavalry
- Early siege

### Medieval

- Kingdoms
- Cavalry
- Fortifications
- Siege warfare

### Age of Sail

- Naval dominance
- Trade routes
- Colonies
- Amphibious warfare

### Napoleonic

- Mass armies
- Artillery
- Maneuver

### World War I

- Trenches
- Machine guns
- Artillery
- Tanks
- Aircraft
- Submarines
- Attrition / breakthrough

### World War II

- Combined arms
- Armor
- Air superiority
- Carrier warfare
- Amphibious operations

### Modern

- Missiles
- Aircraft
- Drones
- Intelligence
- Modern naval projection

---

## 17. Historical Mode

Historical scenarios begin from a recognizable historical baseline.

The player is free to deviate from it.

Example:

```text
Historical baseline
        ↓
Player decision
        ↓
Historical divergence
        ↓
New events
        ↓
New alliances / wars
        ↓
New world order
```

The game should not force the player to reproduce real history.

---

## 18. Sandbox Mode

A future mode where the player is less constrained by historical conditions.

Potential possibilities:

- Custom world
- Free nation selection
- Reduced historical scripting
- Alternate starting conditions

This is a later feature, not an MVP requirement.

---

## 19. Alternate History System

The defining idea is:

> **History is the record of what the player did.**

Examples:

- Majapahit survives much longer
- A European power loses an invasion
- A different country becomes the dominant naval power
- A country changes its form of government
- A modern regional power becomes a global superpower

The player should be able to look back and understand why history changed.

---

## 20. Player Nation Customization

A major distinction between the player and AI is identity flexibility.

### Player can customize

- Country name
- Flag
- Colors
- Emblem
- Motto
- Government
- Capital
- National focus
- Military doctrine
- Leader identity / presentation

### AI nations

AI should have comparatively stable identities.

AI may transform through designed historical events, but should not randomly use the player's free customization system.

This keeps the world readable and prevents identity chaos.

---

## 21. Capital Relocation

The player can move the capital as the country evolves.

Example:

```text
Trowulan
   ↓
Jakarta
   ↓
Other strategic capital
```

Capital relocation should have meaningful consequences:

- Cost
- Stability impact
- Cooldown
- Temporary disruption

Capital location should matter strategically, not just cosmetically.

---

## 22. Flag Customization

The player can create a custom flag using a simple builder.

Potential controls:

- Base pattern
- Colors
- Symbol
- Emblem

The flag should appear consistently across:

- World map
- Army
- Navy
- City screens
- Diplomacy
- Victory screen
- Campaign history

The goal is emotional ownership:

> **This is my country.**

---

## 23. Government Transformation

Example progression:

```text
Kingdom of Majapahit
        ↓
Majapahit Empire
        ↓
Constitutional Monarchy
        ↓
Nusantara Federation
        ↓
Nusantara Republic
```

Government is a lightweight strategic identity layer, not a parliament simulator.

Possible forms:

- Kingdom
- Empire
- Republic
- Federation
- Union

Each can provide small modifiers or unlocks.

---

## 24. National Focus

The player can select a broad national development direction.

### Military Power

- Army strength
- Recruitment

### Maritime Power

- Navy
- Naval invasion
- Trade / maritime mobility

### Industrial Power

- Production
- Economy

### Scientific Power

- Research
- Technology

### Imperial Power

- Expansion efficiency
- Conquest / occupation

This makes the same country playable in different ways.

---

## 25. Political System

Politics should remain secondary.

Instead of deep parliament simulation, use event-driven decisions.

Examples:

### Military requests more budget

- Approve -> Military up, Economy down
- Reject -> Stability down

### Election

### Protest

### Coup

### Reform

### Succession

### Scandal

Politics exists to create pressure and stories, not to become the main game.

---

## 26. Diplomacy

Keep diplomacy simple.

Relationship states:

```text
Friendly
Neutral
Hostile
Alliance
War
```

Basic actions:

- Trade
- Alliance
- Threaten
- Declare War

Deep treaty simulation is not an early priority.

---

## 27. AI Nations

AI countries should have distinct personalities.

### Militarist

Frequently seeks war.

### Defensive

Builds fortifications and protects territory.

### Naval Power

Prioritizes fleets and ports.

### Economic Power

Prioritizes economy and technology.

### Expansionist

Continuously seeks territorial growth.

This makes each enemy feel like a different puzzle.

---

## 28. Faction Design

The game should support many nations rather than focusing only on Indonesia.

For the first version, start with a small set of clearly differentiated archetypes.

Example faction archetypes:

| Archetype | Strength | Weakness |
|---|---|---|
| Nusantara-like | Navy, resources, population | Fragmented geography |
| Japan-like | Technology, navy, industry | Resource dependence |
| Germany-like | Industry, land warfare | Central position / many borders |
| Britain-like | Navy, trade | Smaller mainland |
| China-like | Population, industry | Large borders |
| America-like | Economy, technology, navy | Long-distance fronts |

These are design archetypes, not a requirement to reproduce real-world national statistics.

---

## 29. Nusantara / Indonesia-Inspired Fantasy

Indonesia is **not the only playable nation**.

However, Nusantara can be one of the most distinctive factions because it naturally supports the player's original fantasy.

### Suggested strengths

- Maritime power
- Resources
- Population
- Archipelago warfare

### Suggested weaknesses

- Fragmented territory
- Large coastline
- Naval logistics dependency

### Unique fantasy path

```text
Maritime Civilization
        ↓
Ancient Legacy
        ↓
Lost Knowledge
        ↓
Hidden Technology
        ↓
Ancient Awakening
```

This should be a unique faction flavor, not a claim about actual hidden history.

---

## 30. Ancient / Secret Civilization System

The player's original fantasy includes the idea that a civilization may discover a powerful hidden past.

This should be a **late-game fantasy layer**, not an early core system.

Example:

```text
Ancient Discovery
       ↓
Ancient Engineering
       ↓
Lost Maritime Knowledge
       ↓
Unknown Energy
       ↓
Ancient Weapon
       ↓
???
```

Other factions can receive their own secret paths so the feature does not become Indonesia-only.

---

## 31. Historical Chronicle

Every campaign should produce a record of important events.

Example:

```text
1350 - Kingdom begins
1382 - First major war
1410 - Capital relocated
1450 - Major naval victory
1510 - Major territory conquered
1670 - Empire proclaimed
1820 - Industrialization
1948 - First aircraft carrier launched
2026 - World superpower
```

This transforms a campaign from a series of numbers into a personal alternate-history story.

---

## 32. Player Nation Screen

Suggested structure:

```text
🇮🇩

UNITED NUSANTARA FEDERATION

Capital       Jakarta
Government    Federation
Leader        President Arka

Population    420M
Economy       ██████████
Military      ███████████
Technology    ██████████

National Focus      Maritime Power
Military Doctrine   Naval

"Unity in Strength"

[ CUSTOMIZE NATION ]
```

---

## 33. Customize Nation Screen

Suggested sections:

```text
CUSTOMIZE NATION

Identity
- Name
- Government
- Motto

Symbol
- Flag
- Colors
- Emblem

State
- Capital
- National Focus
- Military Doctrine
```

Gameplay-affecting changes should show clear consequences before confirmation.

---

## 34. Superpower Progression

The game should communicate long-term growth clearly.

Suggested stages:

```text
Small Nation
     ↓
Regional Power
     ↓
Great Power
     ↓
Superpower
     ↓
Global Hegemon
```

The strongest late-game feeling should be:

> **“My country has become unstoppable - and now the rest of the world is reacting.”**

---

## 35. Global Coalition / Late Game Threat

When the player becomes too dominant, other nations can react.

Example:

```text
Player dominance
       ↓
Other nations become afraid
       ↓
Coalitions form
       ↓
Global war
       ↓
Superpower conflict
```

This prevents the endgame from becoming a simple cleanup exercise.

---

## 36. Victory Conditions

### Domination Victory

Control most of the world.

### Military Victory

Become the world's strongest military power.

### Economic Victory

Become the world's leading economy.

### Technology Victory

Reach the final major technological milestones.

### Civilization Victory

Complete a unique secret / civilization path.

Domination should remain the default fantasy.

---

## 37. Main UX Principle: Map First

The world map should be the main screen.

The player should be able to understand most important game state from the map:

- Territory
- Borders
- Cities
- Armies
- Fleets
- Resources
- Enemy positions
- War status

Target philosophy:

> **Most gameplay happens from the world map, not from menus.**

---

## 38. Suggested Main Flow

```text
NEW GAME
   ↓
SELECT SCENARIO
   ↓
SELECT NATION
   ↓
SELECT DIFFICULTY
   ↓
WORLD MAP
   ↓
DEVELOP
   ↓
RESEARCH
   ↓
BUILD MILITARY
   ↓
SCOUT
   ↓
PLAN WAR
   ↓
BATTLE
   ↓
CONQUEST
   ↓
NATION TRANSFORMATION
   ↓
HISTORY CHANGES
   ↓
SUPERPOWER
```

---

## 39. Sample Campaign

### Scenario

**Majapahit - c. 1350**

### Start

- Kingdom
- Capital: Trowulan
- Focus: Expansion

### Mid Game

- Expand through the archipelago
- Develop ports
- Build a strong navy
- Research maritime technology
- Defeat regional rivals

### Alternate History

- Control major trade routes
- European expeditions encounter a much stronger Nusantara
- Government transforms into an empire or federation
- Industrialization begins
- Capital may move to a more strategically valuable city

### Late Game

- Become a global power
- Research advanced technology
- Trigger the nation's unique secret path
- Face a global coalition

This same structure can be applied to other nations and scenarios.

---

## 40. Example Modern Campaign

### Starting Nation

A Nusantara-like modern country.

### Early phase

- Upgrade cities
- Research modern military technology
- Build navy
- Establish air power
- Scout neighboring countries

### First war

The player discovers that the enemy is stronger in land warfare but weak at sea.

Instead of a frontal assault:

1. Blockade a port.
2. Create a diversion on the border.
3. Land an invasion force on the coast.
4. Capture the port city.
5. Cut enemy supply.
6. Encircle the main enemy force.
7. Force a retreat.
8. Capture strategic territory.

The point is to make the player feel clever rather than simply stronger.

---

## 41. What NOT to Build Early

Avoid these systems until the core game is proven fun:

- Detailed taxation
- Individual citizens
- Complex parliament simulation
- 20+ resource types
- Detailed supply chains
- Hundreds of unit types
- Individual factories
- Traffic simulation
- Deep economic markets
- Realistic military logistics at operational scale
- Fully simulated naval physics
- Highly complex diplomacy

These systems can destroy the accessibility of the game if introduced too early.

---

## 42. MVP Definition

The first playable version should be extremely focused.

### Scenario

**Modern World**

### Nations

10-20 nations.

### Map

Approximately 100-200 strategic regions.

### Military

- Army
- Air Force
- Navy

### Core warfare

- Movement
- Combat
- Terrain
- Basic supply
- Basic morale
- Flanking
- Siege
- Naval battle
- Naval invasion

### Nation development

- Cities
- Population
- Economy
- Technology
- Military production

### Win condition

Become a superpower / dominate the world.

---

## 43. MVP Development Phases

### Phase 0 - Combat Prototype

Build only:

- World map
- Regions
- Armies
- Movement
- Basic combat
- Conquest

Success question:

> **Is attacking and conquering fun?**

### Phase 1 - Strategic Warfare

Add:

- Terrain
- Supply
- Morale
- Flanking
- Encirclement
- Siege
- Commanders
- Fog of war

Success question:

> **Can a weaker player win through better strategy?**

### Phase 2 - Naval Warfare

Add:

- Fleets
- Naval movement
- Naval combat
- Blockade
- Naval invasion
- Ports
- Transport

Success question:

> **Does the navy create a different strategic playstyle?**

### Phase 3 - Nation Building

Add:

- Cities
- Economy
- Population
- Resources
- Production

Success question:

> **Does conquest make the country meaningfully stronger?**

### Phase 4 - Technology

Add:

- Civilian technology
- Military technology
- Naval technology
- Era progression

### Phase 5 - Player Identity

Add:

- Rename nation
- Flag editor
- Government
- Capital relocation
- National focus
- Military doctrine
- Motto

### Phase 6 - Historical Scenarios

Add scenarios progressively:

1. Modern World
2. World War II
3. Medieval / Majapahit
4. World War I
5. Age of Sail
6. Napoleonic / Ancient scenarios

### Phase 7 - Alternate History

Add:

- Historical events
- Branching events
- Chronology
- Historical consequences
- AI reactions

### Phase 8 - Fantasy Layer

Add:

- Ancient discoveries
- Lost civilizations
- Secret technology
- Unique faction paths
- Late-game mysteries

---

## 44. Content Scope Strategy

Do not build all eras at once.

Recommended order:

```text
Modern
  ↓
WWII
  ↓
Majapahit / Medieval
  ↓
WWI
  ↓
Age of Sail
  ↓
Napoleonic
  ↓
Ancient
```

Modern should validate the core game because it has familiar military concepts, a global map, and strong naval/air/land possibilities.

WWII then tests whether the same core loop works under a more historically distinctive military system.

Majapahit / Medieval tests the transition to pre-industrial warfare.

---

## 45. Design Principles

### 1. Simple to understand, deep to master

### 2. Warfare is the core, not a side feature

### 3. Numbers support decisions - they do not replace them

### 4. The map is the main interface

### 5. Every conquest should feel rewarding

### 6. Nation development should reinforce expansion

### 7. Player identity should evolve over time

### 8. AI identity should remain stable and readable

### 9. Historical strategy inspires mechanics rather than creating bureaucracy

### 10. Every campaign should produce a story

---

## 46. Final Product Vision

The game is not intended to be:

- A Civilization clone
- A spreadsheet simulator
- A parliament simulator
- A full military simulator
- A realistic economy simulator

Instead:

> **A lightweight grand-strategy sandbox where any nation can rise from a starting position to a superpower through development, technology, clever warfare, and territorial expansion.**

The player's country can transform over time:

```text
Nation
  ↓
Military Power
  ↓
Territorial Expansion
  ↓
Economic Growth
  ↓
Technological Progress
  ↓
Government / Identity Change
  ↓
New Capital / New Flag / New Name
  ↓
Alternate History
  ↓
Superpower
```

---

## 47. Final Core Statement

> ### Choose your era. Choose your nation. Build its power. Master the art of war. Conquer territory. Transform your nation. Rewrite history.

The most important test for every future feature is:

> **Does this make building, fighting, conquering, or evolving my nation more fun?**

If the answer is no, the feature is probably not a priority.

---

## 48. Open Design Questions for Future Iterations

These are intentionally left open until the prototype exists:

1. Real-time, turn-based, or hybrid time progression?
2. Exact battle UI and level of tactical control?
3. How many regions should a full world map contain?
4. How much micromanagement should armies require?
5. How should city development visually change the map?
6. How should historical events branch without becoming scripted railroad events?
7. How powerful should secret / fantasy technology become?
8. How should multiplayer or asynchronous features fit, if ever added?
9. What is the final visual style: realistic, stylized, minimalist, or map/board-game inspired?
10. What is the final game title and brand identity?

These should be answered through prototypes and playtesting rather than upfront speculation.

---

# Appendix A - Conceptual Data Model

```text
Game
├── Scenario
│   ├── Era
│   ├── Start Date
│   ├── Map
│   ├── Historical Events
│   └── Rules
│
├── Nation
│   ├── Identity
│   │   ├── Name
│   │   ├── Flag
│   │   ├── Motto
│   │   └── Government
│   ├── Capital
│   ├── Population
│   ├── Economy
│   ├── Technology
│   ├── Military
│   ├── Doctrine
│   └── National Focus
│
├── Territory
│   ├── Region
│   ├── City
│   ├── Terrain
│   ├── Resources
│   └── Owner
│
├── Military
│   ├── Army
│   ├── Air Force
│   ├── Navy
│   ├── Commander
│   ├── Morale
│   └── Supply
│
└── History
    ├── Wars
    ├── Conquests
    ├── Government Changes
    ├── Capital Changes
    ├── Major Discoveries
    └── Chronology
```

---

# Appendix B - One-Screen Product Summary

**Genre:** Lightweight Grand Strategy / 4X Lite  
**Core:** Warfare + Expansion + Military + Nation Building  
**Unique hook:** Historical scenarios + alternate history + evolving player identity  
**Primary interface:** World map  
**Primary fantasy:** Turn any chosen nation into a superpower  
**Signature warfare:** Terrain, maneuver, siege, supply, morale, navy, naval invasion  
**Signature identity system:** Player-only capital/flag/name/government transformation  
**Signature narrative system:** Campaign Chronicle  
**Late-game fantasy:** Secret civilizations / technologies and a world coalition against an increasingly dominant player  

---

# Appendix C - Working Taglines

- **Choose your era. Choose your nation. Rewrite history.**
- **Build your nation. Master warfare. Rule the world.**
- **Rise. Conquer. Transform.**
- **Your nation. Your war. Your history.**
- **Start small. Become unstoppable.**

---

## Document Status

**Version:** 0.1  
**Status:** Concept / Pre-production  
**Purpose:** Consolidated planning document based on the current design discussion.  
**Next focus:** Prototype the world map + warfare + conquest loop before expanding the simulation systems.
