=
# How I Solved a State Management Bug by Rethinking My Data Structure

## The Problem: A Simple Game Turned into a Mess

I was building a **slot machine game** using **Svelte** and **TypeScript**. The idea was simple: three reels that spin when the player hits “SPIN,” and each reel displays four symbols at a time.

The initial structure made sense in my head:

* Each reel has its own state
* A central store tracks whether reels are spinning
* The game loop coordinates the spin timing

I jumped straight into implementation.

### The Initial Setup

```typescript
// config.ts — Game structure
export const GAME_CONFIG = {
  reels: 3,
  symbolsPerReel: 20,
  visibleSymbols: 4,
  spinDuration: 8000,
};

// gameStore.ts — Central state
const reels = writable<ReelState[]>([
  { symbols: [...], position: 0, isSpinning: false },
  { symbols: [...], position: 2, isSpinning: false },
  { symbols: [...], position: 4, isSpinning: false }
]);

// gameLoop.ts — Starts animations
function startSpin() {
  gameStore.spin(); // Trigger game state
  // Animate reels
}

// Reel.svelte — Each reel
function animateReel() {
  // Handle animation for individual reel
}
```

At a glance, the architecture looked clean:

* `gameStore.ts`: managed state
* `gameLoop.ts`: triggered spins
* `Reel.svelte`: handled visuals
* `config.ts`: defined the game setup

### The Bug That Exposed the Flaws

Everything was working until it wasn’t. A strange bug appeared:
The game would **trigger a second spin** even when the player hadn't clicked anything.

Here's what was happening under the hood:

```typescript
gameStore.spin();           // Player clicks SPIN
gameLoop.startSpin();       // Animation begins
Reel.svelte.animateReel();  // Each reel animates
```

But somehow, a second, unexpected spin would sometimes get triggered — without input.

### Root Causes

* Too many separate files were involved in managing the same spin state
* Race conditions between animation triggers and state updates
* Inconsistent timing between components
* I couldn’t reliably trace where and why a second spin started
* Adding or tweaking features became risky and unpredictable

## The Real Mistake: Not Planning the Data Model

Looking back, this wasn’t just a coding bug. The mistake started with my data model. I dove straight into state and animation without thinking deeply about **what I actually needed to track**.

I defined the reel like this:

```typescript
interface ReelState {
  symbols: Symbol[];
  position: number;
  isSpinning: boolean;
}
```

But I never asked why I was using these structures. They seemed "obvious", but they weren’t solving the actual problem.

## Stepping Back Helped Me See the Real Goal

After getting frustrated, I walked away from the code for five minutes. That was enough to reset my thinking.

I asked a basic question:

> “What does the game actually need to track during a spin?”

The answer:

> “Which **four** symbols are currently visible on each reel — and how they change over time.”

That’s it. Everything else was complexity I had added unnecessarily.

## Arrays Were a Better Fit

Instead of managing a full reel object with booleans and nested state, I pre-allocated a large array that could simulate infinite spinning by looping through it using array indices.

```typescript
// Pre-allocate 100 sets of symbols (20 * 100 = 2000 symbols)
let reelArray: Symbol[] = [];

$: if (symbols.length > 0 && reelArray.length === 0) {
  reelArray = Array(100).fill(symbols).flat();
}
```

Then, instead of managing state across components, I just used simple index math to determine which four symbols should be displayed:

```typescript
function getCurrentArrayPosition(debug: any, arrayLength: number) {
  if (!debug || !debug.isSpinning) return 0;
  const offset = (debug.spinCount || 0) * (debug.originalSymbolCount || 5);
  return offset % arrayLength;
}

function getVisibleIndices(currentPosition: number, arrayLength: number) {
  const indices = [];
  for (let i = 0; i < 4; i++) {
    indices.push((currentPosition + i) % arrayLength);
  }
  return indices;
}
```

## Why This Solved the Problem

* **No more unexpected spins:** The system no longer relied on external state updates to determine when to animate.
* **Index-based math is easy to reason about:** I always know which part of the array I’m showing.
* **Avoids unnecessary DOM updates:** I’m not pushing new symbols into arrays — just referencing existing ones.
* **Infinite scroll behavior:** Using modulo arithmetic creates seamless looping without extra logic.
* **Debugging is simpler:** I can log visible indices to know exactly what’s being shown at any time.

### Bonus: Visual Debugging

I added a debug overlay in each reel component:

```svelte
{#each visibleIndices as index, position}
  <div class="overlay-index">
    <div class="index-number">[{index}]</div>
    <div class="position-label">Pos {position + 1}</div>
  </div>
{/each}
```

This shows exactly which indices in the reel array are visible during the spin.

## Key Takeaways

This wasn’t just a bug fix — it was a reminder that poor planning creates fragile systems.

**What I learned:**

* Think through your data model before jumping into state or UI.
* Use the simplest structure that solves the problem — in this case, arrays and index math were enough.
* Avoid sharing too much state across components when a local calculation will do.
* Sometimes, stepping away from the screen reveals the real issue.

## Final Outcome

By switching to an array-based model:

* The phantom spin bug disappeared
* Animation logic became more predictable
* I reduced component complexity
* I gained better insight into what the game was displaying at any time

## In Summary

This bug wasn’t about a broken animation or a bad state update.
It happened because I tried to solve the problem **without clearly understanding it first**.

Once I focused on *what the game actually needed*, the solution was simple — and the system became much more robust as a result.
