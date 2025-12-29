document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".app-card");
    const sections = document.querySelectorAll(".apps-section");
  
    /* ----------------------------
       Modal
    ---------------------------- */
    const modal = document.getElementById("appsModal");
    const modalTitle = document.getElementById("appsModalTitle");
    const modalBody = document.getElementById("appsModalBody");
  
    const openModal = (title, bodyHtml) => {
      if (!modal) return;
      if (modalTitle) modalTitle.textContent = title;
      if (modalBody) modalBody.innerHTML = bodyHtml;
      modal.classList.add("is-open");
    };
  
    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove("is-open");
    };
  
    document.querySelectorAll("[data-modal-close]").forEach(btn => {
      btn.addEventListener("click", closeModal);
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  
    /* ----------------------------
       App registry (Model B)
       Replace docker info with your exact images/ports later
    ---------------------------- */
    const apps = {
      spiderfoot: {
        title: "SpiderFoot",
        type: "Clear Net",
        description: "Automated OSINT collection platform with a web UI. Great for pivoting on domains, IPs, emails, usernames, and more.",
        links: [
          { label: "GitHub", href: "https://github.com/smicallef/spiderfoot" }
        ],
        images: ["images/spiderfoot-logo.png", "images/spiderfoot-logo.png"],
        run: {
          port: "5001",
          url: "http://localhost:5001",
          commands: [
            "docker pull spiderfoot/spiderfoot",
            "docker run -it --rm -p 5001:5001 spiderfoot/spiderfoot"
          ],
          notes: [
            "Open your browser at http://localhost:5001",
            "If port 5001 is in use, change it (e.g., 5010:5001)."
          ]
        }
      },
  
      sherlock: {
        title: "Sherlock",
        type: "Clear Net",
        description: "Username enumeration across many platforms. Best used as CLI and exported into your case notes.",
        links: [{ label: "GitHub", href: "https://github.com/sherlock-project/sherlock" }],
        images: ["images/sherlock-logo.png", "images/sherlock-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool (runs in terminal)",
          commands: [
            "docker pull sherlock/sherlock",
            "docker run --rm sherlock/sherlock --help",
            "docker run --rm sherlock/sherlock <username>"
          ],
          notes: [
            "This is CLI-first (no browser UI).",
            "Use output for reporting and attribution."
          ]
        }
      },
  
      misp: {
        title: "MISP",
        type: "Clear Net",
        description: "Threat intel sharing platform. Useful for IOC storage, events, correlations, and collaboration.",
        links: [{ label: "GitHub", href: "https://github.com/MISP/MISP" }],
        images: ["images/misp-logo.png", "images/misp-logo.png"],
        run: {
          port: "8080",
          url: "http://localhost:8080",
          commands: [
            "git clone https://github.com/MISP/misp-docker.git",
            "cd misp-docker",
            "docker compose up -d"
          ],
          notes: [
            "MISP is heavier: first boot may take several minutes.",
            "Default creds differ depending on compose setup—check the README in misp-docker."
          ]
        }
      },
  
      "social-analyzer": {
        title: "Social Analyzer",
        type: "Clear Net",
        description: "Framework for profiling usernames across platforms with richer context than single-purpose tools.",
        links: [{ label: "GitHub", href: "https://github.com/qeeqbox/social-analyzer" }],
        images: ["images/social-analyzer-logo.png", "images/social-analyzer-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool (varies)",
          commands: [
            "git clone https://github.com/qeeqbox/social-analyzer.git",
            "cd social-analyzer",
            "docker build -t social-analyzer .",
            "docker run --rm social-analyzer --help"
          ],
          notes: [
            "If you already have a working image from your repo, use that instead.",
            "Outputs can be piped into JSON for case files."
          ]
        }
      },
  
      shodan: {
        title: "Shodan CLI",
        type: "Clear Net",
        description: "Command line access to Shodan. Useful for quick enrichment of IPs/hosts and exposure checks.",
        links: [{ label: "Docs", href: "https://cli.shodan.io/" }],
        images: ["images/shodan-logo.png", "images/shodan-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool (runs in terminal)",
          commands: [
            "docker pull shodanio/shodan",
            "docker run --rm -it shodanio/shodan shodan init <API_KEY>",
            "docker run --rm -it shodanio/shodan shodan host <ip>"
          ],
          notes: [
            "Requires a Shodan API key.",
            "Use only for authorised targets."
          ]
        }
      },
  
      osmedeus: {
        title: "Osmedeus",
        type: "Clear Net",
        description: "Recon automation framework for subdomains, endpoints, and target surface mapping.",
        links: [{ label: "GitHub", href: "https://github.com/j3ssie/osmedeus" }],
        images: ["images/osmedeus-logo.png", "images/osmedeus-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "git clone https://github.com/j3ssie/osmedeus.git",
            "cd osmedeus",
            "docker build -t osmedeus .",
            "docker run --rm -it osmedeus --help"
          ],
          notes: [
            "Outputs should be saved into your project folder.",
            "Use only with permission and scoped targets."
          ]
        }
      },
  
      reconng: {
        title: "Recon-ng",
        type: "Clear Net",
        description: "Recon framework for modular OSINT workflows, scripting, and repeatable engagement setups.",
        links: [{ label: "GitHub", href: "https://github.com/lanmaster53/recon-ng" }],
        images: ["images/reconng-logo.png", "images/reconng-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "docker pull reconng/recon-ng",
            "docker run --rm -it reconng/recon-ng"
          ],
          notes: [
            "Modules can require API keys; store them securely.",
            "Export results for case notes."
          ]
        }
      },
  
      nmap: {
        title: "Nmap",
        type: "Clear Net",
        description: "Network mapper for discovery and security auditing. Great for service enumeration and baseline scans.",
        links: [{ label: "Docs", href: "https://nmap.org/book/man.html" }],
        images: ["images/nmap-logo.png", "images/nmap-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "docker pull instrumentisto/nmap",
            "docker run --rm -it instrumentisto/nmap nmap -sV <target>"
          ],
          notes: [
            "Only scan authorised networks/hosts.",
            "Consider adding -oN/-oX outputs for reports."
          ]
        }
      },
  
      openvas: {
        title: "OpenVAS (Greenbone)",
        type: "Clear Net",
        description: "Vulnerability scanning platform. Good for scheduled scanning and vulnerability reporting.",
        links: [{ label: "Docs", href: "https://greenbone.github.io/docs/latest/" }],
        images: ["images/openvas-logo.png", "images/openvas-logo.png"],
        run: {
          port: "9392",
          url: "https://localhost:9392",
          commands: [
            "docker pull immauss/openvas",
            "docker run -d --name openvas -p 9392:9392 immauss/openvas"
          ],
          notes: [
            "This can be resource heavy.",
            "First init can take time; check container logs."
          ]
        }
      },
  
      censys: {
        title: "Censys CLI",
        type: "Clear Net",
        description: "CLI access for internet-wide asset discovery. Useful for enrichment and exposure checks.",
        links: [{ label: "Docs", href: "https://github.com/censys/censys-python" }],
        images: ["images/censys-logo.png", "images/censys-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "docker pull censys/censys",
            "docker run --rm -it censys/censys censys config",
            "docker run --rm -it censys/censys censys search <query>"
          ],
          notes: [
            "Requires Censys API credentials.",
            "Use for authorised investigations."
          ]
        }
      },
  
      tor: {
        title: "Tor Browser",
        type: "Dark Net",
        description: "Anonymous browsing setup for accessing .onion resources safely.",
        links: [{ label: "Download", href: "https://www.torproject.org/download/" }],
        images: ["images/tor-logo.png", "images/tor-logo.png"],
        run: {
          port: "N/A",
          url: "Native install (recommended)",
          commands: [
            "Recommended: Install Tor Browser (native).",
            "If you must containerise, use a dedicated hardened VM approach."
          ],
          notes: [
            "For dark web work, a VM + isolation is recommended.",
            "Never mix personal browsing with investigation sessions."
          ]
        }
      },
  
      ahmia: {
        title: "Ahmia",
        type: "Dark Net",
        description: "Search engine for indexing onion sites (use responsibly, verify sources).",
        links: [{ label: "Website", href: "https://ahmia.fi/" }],
        images: ["images/ahmia-logo.png", "images/ahmia-logo.png"],
        run: {
          port: "N/A",
          url: "Web-based",
          commands: [
            "Open Ahmia via Tor Browser.",
            "Use safe browsing guidance and avoid risky downloads."
          ],
          notes: [
            "Prefer to access via Tor Browser for onion results.",
            "Treat results as untrusted until verified."
          ]
        }
      },
  
      "onion-search": {
        title: "Onion Search",
        type: "Dark Net",
        description: "Tooling for searching onion engines and collecting results for analysis.",
        links: [{ label: "GitHub", href: "https://github.com/megadose/OnionSearch" }],
        images: ["images/onion-search-logo.png", "images/onion-search-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "docker pull megadose/onionsearch",
            "docker run --rm -it megadose/onionsearch --help",
            "docker run --rm -it megadose/onionsearch <query>"
          ],
          notes: [
            "Run inside an isolated environment if possible.",
            "Keep logs and outputs in a case folder."
          ]
        }
      },
  
      darksearch: {
        title: "DarkSearch",
        type: "Dark Net",
        description: "Dark web search wrapper to locate relevant hidden services.",
        links: [{ label: "Info", href: "#" }],
        images: ["images/darksearch-logo.png", "images/darksearch-logo.png"],
        run: {
          port: "N/A",
          url: "Varies",
          commands: [
            "If you have a working container image from your repo, run it here.",
            "Otherwise, access via Tor Browser and document findings."
          ],
          notes: [
            "Keep threat exposure low: browse with isolation.",
            "Use safe handling procedures."
          ]
        }
      },
  
      hunchly: {
        title: "Hunchly",
        type: "Dark Net",
        description: "Investigation capture tool for preserving evidence and navigation trails.",
        links: [{ label: "Website", href: "https://www.hunch.ly/" }],
        images: ["images/hunchly-logo.png", "images/hunchly-logo.png"],
        run: {
          port: "N/A",
          url: "Native install",
          commands: [
            "Recommended: Install Hunchly (native).",
            "Use with Tor Browser for capturing onion investigations."
          ],
          notes: [
            "Store case files securely.",
            "Follow internal evidence-handling policies."
          ]
        }
      },
  
      tails: {
        title: "Tails OS",
        type: "Dark Net",
        description: "Privacy-focused live OS for anonymous browsing and safer investigation setups.",
        links: [{ label: "Download", href: "https://tails.net/" }],
        images: ["images/tailos-logo.png", "images/tailos-logo.png"],
        run: {
          port: "N/A",
          url: "Bootable USB (recommended)",
          commands: [
            "Recommended: Create a bootable USB from the official ISO.",
            "Use a dedicated machine where possible."
          ],
          notes: [
            "Best practice: separate investigation environments.",
            "Always update to the latest version."
          ]
        }
      },
  
      onionscan: {
        title: "OnionScan",
        type: "Dark Net",
        description: "Analyzes onion sites for exposures and structural issues (use responsibly).",
        links: [{ label: "GitHub", href: "https://github.com/s-rah/onionscan" }],
        images: ["images/onionscan-logo.png", "images/onionscan-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool",
          commands: [
            "docker pull onionscan/onionscan",
            "docker run --rm -it onionscan/onionscan --help"
          ],
          notes: [
            "Use only for authorised analysis.",
            "Prefer isolated environments."
          ]
        }
      },
  
      whonix: {
        title: "Whonix",
        type: "Dark Net",
        description: "VM-based Tor routing setup with separation between workstation and gateway.",
        links: [{ label: "Download", href: "https://www.whonix.org/" }],
        images: ["images/whonix-logo.png", "images/whonix-logo.png"],
        run: {
          port: "N/A",
          url: "VM setup (recommended)",
          commands: [
            "Recommended: Install Whonix as VMs (Gateway + Workstation).",
            "Follow the official install docs."
          ],
          notes: [
            "Stronger isolation than typical browsing setups.",
            "Keep VMs updated."
          ]
        }
      },
  
      darkdump: {
        title: "DarkDump",
        type: "Dark Net",
        description: "Scraping and collection tooling for onion resources (handle data safely).",
        links: [{ label: "Info", href: "#" }],
        images: ["images/darkdump-logo.png", "images/darkdump-logo.png"],
        run: {
          port: "N/A",
          url: "CLI tool (varies)",
          commands: [
            "Use your internal container image / repo version if available.",
            "Run inside isolated environment for safety."
          ],
          notes: [
            "Do not download unknown files.",
            "Store outputs in encrypted case folders."
          ]
        }
      },
  
      cryptonote: {
        title: "CryptoNote",
        type: "Dark Net",
        description: "Secure communication concept. Use approved encrypted tooling and internal policy guidance.",
        links: [{ label: "Info", href: "#" }],
        images: ["images/cryptonote-logo.png", "images/cryptonote-logo.png"],
        run: {
          port: "N/A",
          url: "Policy-based",
          commands: [
            "Use only approved encrypted comms tools.",
            "Follow internal policy on key handling."
          ],
          notes: [
            "This item is informational in this demo.",
            "In real use, follow security policy."
          ]
        }
      }
    };
  
    /* ----------------------------
       Filter chips
    ---------------------------- */
    const chips = document.querySelectorAll(".chip[data-filter]");
  
    function applyFilter(filter) {
      chips.forEach(c => c.classList.remove("is-active"));
      document.querySelector(`.chip[data-filter="${filter}"]`)?.classList.add("is-active");
  
      cards.forEach(card => {
        const type = card.getAttribute("data-type");
        const show = filter === "all" || type === filter;
        card.style.display = show ? "flex" : "none";
      });
  
      sections.forEach(section => {
        const visible = section.querySelectorAll('.app-card:not([style*="display: none"])');
        section.style.display = visible.length ? "block" : "none";
      });
    }
  
    chips.forEach(chip => chip.addEventListener("click", () => applyFilter(chip.getAttribute("data-filter"))));
  
    /* ----------------------------
       Search
    ---------------------------- */
    const searchInput = document.getElementById("appsSearch");
  
    function applySearch(query) {
      const q = (query || "").trim().toLowerCase();
  
      cards.forEach(card => {
        const name = (card.getAttribute("data-name") || "").toLowerCase();
        const title = (card.querySelector(".app-card__title")?.textContent || "").toLowerCase();
        const desc = (card.querySelector(".app-card__desc")?.textContent || "").toLowerCase();
        const match = !q || name.includes(q) || title.includes(q) || desc.includes(q);
        card.style.display = match ? "flex" : "none";
      });
  
      sections.forEach(section => {
        const visible = section.querySelectorAll('.app-card:not([style*="display: none"])');
        section.style.display = visible.length ? "block" : "none";
      });
    }
  
    searchInput?.addEventListener("input", () => applySearch(searchInput.value));
  
    /* ----------------------------
       Helpers
    ---------------------------- */
    function linksRow(links = []) {
      if (!links.length) return "";
      const items = links
        .map(l => `<a href="${l.href}" target="_blank" rel="noopener noreferrer" class="modal-link">${l.label}</a>`)
        .join("");
      return `<div class="modal-section"><div class="modal-section__title">Links</div>${items}</div>`;
    }
  
    function imagesRow(images = []) {
      if (!images.length) return "";
      const imgs = images
        .slice(0, 2)
        .map(src => `<img src="${src}" alt="" />`)
        .join("");
      return `<div class="modal-section"><div class="modal-section__title">Preview</div><div class="modal-images">${imgs}</div></div>`;
    }
  
    function codeBlock(commands = []) {
      const text = commands.join("\n");
      return `
        <div class="code-block" data-code>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <div class="copy-row">
          <span style="color: rgba(255,255,255,0.55); font-weight:700;">Copy commands into your terminal</span>
          <button type="button" class="copy-btn" data-copy>Copy</button>
        </div>
      `;
    }
  
    function attachCopyHandler() {
      const copyBtn = modalBody?.querySelector("[data-copy]");
      const codeEl = modalBody?.querySelector("[data-code]");
      if (!copyBtn || !codeEl) return;
  
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeEl.textContent.trim());
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
        } catch {
          copyBtn.textContent = "Copy failed";
          setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
        }
      });
    }
  
    /* ----------------------------
       Details / Run Locally click handlers
    ---------------------------- */
    document.querySelectorAll("[data-details]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-details");
        const app = apps[key];
        if (!app) return;
  
        openModal(`${app.title} — Details`, `
          <div class="modal-section">
            <div class="modal-section__title">What it does</div>
            <p>${app.description}</p>
          </div>
          ${imagesRow(app.images)}
          ${linksRow(app.links)}
          <div class="modal-section">
            <div class="modal-section__title">Quick notes</div>
            <ul style="margin-left: 18px;">
              <li>Prefer isolated environments for high-risk browsing.</li>
              <li>Save outputs in a case folder for reporting.</li>
              <li>Use authorised targets and follow policy.</li>
            </ul>
          </div>
        `);
      });
    });
  
    document.querySelectorAll("[data-run]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-run");
        const app = apps[key];
        if (!app) return;
  
        const run = app.run || {};
        const notesList = (run.notes || []).map(n => `<li>${n}</li>`).join("");
  
        openModal(`${app.title} — Run Locally`, `
          <div class="modal-section">
            <div class="modal-section__title">Requirements</div>
            <p>Docker Desktop installed and running.</p>
          </div>
  
          <div class="modal-section">
            <div class="modal-section__title">Commands</div>
            ${codeBlock(run.commands || ["No commands available yet."])}
          </div>
  
          <div class="modal-section">
            <div class="modal-section__title">Access</div>
            <p><strong>${run.url || "N/A"}</strong></p>
          </div>
  
          ${notesList ? `
            <div class="modal-section">
              <div class="modal-section__title">Notes</div>
              <ul style="margin-left: 18px;">${notesList}</ul>
            </div>
          ` : ""}
  
          ${linksRow(app.links)}
        `);
  
        attachCopyHandler();
      });
    });
  
    /* ----------------------------
       Init state
    ---------------------------- */
    applyFilter("all");
  });
  