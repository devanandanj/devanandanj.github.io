// Theme toggle (initial theme is set inline in <head> to avoid a flash).
const root = document.documentElement;
document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Copy button on code blocks.
document.querySelectorAll(".prose .highlight, .prose pre:not(.chroma)").forEach((block) => {
  if (block.closest(".highlight") && block.tagName === "PRE") return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy";
  btn.textContent = "Copy";
  btn.addEventListener("click", async () => {
    const code = block.querySelector("code") ?? block;
    try {
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = "Copied";
    } catch (e) {
      btn.textContent = "Failed";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1500);
  });
  block.classList.add("has-copy");
  block.append(btn);
});
