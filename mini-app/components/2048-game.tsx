"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTile() {
  return Math.random() < TILE_PROBABILITIES[0] ? 2 : 4;
}

function cloneBoard(board: number[][]) {
  return board.map(row => [...row]);
}

export function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize board with two tiles
  useEffect(() => {
    const initBoard = cloneBoard(board);
    addRandomTile(initBoard);
    addRandomTile(initBoard);
    setBoard(initBoard);
  }, []);

  function addRandomTile(b: number[][]) {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    b[r][c] = getRandomTile();
  }

  function canMove(b: number[][]) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && b[r][c] === b[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  }

  function move(direction: "up" | "down" | "left" | "right") {
    if (gameOver) return;
    let moved = false;
    const newBoard = cloneBoard(board);

    const traverse = (start: number, end: number, step: number) => {
      for (let i = start; i !== end; i += step) {
        for (let j = start; j !== end; j += step) {
          const val = newBoard[i][j];
          if (val === 0) continue;
          let ni = i, nj = j;
          while (true) {
            const ti = ni + (direction === "up" ? -1 : direction === "down" ? 1 : 0);
            const tj = nj + (direction === "left" ? -1 : direction === "right" ? 1 : 0);
            if (ti < 0 || ti >= GRID_SIZE || tj < 0 || tj >= GRID_SIZE) break;
            if (newBoard[ti][tj] === 0) {
              ni = ti; nj = tj;
            } else if (newBoard[ti][tj] === val) {
              newBoard[ti][tj] *= 2;
              setScore(prev => prev + newBoard[ti][tj]);
              newBoard[i][j] = 0;
              moved = true;
              if (newBoard[ti][tj] === 2048) setGameWon(true);
              break;
            } else {
              break;
            }
          }
          if (ni !== i || nj !== j) {
            newBoard[ni][nj] = val;
            newBoard[i][j] = 0;
            moved = true;
          }
        }
      }
    };

    if (direction === "up") traverse(0, GRID_SIZE, 1);
    if (direction === "down") traverse(GRID_SIZE - 1, -1, -1);
    if (direction === "left") traverse(0, GRID_SIZE, 1);
    if (direction === "right") traverse(GRID_SIZE - 1, -1, -1);

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      if (!canMove(newBoard)) setGameOver(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex h-16 w-16 items-center justify-center rounded-md text-2xl font-bold ${
              val === 0
                ? "bg-gray-200"
                : val <= 4
                ? "bg-orange-200"
                : val <= 8
                ? "bg-orange-300"
                : val <= 16
                ? "bg-orange-400"
                : val <= 32
                ? "bg-orange-500"
                : val <= 64
                ? "bg-orange-600"
                : val <= 128
                ? "bg-orange-700"
                : val <= 256
                ? "bg-orange-800"
                : val <= 512
                ? "bg-orange-900"
                : "bg-orange-950 text-white"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("down")}>↓</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameWon && <div className="text-green-600 font-bold">You reached 2048!</div>}
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-red-600 font-bold">Game Over</div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
