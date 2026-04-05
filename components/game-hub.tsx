"use client";

import { Divide } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TicCell = "X" | "0" | null;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type MemoryCard = {
    id: number;
    value: string;
    flipped: boolean;
    matched: boolean;
};

const MEMORY_EMOJIS = ["🎮", "🚀", "⭐️", "🐉", "🏁", "⚡️", "🧩", "🎯"];

type Pillar = {
    x: number;
    gapY: number;
    scored: boolean
};

const GAME_LINKS = [
    { href: "#tic-tac-toe", label: "Tic Tac Toe" },
    { href: "#memory-game", label: "Memory Game" },
    { href: "#flappy-bird", label: "Flappy Bird" },
    { href: "#reaction-game", label: "Reaction Game" },
];

function shuffle<T>(array: T[]) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
     }
     return copy;
    }

function calculateWinner(board: TicCell[]) {
    for (const [a, b, c] of WINNING_LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function buildMemoryDeck(): MemoryCard[] {
    const pairs = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS];
    return shuffle(pairs).map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
    }));
}

export default function GameHub() {
    // TIc Tac Toe
    const [ticBoard, setTicBoard] = useState<TicCell[]>(Array(9).fill(null));
    const [xTurn, setXTurn] = useState(true);
    const ticWinner = useMemo(() => calculateWinner(ticBoard), [ticBoard]);
    const isTicDraw = useMemo(
        () => !ticWinner && ticBoard.every(Boolean),
        [ticBoard, ticWinner],
    );

    const playTic = (index: number) => {
        if (ticBoard[index] || ticWinner) return;
        setTicBoard((prev) => {
            const next = [...prev];
            next[index] = xTurn ? "X" : "0";
            return next;
        });
        setXTurn((prev) => !prev);
    };

    // Memory Game
    const [memoryCards, setMemoryCards] = useState<MemoryCard[]>(() =>
     buildMemoryDeck(),
);
const [openCards, setOpenCards] = useState<number[]>([]);
const [memoryMoves, setMemoryMoves] = useState(0) ;

useEffect(() => {
    if (openCards.length !== 2) return;
    const [firstId, secondId] = openCards;
    const first = memoryCards.find((card) => card.id === firstId);
    const second = memoryCards.find((card) => card.id === secondId);
  if (!first || !second) return;

  if (first.value === second.value) {
    setMemoryCards((prev) =>
      prev.map((card) =>
        card.id === firstId || card.id === secondId
          ? { ...card, matched: true }
          : card,
      ),
    );
    setOpenCards([]);
    return;
  }
  const timeout = setTimeout(() => {
    setMemoryCards((prev) =>
      prev.map((card) =>
        card.id === firstId || card.id === secondId
          ? { ...card, flipped: false }
          : card,
      ),
    );
    setOpenCards([]);
  }, 700);
  return () => clearTimeout(timeout);
}, [openCards, memoryCards]);

const flipCard = (id: number) => {
    if (openCards.length >= 2) return;
    const card = memoryCards.find((item) => item.id === id);
    if (!card || card.flipped || card.matched) return;

    setMemoryCards((prev) =>
     prev.map((item) => (item.id === id ? { ...item, flipped: true } : item)),)
setOpenCards((prev) => [...prev, id]);
setMemoryMoves((prev) => prev + 1);
};

// Flappy Bird
const [birdY, setBirdY] = useState(180);
const [birdVelocity, setBirdVelocity] = useState(0);
const [pillars, setPillars] = useState<Pillar[]>([
    { x: 460, gapY: 120, scored: false },
    { x: 680, gapY: 180, scored: false },
]);
const [flappyScore, setFlappyScore] = useState(0);
const [flappyRunning, setFlappyRunning] = useState(false);
const [flappyOver, setFlappyOver] = useState(false);
const gameAreaRef = useRef<HTMLDivElement | null>(null);

const restartFlappy = () => {
    setBirdY(180);
    setBirdVelocity(0);
    setPillars([
        { x: 460, gapY: 120, scored: false },
        { x: 680, gapY: 180, scored: false },
]);
    setFlappyScore(0);
    setFlappyOver(false);
    setFlappyRunning(true);
};

const flap = () => {
    if (flappyOver) {
        restartFlappy();
        return;
    }
    setFlappyRunning(true);
    setBirdVelocity(-8);
};

useEffect(() => {
    if (!flappyRunning || flappyOver) return;
    const areaHeight = 320;
    const birdSize = 24;
    const pillarWidth = 54;
    const gapHeight = 110;
    const birdX = 90;

    const tick = setInterval(() => {
        setBirdVelocity((prev) => prev = 0.5);
        setBirdY((prev) => prev = birdVelocity);

        setPillars((prev) =>
            prev.map((pillar) => {
               let nextX = pillar.x - 4;
               if (nextX < -pillarWidth) {
                 nextX = 480;
                 return {
                    x: nextX,
                     gapY: 70 + Math.random() * 150,
                     scored: false,
                 };
                }

                if (!pillar.scored && nextX + pillarWidth < birdX) {
                    setFlappyScore((score) => score + 1);
                    return { ...pillar, x: nextX, scored: true };
                }

                return { ...pillar, x: nextX };
            }),
        );

        const hitGround = birdY < 0 || birdY + birdSize > areaHeight;
        const hitPillar = pillars.some((pillar) => {
         const overlapsX =
            birdX + birdSize > pillar.x && birdX < pillar.x + pillarWidth;
         const inGap =
          birdY > pillar.gapY && birdY + birdSize < pillar.gapY + gapHeight;
        return overlapsX && !inGap;
        });

        if (hitGround || hitPillar) {
            setFlappyOver(true);
            setFlappyRunning(false);
        }
    }, 28);

    return () => clearInterval(tick);
}, [birdVelocity, birdY, flappyRunning, flappyOver, pillars]);

useEffect(() => {
    const handler = (event: KeyboardEvent) => {
        if (event.code === "Space") {
            event.preventDefault();
            flap();
        }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
});

// Reaction Game
const [reactionState, setReactionState] = useState<
    "idle" | "waiting" | "go" | "finished"
>("idle");
const [reactionMessage, setReactionMessage] =
 useState("Click start and wait for green");
 const [reactionMs, setReactionMs] = useState<number | null>(null);
 const reactionStartRef = useRef<number | null>(null);
 const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 const startReaction = () => {
    if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
    }
    setReactionState("waiting");
    setReactionMs(null);
    setReactionMessage("Wait for green...");
    const waitMs = 1400 + Math.random() * 2200;
    reactionTimeoutRef.current = setTimeout(() => {
        reactionStartRef.current = performance.now();
        setReactionState("go");
        setReactionMessage("CLICK!");
    }, waitMs);
 };

 const handleReactionClick = () => {
    if (reactionState === "waiting") {
        if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
        setReactionState("idle");
        setReactionMessage("Too soon! Try again");
        return;
    }

    if(reactionState === "go" && reactionStartRef.current) {
        const elapsed = Math.round(performance.now() - reactionStartRef.current);
        setReactionMs(elapsed);
        setReactionState("finished");
        setReactionMessage("Nice reflexes");
    }
 };

 return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
        <section className="rounded-2xl border bg-card p-6">
            <h1 className="text-3xl font-bold">Arcade Zone</h1>
            <p className="mt-2 text-muted-forground">
                Play four mini games right in your browser.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
                {GAME_LINKS.map((game) => (
                    <a
                      key={game.href}
                      href={game.href}
                      className="rounded-full boarder px-4 py-2 text-sm transition hover:bg-muted"
                    >
                        {game.label}
                    </a>
                ))}
            </div>
        </section>

        <section id="tic-tac-toe" className="rounded-2xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Tic Tac Toe</h2>
                <button
                type="button"
                onClick={() => {
                    setTicBoard(Array(9).fill(null));
                    setXTurn(true);
                }}
                className="rounded-md boarder px-3 py-1.5 text-sm hover:bg-muted"
            >
                Reset
            </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
            {ticWinner
                ? 'Winner: ${ticWinner}'
                : isTicDraw
                 ? "Draw game."
                 : 'Turn: ${xTurn ? "X" : "0"}'}
            </p>
            <div className="grid max-w-xs grid-cols-3 gap-2">
              {ticBoard.map((value, index) => (
                <button
                 type="button"
                 key={index}
                 onClick={() => playTic(index)}
                 className="flex h-20 items-center justify-center rounded-md border text-2xl font-bold hover bg-muted"
            >
                 {value}
                 </button>
              ))}
            </div>
        </section>

<section id="memory-game" className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Memory Game</h2>
          <button
            type="button"
            onClick={() => {
              setMemoryCards(buildMemoryDeck());
              setOpenCards([]);
              setMemoryMoves(0);
            }}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Shuffle
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Moves: {memoryMoves}</p>
        <div className="grid grid-cols-4 gap-2 sm:max-w-md">
          {memoryCards.map((card) => (
            <button
              type="button"
              key={card.id}
              onClick={() => flipCard(card.id)}
              className="flex h-16 items-center justify-center rounded-md border text-2xl hover:bg-muted"
            >
              {card.flipped || card.matched ? card.value : "?"}
            </button>
          ))}
        </div>
      </section>
      <section id="flappy-bird" className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Flappy Bird</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Score: {flappyScore}</span>
            <button
              type="button"
              onClick={restartFlappy}
              className="rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              Restart
            </button>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Click the game area or press Space to flap.
        </p>
        <div
          ref={gameAreaRef}
          onClick={flap}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              flap();
            }
          }}
          className="relative h-80 w-full max-w-xl cursor-pointer overflow-hidden rounded-lg border bg-sky-100"
        >
          <div
            className="absolute h-6 w-6 rounded-full bg-yellow-400"
            style={{ left: 90, top: birdY }}
          />
          {pillars.map((pillar, index) => (
            <div key={index}>
              <div
                className="absolute w-14 bg-green-500"
                style={{ left: pillar.x, top: 0, height: pillar.gapY }}
              />
              <div
                className="absolute w-14 bg-green-500"
                style={{
                  left: pillar.x,
                  top: pillar.gapY + 110,
                  height: 320 - (pillar.gapY + 110),
                }}
              />
            </div>
          ))}
          {flappyOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-center text-white">
              <p className="rounded-md bg-black/50 px-4 py-2">
                Game over. Click to restart.
              </p>
            </div>
          )}
        </div>
      </section>
      <section id="reaction-game" className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Reaction Game</h2>
          <button
            type="button"
            onClick={startReaction}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Start
          </button>
        </div>
        <div
          onClick={handleReactionClick}
          className="flex h-44 cursor-pointer items-center justify-center rounded-lg border text-center"
          style={{
            background:
              reactionState === "go"
                ? "#86efac"
                : reactionState === "waiting"
                  ? "#fde68a"
                  : "#f4f4f5",
          }}
        >
          <div>
            <p className="text-xl font-semibold">{reactionMessage}</p>
            {reactionMs !== null && (
              <p className="mt-2 text-sm text-muted-foreground">
                Your time: {reactionMs} ms
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}