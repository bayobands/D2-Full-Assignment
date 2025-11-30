import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = "";

// --- Title ---
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.appendChild(title);

// --- Canvas ---
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "sketchCanvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

// --- Buttons ---
const buttonRow = document.createElement("div");
document.body.appendChild(buttonRow);

const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
buttonRow.appendChild(clearBtn);

const undoBtn = document.createElement("button");
undoBtn.textContent = "Undo";
buttonRow.appendChild(undoBtn);

const redoBtn = document.createElement("button");
redoBtn.textContent = "Redo";
buttonRow.appendChild(redoBtn);

// ======================================================
// STEP 5: COMMAND INTERFACE + MARKER COMMAND
// ======================================================

interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
}

class MarkerCommand implements DisplayCommand {
  points: Array<[number, number]> = [];

  constructor(x: number, y: number) {
    this.points.push([x, y]);
  }

  drag(x: number, y: number) {
    this.points.push([x, y]);
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.points[0][0], this.points[0][1]);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i][0], this.points[i][1]);
    }
    ctx.stroke();
  }
}

// ======================================================
// DATA STRUCTURES
// ======================================================
let displayList: DisplayCommand[] = [];
let redoStack: DisplayCommand[] = [];
let currentCommand: MarkerCommand | null = null;

// ======================================================
// REDRAW
// ======================================================
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const cmd of displayList) {
    cmd.display(ctx);
  }
}

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

// ======================================================
// MOUSE EVENTS
// ======================================================
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentCommand = new MarkerCommand(x, y);
  displayList.push(currentCommand);
  redoStack = [];

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (!currentCommand) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentCommand.drag(x, y);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
});
canvas.addEventListener("mouseleave", () => {
  currentCommand = null;
});

// ======================================================
// CLEAR
// ======================================================
clearBtn.addEventListener("click", () => {
  displayList = [];
  redoStack = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// ======================================================
// UNDO / REDO
// ======================================================
undoBtn.addEventListener("click", () => {
  if (displayList.length === 0) return;

  const popped = displayList.pop()!;
  redoStack.push(popped);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length === 0) return;

  const popped = redoStack.pop()!;
  displayList.push(popped);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Example asset
const example = document.createElement("p");
example.innerHTML =
  `Example asset: <img src="${exampleIconUrl}" class="icon" />`;
document.body.appendChild(example);
