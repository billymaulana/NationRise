/* Setiap unit punya nilai serang dan bertahan terhadap masing-masing kelas ini,
   dan itulah yang membuat komposisi berarti: kolom tank yang bertemu meriam
   anti-tank kalah oleh jumlah yang sama yang akan meremukkan infanteri. */
export enum ArmourClass {
  Infantry = 0,
  Armour = 1,
  UnarmouredVehicle = 2,
  Helicopter = 3,
  FixedWing = 4,
  Missile = 5,
  SurfaceShip = 6,
  Submarine = 7,
  Building = 8,
  Population = 9,
}

export const ARMOUR_CLASS_COUNT = 10
