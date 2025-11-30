import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

// Clear the default innerHTML
document.body.innerHTML = "";

// --- Title ---
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.appendChild(title);

// --- Canvas ---
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "sketchCanvas"; // helpful for CSS
document.body.appendChild(canvas);

// Example image from starter code (optional to keep)
const example = document.createElement("p");
example.innerHTML =
  `Example asset: <img src="${exampleIconUrl}" class="icon" />`;

document.body.appendChild(example);
