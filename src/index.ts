import GrahamScan from "./GrahamScan";
import { Vec2, arrayToVertices, factorial, permute, zip } from "./helper";

const scan = new GrahamScan();
// const input = [
//   -3.83, 1.36, 2, -2.4, 1, 1, -2, -0.27, 1.294, 0, 0, -1.335, -2.6222, 0.2842,
//   0.9517, 1.0036,
// ];
// const input = [11.1, -0.3, -11.111, -0.3, 2, 1.2, -0.0055, 4];

// for (const [input, expected] of zip(
//   [
//     [-6, -6, 6, -6, 6, 6, -6, 6, 0, 0],
//     [-6, -6, 6, -6, 6, 6, -6, 6, 0, 0, -3, -3, 5, 5],
//     [-3, -3, 5, 5, 4, 1, -6, -6, 6, -6, 6, 6, -6, 6, 0, 0],
//   ],
//   [
//     [-6, -6, 6, -6, 6, 6, -6, 6],
//     [-6, -6, 6, -6, 6, 6, -6, 6],
//     [-6, -6, 6, -6, 6, 6, -6, 6],
//   ]
// )) {
//   scan.setVertices(arrayToVertices(<number[]>input));
//   console.log(scan.generateHull());
// }

const input = [-3, -3, 3, -2.9999196064548443, 3, 3, -3, 3, 3, -3];
// prettier-ignore
// const input: Vec2[] = [
//   [0, 0], [1, 0], [1, -0.1],
//   [0, 0.2], [1, 0.2], [1, 0.1],
// ];
const input_ = arrayToVertices(input);
scan.setVertices(input_);
// const input_ = arrayToVertices([11.1, -0.3, -11.111, -0.3, 2, 1.2, -0.0055, 4]);
// scan.setVertices([
//   { x: -3.83, y: 1.36 },
//   { x: 2, y: -2.4 },
//   { x: 1, y: 1 },
//   { x: 1.294, y: 0 },
//   { x: 0, y: -1.335 },
//   { x: -2, y: -0.27 },
//   { x: -2.6222, y: 0.2842 },
//   { x: 0.9517, y: 1.0036 }
// ]);
// const hull = scan.generateHull({ includeCollinearVerts: true });
// const hull = scan.generateHull({ walkDirection: "cw" });
// const hull = scan.generateHull({
//   walkDirection: "cw",
//   includeCollinearVerts: true,
// });
const hull = scan.generateHull();
console.log(hull);

console.log(zip(["a", "b", "c"], [1, 2, 3]));
console.log(factorial(5));
console.log(permute([1, 2, 3], 2));
