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

// Marker buttons
const thinBtn = document.createElement("button");
thinBtn.textContent = "Thin Marker";
thinBtn.classList.add("selectedTool");
buttonRow.appendChild(thinBtn);

const thickBtn = document.createElement("button");
thickBtn.textContent = "Thick Marker";
buttonRow.appendChild(thickBtn);

// ======================================================
// STICKER BUTTONS (Step 8 + Step 9)
// ======================================================
const stickerRow = document.createElement("div");
document.body.appendChild(stickerRow);

// Initial stickers
const stickers = ["😀", "⭐", "🔥"];
let currentSticker: string | null = null;

// Shared function to generate ANY sticker button
function createStickerButton(sticker: string) {
  const btn = document.createElement("button");
  btn.textContent = sticker;
  stickerRow.appendChild(btn);

  btn.addEventListener("click", () => {
    currentSticker = sticker;
    currentThickness = 0; // turn off marker mode
    selectTool(btn);
  });
}

// Create initial sticker buttons
stickers.forEach((s) => createStickerButton(s));

// Step 9 — Custom sticker button
const addStickerBtn = document.createElement("button");
addStickerBtn.textContent = "+ Custom Sticker";
stickerRow.appendChild(addStickerBtn);

addStickerBtn.addEventListener("click", () => {
  const text = prompt("Enter a custom sticker:", "🧽");
  if (!text) return;

  stickers.push(text); // treat same as built-ins
  createStickerButton(text); // auto-generate new button
});

// ======================================================
// MARKER CONFIG
// ======================================================
let currentThickness = 2;

// Highlight selected tool
function selectTool(btn: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((b) =>
    b.classList.remove("selectedTool")
  );
  btn.classList.add("selectedTool");
}

// Marker mode selection
thinBtn.addEventListener("click", () => {
  currentSticker = null;
  currentThickness = 2;
  selectTool(thinBtn);
});

thickBtn.addEventListener("click", () => {
  currentSticker = null;
  currentThickness = 7;
  selectTool(thickBtn);
});

// ======================================================
// COMMAND PATTERN
// ======================================================
interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
}

// ---------- Marker Command (Step 5) ----------
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

// ---------- Sticker Command (Step 8a) ----------
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

// ---------- Sticker Preview Command (Step 8b) ----------
class StickerPreviewCommand implements DisplayCommand {
  x: number;
  y: number;
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  update(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.sticker, this.x, this.y);
    ctx.restore();
  }
}

// ---------- Marker Preview Command (Step 7) ----------
class ToolPreviewCommand implements DisplayCommand {
  x: number;
  y: number;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  update(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ======================================================
// STATE
// ======================================================
let displayList: DisplayCommand[] = [];
let redoStack: DisplayCommand[] = [];

let currentCommand: MarkerCommand | null = null;
let previewCommand: StickerPreviewCommand | ToolPreviewCommand | null = null;

// ======================================================
// REDRAW FUNCTION (Step 3)
// ======================================================
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const cmd of displayList) {
    cmd.display(ctx);
  }

  if (!currentCommand && previewCommand) {
    previewCommand.display(ctx);
  }
}

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

// ======================================================
// MOUSE EVENTS
// ======================================================
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // ---------- STICKER PREVIEW (Step 8b) ----------
  if (currentSticker) {
    const safeSticker = currentSticker ?? "";
    if (
      !previewCommand ||
      !(previewCommand instanceof StickerPreviewCommand)
    ) {
      previewCommand = new StickerPreviewCommand(x, y, safeSticker);
    } else {
      previewCommand.update(x, y, safeSticker);
    }

    canvas.dispatchEvent(new Event("tool-moved"));
    return;
  }

  // ---------- MARKER PREVIEW (Step 7) ----------
  if (
    !previewCommand ||
    !(previewCommand instanceof ToolPreviewCommand)
  ) {
    previewCommand = new ToolPreviewCommand(x, y, currentThickness);
  } else {
    previewCommand.update(x, y, currentThickness);
  }

  canvas.dispatchEvent(new Event("tool-moved"));

  if (currentCommand) {
    currentCommand.drag(x, y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Click to place sticker OR start drawing
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  redoStack = [];

  // ---------- Step 8a: Place Sticker ----------
  if (currentSticker) {
    const safeSticker = currentSticker ?? "";
    const stickerCmd = new StickerCommand(x, y, safeSticker);
    displayList.push(stickerCmd);
    canvas.dispatchEvent(new Event("drawing-changed"));
    return;
  }

  // Marker stroke
  currentCommand = new MarkerCommand(x, y, currentThickness);
  displayList.push(currentCommand);
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
  redoStack.push(displayList.pop()!);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  displayList.push(redoStack.pop()!);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Example asset at bottom
const example = document.createElement("p");
example.innerHTML =
  `Example asset: <img src="${exampleIconUrl}" class="icon" />`;
document.body.appendChild(example);
