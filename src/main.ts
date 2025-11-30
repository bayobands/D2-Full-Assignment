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

// --- Buttons Row ---
const buttonRow = document.createElement("div");
document.body.appendChild(buttonRow);

// Clear, Undo, Redo
const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
buttonRow.appendChild(clearBtn);

const undoBtn = document.createElement("button");
undoBtn.textContent = "Undo";
buttonRow.appendChild(undoBtn);

const redoBtn = document.createElement("button");
redoBtn.textContent = "Redo";
buttonRow.appendChild(redoBtn);

// Step 6 marker buttons
const thinBtn = document.createElement("button");
thinBtn.textContent = "Thin Marker";
thinBtn.classList.add("selectedTool");
buttonRow.appendChild(thinBtn);

const thickBtn = document.createElement("button");
thickBtn.textContent = "Thick Marker";
buttonRow.appendChild(thickBtn);

// STEP 8A sticker buttons
const stickerRow = document.createElement("div");
document.body.appendChild(stickerRow);

const stickers = ["😀", "⭐", "🔥"];
let currentSticker: string | null = null;

stickers.forEach((stk) => {
  const btn = document.createElement("button");
  btn.textContent = stk;
  stickerRow.appendChild(btn);

  btn.addEventListener("click", () => {
    currentSticker = stk;
    currentThickness = 0; // disable marker thickness when using sticker tool

    // Highlight selected
    document.querySelectorAll("button").forEach((b) =>
      b.classList.remove("selectedTool")
    );
    btn.classList.add("selectedTool");
  });
});

// Current marker thickness
let currentThickness = 2;

// Highlight tool helper
function selectTool(btn: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((b) =>
    b.classList.remove("selectedTool")
  );
  btn.classList.add("selectedTool");
}

// Marker selection (when not in sticker tool mode)
thinBtn.addEventListener("click", () => {
  currentSticker = null; // leave sticker mode
  currentThickness = 2;
  selectTool(thinBtn);
});
thickBtn.addEventListener("click", () => {
  currentSticker = null;
  currentThickness = 7;
  selectTool(thickBtn);
});

// ======================================================
// COMMAND INTERFACE + COMMANDS
// ======================================================

interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
}

class MarkerCommand implements DisplayCommand {
  points: Array<[number, number]> = [];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points.push([x, y]);
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push([x, y]);
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.lineWidth = this.thickness;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(this.points[0][0], this.points[0][1]);

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i][0], this.points[i][1]);
    }

    ctx.stroke();
  }
}

// --- NEW FOR STEP 8A: Sticker Command ---
class StickerCommand implements DisplayCommand {
  x: number;
  y: number;
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

// ======================================================
// DATA STRUCTURES
// ======================================================
let displayList: DisplayCommand[] = [];
let redoStack: DisplayCommand[] = [];

let currentCommand: MarkerCommand | null = null;

// Preview is OFF in Step 8a
const _previewCommand = null;

// ======================================================
// REDRAW
// ======================================================
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const cmd of displayList) {
    cmd.display(ctx);
  }
}

canvas.addEventListener("drawing-changed", redraw);

// ======================================================
// MOUSE EVENTS
// ======================================================
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  redoStack = [];

  if (currentSticker) {
    // STEP 8A: Place sticker immediately
    const stickerCmd = new StickerCommand(x, y, currentSticker);
    displayList.push(stickerCmd);
    canvas.dispatchEvent(new Event("drawing-changed"));
    return;
  }

  // Marker mode
  currentCommand = new MarkerCommand(x, y, currentThickness);
  displayList.push(currentCommand);
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

canvas.addEventListener("mouseup", () => (currentCommand = null));
canvas.addEventListener("mouseleave", () => (currentCommand = null));

// ======================================================
// CLEAR / UNDO / REDO
// ======================================================
clearBtn.addEventListener("click", () => {
  displayList = [];
  redoStack = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

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
