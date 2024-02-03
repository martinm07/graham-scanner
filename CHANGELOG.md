# 1.1.0

- Added logo (located in ./img/)
- Added kwargs to generateHull():
- - `includeCollinearVerts` (boolean) Whether or not to include collinear vertices that are on the convex hull (default `false`)
- - `numericalErrorTolerance` (number) The maximum accepted numerical error under which it considers 3 vertices collinear. This affects you even if you don't includeCollinearVerts, and may be customised to suit the magnitude of your numbers (is the range of your numbers in the 1000s or the 0.001s?) (default `0.000005` and approximately suited for numbers in the 10s)
- - `walkDirection` ("cw" | "ccw") Is either clockwise or counterclockwise. Note it isn't as simple as reversing the order of the output, since the starting vertex remains unchanged, and is always the first element.
- generateHull() now ignores vertices with any coordinate being `undefined`, `null`, `NaN` or `+/-Infinity`. **This is a change in default behaviour and potential breaking change.**
