import { Vertex, Vertices } from "./helper";

const TOL = Number.parseFloat(import.meta.env.VITE_TOL);

interface GrahamScanOpts {
  includeCollinearVerts?: boolean;
  numericalErrorTolerance?: number;
  walkDirection?: "cw" | "ccw";
}

export default class GrahamScan {
  vertices: Vertices = [];

  constructor() {}

  setVertices(vertices: Vertices) {
    this.vertices = vertices;
  }

  static isValid(n?: number) {
    return n !== undefined && n !== null && isFinite(n) && !isNaN(n);
  }

  getStartingHullPoint(): Vertex | undefined {
    let best = -1;
    for (let i = 0; i < this.vertices.length; i++) {
      if (
        GrahamScan.isValid(this.vertices[i].x) &&
        GrahamScan.isValid(this.vertices[i].y) &&
        (best === -1 ||
          this.vertices[i].y < this.vertices[best].y ||
          (this.vertices[i].y === this.vertices[best].y &&
            this.vertices[i].x < this.vertices[best].x))
      ) {
        best = i;
      }
    }
    return best === -1 ? undefined : this.vertices[best];
  }

  static ccw(v1: Vertex, v2: Vertex, v3: Vertex) {
    return (v2.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (v2.y - v1.y);
  }

  generateHull(kwargs?: GrahamScanOpts): Vertices {
    // debugger;
    if (this.vertices.length === 0) return [];
    else if (this.vertices.length === 1) return [this.vertices[0]];
    const TOL_ = kwargs?.numericalErrorTolerance ?? TOL;
    // "ICLV -> Include ColLinear Vertices": If false then 1, else true then -1
    const ICLV = Number(kwargs?.includeCollinearVerts ?? false) * -2 + 1;
    // "CW -> ClockWise" If false then 1, else -1.
    // In both of these "-1" represents a change from the default behaviour
    const CW = Number(kwargs?.walkDirection === "cw") * -2 + 1;

    const P0 = this.getStartingHullPoint();
    if (!P0) return [];
    const stack: Vertices = [P0];
    // P0 itself cannot be sorted by the coming call
    // ((P0, v2) => always returns 0, i.e. is considered equal to every point)
    // which ruins the assumption of transitivity (if a == b && b == c then a == c)
    // and thus the sorting for the rest of the vertices as well
    const points = this.vertices.filter(
      (v) =>
        !(v.x === P0.x && v.y === P0.y) &&
        GrahamScan.isValid(v.x) &&
        GrahamScan.isValid(v.y)
    );
    // determinant of 2x2 matrix [ v2 - P0, v1 - P0 ] ; sorts points in ascending order
    //  of angle made from P0 to that point and the positive (negative if CW) x-axis
    // Remember this is able to work because P0 is the lowest point and the angles we have
    //  to consider are in the range [0°, 180°]
    points.sort(
      (v1, v2) =>
        CW * (v2.x - P0.x) * (v1.y - P0.y) - CW * (v1.x - P0.x) * (v2.y - P0.y)
    );

    const iterGrahamScan = (point: Vertex) => {
      // If ccw(last two points on hull, point) is negative that means they make a
      //  clockwise turn i.e. an inward bulge when we're trying to walk the hull counterclockwise,
      //  which we backtrack until is no longer the case so that we may add `point` to the hull
      let i = stack.length;
      // If "clockwise," changes the sign of ccw,
      // If "ICLV," excludes values in the tolerance of being considered "0"
      while (
        i > 1 &&
        CW * GrahamScan.ccw(stack[i - 2], stack[i - 1], point) < ICLV * TOL_
      )
        i--;
      stack.splice(i, Infinity, point);
    };

    let vertices: Vertices | undefined;
    let firstIter: boolean = true;
    const finalizeVertices = (finished?: boolean) => {
      let mul: number;
      if (firstIter) {
        mul = 1;
        firstIter = false;
      } else if (finished) mul = -1;
      else mul = 0;

      // Sort the array by increasing distance from P0 for firstIter, and by
      //  decreasing distance for last iter. It's important we only sort the array
      //  in these two instances.
      if (ICLV === -1 && mul !== 0)
        vertices!.sort(
          (v1, v2) =>
            mul * ((v1.x - P0.x) ** 2 + (v1.y - P0.y) ** 2) -
            mul * ((v2.x - P0.x) ** 2 + (v2.y - P0.y) ** 2)
        );
      // We always reduce the array here, even for the times we don't have to
      //  TBD if this is a performance improvement or deficit.
      else if (ICLV !== -1)
        vertices = [
          vertices!.reduce((v1, v2) =>
            (v1.x - P0.x) ** 2 + (v1.y - P0.y) ** 2 >
            (v2.x - P0.x) ** 2 + (v2.y - P0.y) ** 2
              ? v1
              : v2
          ),
        ];
    };

    // This loop is basically `for (const p of points) iterGrahamScan(p);`
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (vertices !== undefined) {
        const v1 = vertices[0];
        const v2 = p;
        // same determinant as in points.sort() above; trying to determine
        //  if vertices have same angle (are collinear with P0) so that we can
        //  collect all the vertices (unsorted amongst themselves) to handle as necessary
        if (
          Math.abs(
            (v2.x - P0.x) * (v1.y - P0.y) - (v1.x - P0.x) * (v2.y - P0.y)
          ) < TOL_
        ) {
          vertices.push(p);
          continue;
        }
        // If we're including collinear vertices (ICLV) then this will sort the list
        // Otherwise, it'll reduce the list to length one containing the farthest point
        // NOTE: This doesn't actually need to happen for all but the two segments
        //  connected to P0 in the hull; vertices of other segments in the hull will
        //  always have distinct angles, and the algorithm can find its way to those
        //  points naturally.
        finalizeVertices();

        vertices.forEach((p) => iterGrahamScan(p));
      }
      vertices = [p];
    }
    // The current list of vertices is now known to all be on the convex hull, handle as necessary
    // Note, the reason we have to collect all the lists of same polar-angles vertices (even though
    //  we don't do anything with all but the first and last) is because we don't know which one will
    //  be the last one. Techically we can find out (if we have some computation of the angle we can
    //  find out how many are at the end of the sorted `points`), but if that's worth it I don't know
    //  (it would mean potentially giving up numerical precision, and benchmarking needs to be done).
    finalizeVertices(true);
    vertices?.forEach((p) => iterGrahamScan(p));

    return stack;
  }
}
