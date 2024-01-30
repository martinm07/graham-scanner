import "./style.css";
import GrahamScan from "./GrahamScan";
import { Vec2, arrayToVertices, factorial, permute, zip } from "./helper";

const scan = new GrahamScan();
const input = [0.1, 1.1, 1.1, 0.1, 0.2, 0.3];
// prettier-ignore
// const input: Vec2[] = [
//   [0, 0], [1, 0], [1, -0.1],
//   [0, 0.2], [1, 0.2], [1, 0.1],
// ];
// const input_ = arrayToVertices(input);
// const input_ = arrayToVertices([11.1, -0.3, -11.111, -0.3, 2, 1.2, -0.0055, 4]);
scan.setVertices([
  { x: 11.1, y: -0.3 },
  { x: -11.111, y: -0.3 },
  { x: 2, y: 1.2 },
  { x: -0.0055, y: 4 },
]);
const hull = scan.generateHull();
console.log(hull);

console.log(zip(["a", "b", "c"], [1, 2, 3]));
console.log(factorial(5));
console.log(permute([1, 2, 3]));
