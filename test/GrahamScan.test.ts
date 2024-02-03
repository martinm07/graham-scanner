import GrahamScan from "../src/GrahamScan";
import {
  arrayToVertices,
  permute,
  vertToArray,
  vertsToFlArray,
  zip,
} from "../src/helper";
import { describe, expect, it } from "vitest";

describe("ccw", () => {
  const ccw = GrahamScan.ccw;

  it("returns positive for counterclockwise vertex order", () => {
    for (const input_ of [
      [0, 0, 1, 0, 0, 1],
      [1.1, 0.1, 0.1, 1.1, 0.2, 0.3],
      [0.1, 1.1, 0.2, 0.3, 1.1, 0.1],
      [0.2, 0.3, 1.1, 0.1, 0.1, 1.1],
    ]) {
      const input = arrayToVertices(input_);
      expect(ccw(input[0], input[1], input[2])).toBeGreaterThan(0);
    }
  });

  it("returns negative for clockwise vertex order", () => {
    for (const input_ of [
      [0, 0, 0, 1, 1, 0],
      [-1, -1, 1, 0.5, 3, 0.5],
      [1, 0.5, 3, 0.5, -1, -1],
      [3, 0.5, -1, -1, 1, 0.5],
    ]) {
      const input = arrayToVertices(input_);
      expect(ccw(input[0], input[1], input[2])).toBeLessThan(0);
    }
  });

  it("returns 0 for collinear vertices", () => {
    for (const input_ of [
      [1, -0.1, 1, 0.1, 1, 0.2],
      [0.1, -2.7, 7, -2.7, -1.2, -2.7],
      [0, 0, 3, 1, -1.5, -0.5],
      [1, -5.9, 0.2, -0.86, -0.2, 1.66],
    ]) {
      const input = arrayToVertices(input_);
      expect(ccw(input[0], input[1], input[2])).toBeCloseTo(0, 5);
    }
  });
});

describe("generateHull", () => {
  const scan = new GrahamScan();

  it("returns an empty array for empty input", () => {
    scan.setVertices([]);
    expect(vertsToFlArray(scan.generateHull())).toEqual([]);
  });

  it("returns the same as input for 3 vertices or less", () => {
    for (const input of [
      [-11.3, 4],
      [78002, 31.416, 11, -11.76],
      [0.1, 1.1, 1.1, 0.1, 0.2, 0.3],
    ]) {
      const input_ = arrayToVertices(input);
      scan.setVertices(input_);
      expect(Object.is(scan.generateHull(), input_)).toBe(false);
      const hull = scan.generateHull();
      for (const v of input_) expect(hull).toContain(v);
    }
  });

  it("doesn't augment input and is consistent", () => {
    const input = arrayToVertices([0.1, 1.1, 1.1, 0.1, 0.2, 0.3]);
    const copy = arrayToVertices([0.1, 1.1, 1.1, 0.1, 0.2, 0.3]);
    scan.setVertices(input);
    const hull1 = scan.generateHull();
    expect(input).toEqual(copy);
    const hull2 = scan.generateHull();
    expect(hull1).toEqual(hull2);
  });

  it("chooses the lowest y as starting hull vertex", () => {
    scan.setVertices(arrayToVertices([-10, 0, 3, -1.4]));
    expect(vertToArray(scan.generateHull()[0])).toEqual([3, -1.4]);

    scan.setVertices(arrayToVertices([3, -1.4, -10, 0, 23.1, 11.8]));
    expect(vertToArray(scan.generateHull()[0])).toEqual([3, -1.4]);

    scan.setVertices(
      arrayToVertices([10, 0, 3, -Math.sqrt(2), -1, -1, 3, -1.2])
    );
    expect(vertToArray(scan.generateHull()[0])).toEqual([3, -Math.sqrt(2)]);
  });

  it("breaks ties for starting hull vertex using lowest x", () => {
    scan.setVertices(arrayToVertices([-10, 0, 3, -1.4, 2, -1.4]));
    expect(vertToArray(scan.generateHull()[0])).toEqual([2, -1.4]);

    scan.setVertices(arrayToVertices([-10, 0, 2, -1.4, 3, -1.4]));
    expect(vertToArray(scan.generateHull()[0])).toEqual([2, -1.4]);
  });

  it("reorders the vertices of a triangle as expected", () => {
    for (const [input, expected] of zip(
      [
        [0, -1, -1, 0, 1, 0],
        [1, 0, 0, -1, -1, 0],
        [100, 150, 200, 130, 220, 129],
        [-220, -129, -200, -130, -100, -150],
      ],
      [
        [0, -1, 1, 0, -1, 0],
        [0, -1, 1, 0, -1, 0],
        [220, 129, 100, 150, 200, 130],
        [-100, -150, -200, -130, -220, -129],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("reorders 4 convex vertices as expected", () => {
    for (const [input, expected] of zip(
      [
        [-1, -1, 1, -1, 1, 1, -1, 1],
        [1, -1, -1, 1, -1, -1, 1, 1],
        [-12.3, 7.2, 8, 3.4, -2.6, 0.8, 2.54, 12],
      ],
      [
        [-1, -1, 1, -1, 1, 1, -1, 1],
        [-1, -1, 1, -1, 1, 1, -1, 1],
        [-2.6, 0.8, 8, 3.4, 2.54, 12, -12.3, 7.2],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("ignores duplicate vertices", () => {
    const input = [-2, -2, -2, -2, 1, 1, -5, 0, -5, 0, -5, 0];
    const expected = [-2, -2, 1, 1, -5, 0];
    scan.setVertices(arrayToVertices(input));
    expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
  });

  it("ignores NaN, undefined, null and Infinity values", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [100, 150, 200, 130, 220, 129, undefined, undefined, NaN, NaN, 10, NaN],
        [NaN, 10, 100, 150, undefined, undefined, 200, 130, 220, 129],
        [NaN, 10, null, 0, undefined, undefined]
      ],
      [
        [220, 129, 100, 150, 200, 130],
        [220, 129, 100, 150, 200, 130],
        []
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("ignores vertices inside convex hull", () => {
    for (const [input, expected] of zip(
      [
        [11.1, -0.3, -11.111, -0.3, 2, 1.2, -0.0055, 4],
        [-2, -2, 2, -2.4, 2, 1, 1.98, 5, -1, -1.3, 1, 0],
      ],
      [
        [-11.111, -0.3, 11.1, -0.3, -0.0055, 4],
        [2, -2.4, 2, 1, 1.98, 5, -2, -2],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("ignores redundant collinear vertices on convex hull", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [11.1, -0.3, 1.2, -0.3, -11.111, -0.3, -0.0055, 4],
        [11.1, -0.3, -11.111, -0.3, -0.0055, 4, 1.2, -0.3, -8.6344735, 0.6589],
        [-3.83, 1.36, 2, -2.4, 1, 1, -2, -0.27, 1.294, 0, 0, -1.335, -2.6222, 0.2842, 0.9517, 1.0036],
        [2, -2.4, 1.294, 0, 1, 1, -3.83, 1.36, -2, -0.27, 1.605, -1.057],
      ],
      [
        [-11.111, -0.3, 11.1, -0.3, -0.0055, 4],
        [-11.111, -0.3, 11.1, -0.3, -0.0055, 4],
        [2, -2.4, 1, 1, -3.83, 1.36, -2, -0.27],
        [2, -2.4, 1, 1, -3.83, 1.36, -2, -0.27],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("ignores vertices inside hull with same polar angle as a hull's vertex", () => {
    for (const [input, expected] of zip(
      [
        [-6, -6, 6, -6, 6, 6, -6, 6, 0, 0],
        [-6, -6, 6, -6, 6, 6, -6, 6, 0, 0, -3, -3, 5, 5],
        [-3, -3, 5, 5, 4, 1, -6, -6, 6, -6, 6, 6, -6, 6, 0, 0],
      ],
      [
        [-6, -6, 6, -6, 6, 6, -6, 6],
        [-6, -6, 6, -6, 6, 6, -6, 6],
        [-6, -6, 6, -6, 6, 6, -6, 6],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("behaves the same for all permutations of input", () => {
    for (const [expected, inside] of zip(
      [
        [-1, -1, 1, -1, 1, 1, -1, 1],
        [-11.111, -0.3, 11.1, -0.3, -0.0055, 4],
        [2, -2.4, 2, 1, 1.98, 5, -2, -2],
      ],
      [[], [2, 1.2], [-1, -1.3, 1, 0]]
    ))
      for (const perm of permute(
        arrayToVertices([...(<number[]>expected), ...(<number[]>inside)])
      )) {
        scan.setVertices(perm);
        expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
      }
  });

  it("doesn't succumb to potential numerical error", () => {
    for (let _ = 0; _ < 100; _++) {
      const expected = [-3, -3, 3, -3, 3, 3, -3, 3];
      const inside: number[] = [];
      for (let _ = 0; _ < 100; _++) inside.push(Math.random() * 6 - 3);
      const collinear: number[] = [];
      for (let _ = 0; _ < 50; _++) {
        const p = Math.random() * 6 - 3;
        const k = Math.floor(Math.random() * 4);
        const point =
          k === 0 ? [3, p] : k === 1 ? [-3, p] : k === 2 ? [p, 3] : [p, -3];
        collinear.push(...point);
      }

      scan.setVertices(arrayToVertices([...expected, ...inside, ...collinear]));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });

  it("generates hulls of more than 4 vertices", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [1,-2, -2.31, 0.89, -3.8,3.67, -3.5,-2.5, 2.75,-3.28, 4.88,1.14, 1.57,3.18],
        [1,-2, -5.95,-1.27, -3.8,3.67, -3.5,-2.5, 2.75,-3.28, 4.88,1.14, 1.57,3.18],
        [8,-3, -5.95,-1.27, -3.8,3.67, -3.5,-2.5, 2.75,-3.28, 4.88,1.14, 1.57,3.18],
      ],
      [
        [2.75,-3.28, 4.88,1.14, 1.57,3.18, -3.8,3.67, -3.5,-2.5],
        [2.75,-3.28, 4.88,1.14, 1.57,3.18, -3.8,3.67, -5.95,-1.27, -3.5,-2.5],
        [2.75,-3.28, 8,-3, 4.88,1.14, 1.57,3.18, -3.8,3.67, -5.95,-1.27, -3.5,-2.5],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull())).toEqual(expected);
    }
  });
});

describe("generateHull with kwargs", () => {
  const scan = new GrahamScan();

  it("includes collinear vertices", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [11.1,-0.3, -11.111,-0.3, -0.0055,4, 1.2,-0.3, -8.6344735,0.6589],
        [-3.83,1.36, 2,-2.4, 1,1, -2,-0.27, 1.294,0, 0,-1.335, -2.6222,0.2842, 0.9517,1.0036],
        [-3.83,1.36, 2,-2.4, 1,1, -2,-0.27, 1.294,0, 0,-1.335, -2.6222,0.2842, 0.9517,1.0036, -3.281,0.871, -1.27,0.73, 0.6,-0.6],
      ],
      [
        [-11.111,-0.3, 1.2,-0.3, 11.1,-0.3, -0.0055,4, -8.6344735,0.6589],
        [2,-2.4, 1.294,0, 1,1, 0.9517,1.0036, -3.83,1.36, -2.6222,0.2842, -2,-0.27, 0,-1.335],
        [2,-2.4, 1.294,0, 1,1, 0.9517,1.0036, -3.83,1.36, -3.281,0.871, -2.6222,0.2842, -2,-0.27, 0,-1.335],
      ]
    )) {
      for (const perm of permute(arrayToVertices(<number[]>input), 1000)) {
        scan.setVertices(perm);
        expect(vertsToFlArray(scan.generateHull({ includeCollinearVerts: true }))).toEqual(expected);
      }
    }
  });

  it("walks clockwise instead of counterclockwise", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [11.1, -0.3, -11.111, -0.3, 2, 1.2, -0.0055, 4, 1.2, -0.3],
        [-2, -2, 2, -2.4, 2, 1, 1.98, 5, -1, -1.3, 1, 0],
        [-3.83, 1.36, 2, -2.4, 1, 1, -2, -0.27, 1.294, 0, 0, -1.335, -2.6222, 0.2842, 0.9517, 1.0036],
      ],
      [
        [-11.111, -0.3, -0.0055, 4, 11.1, -0.3],
        [2, -2.4, -2, -2, 1.98, 5, 2, 1],
        [2, -2.4, -2, -0.27, -3.83, 1.36, 1, 1],
      ]
    )) {
      scan.setVertices(arrayToVertices(<number[]>input));
      expect(vertsToFlArray(scan.generateHull({ walkDirection: "cw" }))).toEqual(expected);
    }
  });

  it("includes collinear vertices AND walks clockwise", () => {
    // prettier-ignore
    for (const [input, expected] of zip(
      [
        [11.1,-0.3, -11.111,-0.3, -0.0055,4, 1.2,-0.3, -8.6344735,0.6589],
        [-3.83,1.36, 2,-2.4, 1,1, -2,-0.27, 1.294,0, 0,-1.335, -2.6222,0.2842, 0.9517,1.0036],
        [-3.83,1.36, 2,-2.4, 1,1, -2,-0.27, 1.294,0, 0,-1.335, -2.6222,0.2842, 0.9517,1.0036, -3.281,0.871, -1.27,0.73, 0.6,-0.6],
      ],
      [
        [-11.111,-0.3, -8.6344735,0.6589, -0.0055,4, 11.1,-0.3, 1.2,-0.3],
        [2,-2.4, 0,-1.335, -2,-0.27, -2.6222,0.2842, -3.83,1.36, 0.9517,1.0036, 1,1, 1.294,0],
        [2,-2.4, 0,-1.335, -2,-0.27, -2.6222,0.2842, -3.281,0.871, -3.83,1.36, 0.9517,1.0036, 1,1, 1.294,0],
      ]
    )) {
      for (const perm of permute(arrayToVertices(<number[]>input), 1000)) {
        scan.setVertices(perm);
        expect(vertsToFlArray(scan.generateHull({ includeCollinearVerts: true, walkDirection: "cw" }))).toEqual(expected);
      }
    }
  });
});
