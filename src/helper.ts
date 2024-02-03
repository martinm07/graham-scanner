export type Vec2 = [x: number, y: number];
export type Vertex = { x: number; y: number };
export type Vertices = Vertex[];

export function arrayToVert(input: [x: number, y: number]): Vertex {
  return { x: input[0], y: input[1] };
}
export function arrayToVertices(
  input: number[] | [x: number, y: number][]
): Vertices {
  if (input.length === 0) return [];
  const final: Vertices = [];

  if (((l: typeof input): l is number[] => typeof l[0] === "number")(input)) {
    if (input.length % 2 !== 0)
      throw new Error("Input is flat and has an odd numbered length");

    for (let i = 0; i < input.length / 2; i++)
      final.push({ x: input[i * 2], y: input[i * 2 + 1] });
  } else {
    for (let i = 0; i < input.length; i++)
      final.push({ x: input[i][0], y: input[i][1] });
  }
  return final;
}
export function vertToArray(input: Vertex): [x: number, y: number] {
  return [input.x, input.y];
}
export function vertsToArray(input: Vertices): [x: number, y: number][] {
  return input.map((v) => [v.x, v.y]);
}
export function vertsToFlArray(input: Vertices): number[] {
  return input.map((v) => [v.x, v.y]).flat();
}

export function zip(...arrays: unknown[][]): unknown[][] {
  if (arrays.length === 0) return [];
  const final = Array(arrays[0].length);
  if (!arrays.map((arr) => arr.length).every((el) => el === final.length))
    throw new Error(`Arrays had incosistent lengths. Received: ${arrays}`);
  for (let i = 0; i < final.length; i++) {
    final[i] = arrays.map((arr) => arr[i]);
  }
  return final;
}

export function factorial(n: number) {
  let final = n;
  for (let k = n - 1; k > 1; k--) final *= k;
  return final;
}

export function permute<T>(array: T[], max: number = 1000): T[][] {
  const final = Array(factorial(array.length));
  let index = 0;
  // https://stackoverflow.com/a/20871714/11493659
  const permute = (arr: T[], m: T[] = []) => {
    if (index >= max) return;
    if (arr.length === 0) {
      final[index++] = m;
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };
  permute(array);
  return final.slice(0, max);
}
