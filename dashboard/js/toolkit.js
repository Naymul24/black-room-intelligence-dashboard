document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("iocModal");
    const titleEl = document.getElementById("iocModalTitle");
    const descEl = document.getElementById("iocModalDesc");
    const contentEl = document.getElementById("iocModalContent");
  
    const cards = document.querySelectorAll(".ioc-card");
  
    function openModal() {
      modal.classList.add("is-open");
    }
    function closeModal() {
      modal.classList.remove("is-open");
    }
  
    document.querySelectorAll("[data-ioc-close='true']").forEach((el) => {
      el.addEventListener("click", closeModal);
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  
    function setTool(toolKey) {
      contentEl.innerHTML = ""; // reset
  
      const tool = TOOL_DEFS[toolKey];
      if (!tool) return;
  
      titleEl.textContent = tool.title;
      descEl.textContent = tool.desc;
  
      // Inject UI
      contentEl.appendChild(tool.render());
      openModal();
    }
  
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.getAttribute("data-tool");
        setTool(key);
      });
    });
  
    /* -------------------------------------------------------
       TOOL DEFINITIONS
    ------------------------------------------------------- */
    const TOOL_DEFS = {
      hash: {
        title: "Hash Identifier",
        desc: "Paste a hash to detect likely type based on length and format.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Hash</label>
            <input class="ioc-input" id="hashInput" placeholder="e.g. 5d41402abc4b2a76b9719d911017c592" />
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="hashCheckBtn"><i class="fa fa-search"></i> Identify</button>
              <button class="ioc-btn ioc-btn-ghost" id="hashClearBtn"><i class="fa fa-trash"></i> Clear</button>
            </div>
            <div class="ioc-output" id="hashOut">Output will appear here.</div>
          `;
  
          const input = wrap.querySelector("#hashInput");
          const out = wrap.querySelector("#hashOut");
  
          function identifyHash(val) {
            const s = (val || "").trim();
  
            if (!s) return { label: "No input provided", confidence: "—" };
  
            const hexOnly = /^[a-fA-F0-9]+$/.test(s);
            const len = s.length;
  
            // very common signatures
            if (hexOnly && len === 32) return { label: "MD5", confidence: "High" };
            if (hexOnly && len === 40) return { label: "SHA1", confidence: "High" };
            if (hexOnly && len === 64) return { label: "SHA256", confidence: "High" };
            if (hexOnly && len === 128) return { label: "SHA512", confidence: "High" };
  
            // other common
            if (hexOnly && len === 56) return { label: "SHA224", confidence: "Medium" };
            if (hexOnly && len === 96) return { label: "SHA384", confidence: "Medium" };
  
            return {
              label: hexOnly ? "Unknown hex hash (non-standard length)" : "Not a hex hash (may be Base64 / UUID / other)",
              confidence: "Low"
            };
          }
  
          wrap.querySelector("#hashCheckBtn").addEventListener("click", () => {
            const res = identifyHash(input.value);
            out.innerHTML = `<div><strong>Likely type:</strong> <code>${res.label}</code></div><div><strong>Confidence:</strong> ${res.confidence}</div>`;
          });
  
          wrap.querySelector("#hashClearBtn").addEventListener("click", () => {
            input.value = "";
            out.textContent = "Output will appear here.";
          });
  
          return wrap;
        }
      },
  
      base64: {
        title: "Base64 Encode / Decode",
        desc: "Encode plain text to Base64 or decode Base64 to plain text.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Input</label>
            <textarea class="ioc-textarea" id="b64Input" placeholder="Paste text or Base64 here..."></textarea>
  
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="b64Encode"><i class="fa fa-arrow-up"></i> Encode</button>
              <button class="ioc-btn ioc-btn-primary" id="b64Decode"><i class="fa fa-arrow-down"></i> Decode</button>
              <button class="ioc-btn ioc-btn-ghost" id="b64Copy"><i class="fa fa-copy"></i> Copy Output</button>
              <button class="ioc-btn ioc-btn-ghost" id="b64Clear"><i class="fa fa-trash"></i> Clear</button>
            </div>
  
            <div class="ioc-output" id="b64Out">Output will appear here.</div>
          `;
  
          const input = wrap.querySelector("#b64Input");
          const out = wrap.querySelector("#b64Out");
  
          function toBase64(str) {
            // handles unicode safely
            return btoa(unescape(encodeURIComponent(str)));
          }
          function fromBase64(str) {
            return decodeURIComponent(escape(atob(str)));
          }
  
          wrap.querySelector("#b64Encode").addEventListener("click", () => {
            const v = input.value || "";
            if (!v.trim()) return (out.textContent = "No input provided.");
            try {
              out.textContent = toBase64(v);
            } catch {
              out.textContent = "Failed to encode. Check input.";
            }
          });
  
          wrap.querySelector("#b64Decode").addEventListener("click", () => {
            const v = (input.value || "").trim();
            if (!v) return (out.textContent = "No input provided.");
            try {
              out.textContent = fromBase64(v);
            } catch {
              out.textContent = "Failed to decode. Input may not be valid Base64.";
            }
          });
  
          wrap.querySelector("#b64Copy").addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(out.textContent || "");
            } catch {
              // silent fail
            }
          });
  
          wrap.querySelector("#b64Clear").addEventListener("click", () => {
            input.value = "";
            out.textContent = "Output will appear here.";
          });
  
          return wrap;
        }
      },
  
      timestamp: {
        title: "Timestamp Converter",
        desc: "Convert Unix timestamps (seconds/ms) to readable UTC and back.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Unix timestamp</label>
            <input class="ioc-input" id="tsInput" placeholder="e.g. 1732147200 or 1732147200000" />
  
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="tsToHuman"><i class="fa fa-exchange"></i> Convert to UTC</button>
              <button class="ioc-btn ioc-btn-ghost" id="tsNow"><i class="fa fa-bolt"></i> Now</button>
              <button class="ioc-btn ioc-btn-ghost" id="tsClear"><i class="fa fa-trash"></i> Clear</button>
            </div>
  
            <div class="ioc-output" id="tsOut">Output will appear here.</div>
  
            <div style="margin-top:14px;">
              <label style="font-weight:800; color: rgba(255,255,255,0.8);">UTC date/time</label>
              <input class="ioc-input" id="humanInput" placeholder="e.g. 2025-12-22 18:00:00" />
              <div class="ioc-row">
                <button class="ioc-btn ioc-btn-primary" id="humanToTs"><i class="fa fa-exchange"></i> Convert to Unix</button>
              </div>
              <div class="ioc-output" id="humanOut">Output will appear here.</div>
            </div>
          `;
  
          const tsInput = wrap.querySelector("#tsInput");
          const tsOut = wrap.querySelector("#tsOut");
  
          const humanInput = wrap.querySelector("#humanInput");
          const humanOut = wrap.querySelector("#humanOut");
  
          function toUTC(tsRaw) {
            const s = String(tsRaw || "").trim();
            if (!s) return null;
  
            let n = Number(s);
            if (Number.isNaN(n)) return null;
  
            // if milliseconds
            if (n > 1e12) n = Math.floor(n / 1000);
  
            const d = new Date(n * 1000);
            if (isNaN(d.getTime())) return null;
  
            return d.toISOString().replace("T", " ").replace("Z", " UTC");
          }
  
          wrap.querySelector("#tsToHuman").addEventListener("click", () => {
            const res = toUTC(tsInput.value);
            tsOut.textContent = res || "Invalid timestamp.";
          });
  
          wrap.querySelector("#tsNow").addEventListener("click", () => {
            const now = Date.now();
            tsInput.value = String(now);
            tsOut.textContent = new Date(now).toISOString().replace("T", " ").replace("Z", " UTC");
          });
  
          wrap.querySelector("#tsClear").addEventListener("click", () => {
            tsInput.value = "";
            humanInput.value = "";
            tsOut.textContent = "Output will appear here.";
            humanOut.textContent = "Output will appear here.";
          });
  
          wrap.querySelector("#humanToTs").addEventListener("click", () => {
            const v = (humanInput.value || "").trim();
            if (!v) return (humanOut.textContent = "No input provided.");
  
            // Accept "YYYY-MM-DD HH:MM:SS" as UTC
            const normalised = v.replace(" ", "T") + "Z";
            const d = new Date(normalised);
  
            if (isNaN(d.getTime())) {
              humanOut.textContent = "Invalid date format. Use: YYYY-MM-DD HH:MM:SS";
              return;
            }
  
            humanOut.innerHTML = `<div><strong>Unix (seconds):</strong> <code>${Math.floor(d.getTime() / 1000)}</code></div>
                                  <div><strong>Unix (ms):</strong> <code>${d.getTime()}</code></div>`;
          });
  
          return wrap;
        }
      },
  
      url: {
        title: "URL Encode / Decode",
        desc: "Encode or decode URL-safe strings quickly.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Input</label>
            <textarea class="ioc-textarea" id="urlInput" placeholder="Paste a URL-encoded string or plain text..."></textarea>
  
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="urlEncode"><i class="fa fa-arrow-up"></i> Encode</button>
              <button class="ioc-btn ioc-btn-primary" id="urlDecode"><i class="fa fa-arrow-down"></i> Decode</button>
              <button class="ioc-btn ioc-btn-ghost" id="urlClear"><i class="fa fa-trash"></i> Clear</button>
            </div>
  
            <div class="ioc-output" id="urlOut">Output will appear here.</div>
          `;
  
          const input = wrap.querySelector("#urlInput");
          const out = wrap.querySelector("#urlOut");
  
          wrap.querySelector("#urlEncode").addEventListener("click", () => {
            const v = input.value || "";
            if (!v.trim()) return (out.textContent = "No input provided.");
            out.textContent = encodeURIComponent(v);
          });
  
          wrap.querySelector("#urlDecode").addEventListener("click", () => {
            const v = (input.value || "").trim();
            if (!v) return (out.textContent = "No input provided.");
            try {
              out.textContent = decodeURIComponent(v);
            } catch {
              out.textContent = "Failed to decode. Input may be invalid URL encoding.";
            }
          });
  
          wrap.querySelector("#urlClear").addEventListener("click", () => {
            input.value = "";
            out.textContent = "Output will appear here.";
          });
  
          return wrap;
        }
      },
  
      normalise: {
        title: "IOC Normaliser",
        desc: "Defang/fang indicators and clean common formatting.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Input</label>
            <textarea class="ioc-textarea" id="iocInput" placeholder="Paste domains, URLs, IPs or mixed indicators..."></textarea>
  
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="defangBtn"><i class="fa fa-shield"></i> Defang</button>
              <button class="ioc-btn ioc-btn-primary" id="fangBtn"><i class="fa fa-bolt"></i> Fang</button>
              <button class="ioc-btn ioc-btn-ghost" id="iocClear"><i class="fa fa-trash"></i> Clear</button>
            </div>
  
            <div class="ioc-output" id="iocOut">Output will appear here.</div>
          `;
  
          const input = wrap.querySelector("#iocInput");
          const out = wrap.querySelector("#iocOut");
  
          function defang(s) {
            return s
              .replace(/http:\/\//gi, "hxxp://")
              .replace(/https:\/\//gi, "hxxps://")
              .replace(/\./g, "[.]")
              .replace(/@/g, "[@]");
          }
  
          function fang(s) {
            return s
              .replace(/hxxp:\/\//gi, "http://")
              .replace(/hxxps:\/\//gi, "https://")
              .replace(/\[\.\]/g, ".")
              .replace(/\[@\]/g, "@");
          }
  
          wrap.querySelector("#defangBtn").addEventListener("click", () => {
            const v = input.value || "";
            if (!v.trim()) return (out.textContent = "No input provided.");
            out.textContent = defang(v);
          });
  
          wrap.querySelector("#fangBtn").addEventListener("click", () => {
            const v = input.value || "";
            if (!v.trim()) return (out.textContent = "No input provided.");
            out.textContent = fang(v);
          });
  
          wrap.querySelector("#iocClear").addEventListener("click", () => {
            input.value = "";
            out.textContent = "Output will appear here.";
          });
  
          return wrap;
        }
      },
  
      regex: {
        title: "Regex Tester",
        desc: "Test a regex pattern against sample text.",
        render() {
          const wrap = document.createElement("div");
          wrap.className = "ioc-tool";
  
          wrap.innerHTML = `
            <label style="font-weight:800; color: rgba(255,255,255,0.8);">Pattern</label>
            <input class="ioc-input" id="rxPattern" placeholder="e.g. \\b[a-f0-9]{32}\\b" />
  
            <label style="font-weight:800; color: rgba(255,255,255,0.8); margin-top:12px;">Sample text</label>
            <textarea class="ioc-textarea" id="rxText" placeholder="Paste sample text..."></textarea>
  
            <div class="ioc-row">
              <button class="ioc-btn ioc-btn-primary" id="rxRun"><i class="fa fa-play"></i> Test</button>
              <button class="ioc-btn ioc-btn-ghost" id="rxClear"><i class="fa fa-trash"></i> Clear</button>
            </div>
  
            <div class="ioc-output" id="rxOut">Output will appear here.</div>
          `;
  
          const patternEl = wrap.querySelector("#rxPattern");
          const textEl = wrap.querySelector("#rxText");
          const out = wrap.querySelector("#rxOut");
  
          wrap.querySelector("#rxRun").addEventListener("click", () => {
            const pattern = (patternEl.value || "").trim();
            const text = textEl.value || "";
  
            if (!pattern) return (out.textContent = "No pattern provided.");
            if (!text.trim()) return (out.textContent = "No text provided.");
  
            try {
              const rx = new RegExp(pattern, "g");
              const matches = text.match(rx) || [];
              out.innerHTML = `<div><strong>Matches found:</strong> <code>${matches.length}</code></div>
                               <div style="margin-top:10px;"><strong>Preview:</strong><br>${matches.slice(0, 20).map(m => `<code>${escapeHtml(m)}</code>`).join("<br>") || "None"}</div>`;
            } catch {
              out.textContent = "Invalid regex pattern.";
            }
          });
  
          wrap.querySelector("#rxClear").addEventListener("click", () => {
            patternEl.value = "";
            textEl.value = "";
            out.textContent = "Output will appear here.";
          });
  
          return wrap;
        }
      }
    };
  
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
  