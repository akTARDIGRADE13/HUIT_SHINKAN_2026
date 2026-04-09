import testCase1 from "./testCase1";
import testCase2 from "./testCase2";
import testCase3 from "./testCase3";

export type PuzzleCase = {
  id: string;
  label: string;
  size: number;
  board: number[][];
};

export const puzzleCases: PuzzleCase[] = [
  { id: "4x4", label: "4×4", size: 4, board: testCase1 },
  { id: "5x5", label: "5×5", size: 5, board: testCase2 },
  { id: "10x10", label: "10×10", size: 10, board: testCase3 },
];
