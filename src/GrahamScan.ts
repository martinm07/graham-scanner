import { Vertex, Vertices } from "./helper";

const TOL = Number.parseFloat(import.meta.env.VITE_TOL);

export default class GrahamScan {
  vertices: Vertices = [];

  constructor() {}

  setVertices(vertices: Vertices) {
    this.vertices = vertices;
  }

  getStartingHullPoint(): Vertex {
    let best = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      if (
        this.vertices[i].y < this.vertices[best].y ||
        (this.vertices[i].y === this.vertices[best].y &&
          this.vertices[i].x < this.vertices[best].x)
      ) {
        best = i;
      }
    }
    return this.vertices[best];
  }

  static ccw(v1: Vertex, v2: Vertex, v3: Vertex) {
    return (v2.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (v2.y - v1.y);
  }

  generateHull(): Vertices {
    // debugger;
    if (this.vertices.length === 0) return [];

    const stack: Vertices = [this.getStartingHullPoint()];
    const P0 = stack[0];
    // P0 itself cannot be sorted by the coming call
    // ((P0, v2) => always returns 0, i.e. is considered equal to every point)
    // which ruins the assumption of transitivity (if a == b && b == c then a == c)
    // and thus the sorting for the rest of the vertices as well
    const points = this.vertices.filter((v) => !(v.x === P0.x && v.y === P0.y));
    // determinant of 2x2 matrix [ v2 - P0, v1 - P0 ] ; sorts points in ascending order
    //  of angle made from P0 to that point and the positive x-axis
    // Remember this is able to work because P0 is the lowest point and the angles we have
    //  to consider are in the range [0°, 180°]
    points.sort(
      (v1, v2) => (v2.x - P0.x) * (v1.y - P0.y) - (v1.x - P0.x) * (v2.y - P0.y)
    );

    const iterGrahamScan = (point: Vertex) => {
      // If ccw(last two points on hull, point) is negative that means they make a
      //  clockwise turn i.e. an inward bulge when we're trying to walk the hull counterclockwise,
      //  which we backtrack until is no longer the case so that we may add `point` to the hull
      while (
        stack.length > 1 &&
        GrahamScan.ccw(stack.at(-2)!, stack.at(-1)!, point) < TOL
      )
        stack.pop();
      stack.push(point);
    };

    let lastPoint: Vertex | undefined;
    // This loop is basically `for (const p of points) iterGrahamScan(p);`
    for (const p of points) {
      if (lastPoint !== undefined) {
        const v1 = lastPoint;
        const v2 = p;
        // same determinant as in points.sort() above ; trying to determine
        //  if points have same angle (are collinear with P0) and discarding
        //  all but the one farthest from P0.
        // The scan is probably able to work without this, and if that turns out
        //  faster then we may delete it.
        if (
          Math.abs(
            (v2.x - P0.x) * (v1.y - P0.y) - (v1.x - P0.x) * (v2.y - P0.y) - 0
          ) < TOL
        ) {
          // If the length of v2 (current point) is greater, update lastPoint
          if (
            (v1.x - P0.x) ** 2 + (v1.y - P0.y) ** 2 <
            (v2.x - P0.x) ** 2 + (v2.y - P0.y) ** 2
          ) {
            lastPoint = p;
          }
          // Regardless, skip to next iteration
          continue;
        }

        // We now know lastPoint is the only one to consider from its (potential)
        //  collinear neighbours in the sorted list (since we found the current point
        //  to not be collinear), so we may consider it.
        iterGrahamScan(lastPoint);
      }
      lastPoint = p;
    }
    // Consider the last lastPoint, since its (potential) collinear neighbours have ended
    iterGrahamScan(lastPoint!);

    return stack;
  }
}
