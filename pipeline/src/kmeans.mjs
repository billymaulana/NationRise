/* Deterministic k-means on province centroids. Seeded with k-means++ so the
   same input always yields the same clusters; the pipeline must be
   reproducible or two runs would renumber every province in the game. */
export function cluster(points, k, seed) {
  if (points.length <= k) {
    return points.map((_, i) => i)
  }

  const rng = mulberry32(seed)
  const centres = seedCentres(points, k, rng)
  const assign = new Array(points.length).fill(-1)

  for (let pass = 0; pass < 60; pass++) {
    let moved = false

    for (let i = 0; i < points.length; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < centres.length; c++) {
        const d = dist2(points[i], centres[c])
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      if (assign[i] !== best) {
        assign[i] = best
        moved = true
      }
    }

    if (!moved && pass > 0) {
      break
    }

    const sum = centres.map(() => [0, 0, 0])
    for (let i = 0; i < points.length; i++) {
      const s = sum[assign[i]]
      s[0] += points[i][0] * points[i][2]
      s[1] += points[i][1] * points[i][2]
      s[2] += points[i][2]
    }
    for (let c = 0; c < centres.length; c++) {
      if (sum[c][2] > 0) {
        centres[c] = [sum[c][0] / sum[c][2], sum[c][1] / sum[c][2]]
      }
    }
  }

  return assign
}

function seedCentres(points, k, rng) {
  const centres = [points[Math.floor(rng() * points.length)].slice(0, 2)]

  while (centres.length < k) {
    const weights = points.map((p) => Math.min(...centres.map((c) => dist2(p, c))))
    const total = weights.reduce((s, w) => s + w, 0)
    let target = rng() * total
    let picked = points.length - 1

    for (let i = 0; i < points.length; i++) {
      target -= weights[i]
      if (target <= 0) {
        picked = i
        break
      }
    }

    centres.push(points[picked].slice(0, 2))
  }

  return centres
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
