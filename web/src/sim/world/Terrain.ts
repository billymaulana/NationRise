export enum Terrain {
  OpenGround = 0,
  Forest = 1,
  Jungle = 2,
  Hills = 3,
  Mountains = 4,
  Desert = 5,
  Tundra = 6,
  Marsh = 7,
  Urban = 8,
  Suburban = 9,
  CoastalWaters = 10,
  HighSeas = 11,
  Strait = 12,
}

export function isWater(terrain: Terrain): boolean {
  return (
    terrain === Terrain.CoastalWaters ||
    terrain === Terrain.HighSeas ||
    terrain === Terrain.Strait
  )
}

export function favoursDefence(terrain: Terrain): boolean {
  return (
    terrain === Terrain.Forest ||
    terrain === Terrain.Jungle ||
    terrain === Terrain.Hills ||
    terrain === Terrain.Mountains ||
    terrain === Terrain.Urban
  )
}
