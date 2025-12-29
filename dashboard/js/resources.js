document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("resourcesGrid");
  const count = document.getElementById("resourcesCount");
  const backBtn = document.getElementById("resourcesBackBtn");

  const homeCrumb = document.getElementById("resourcesHomeCrumb");
  const crumbSep = document.getElementById("crumbSep");
  const crumbTrail = document.getElementById("resourcesCrumbTrail");

  const modal = document.getElementById("resourceModal");
  const modalTitle = document.getElementById("resourceModalTitle");
  const modalDesc = document.getElementById("resourceModalDesc");
  const modalMeta = document.getElementById("resourceMeta");
  const modalDownload = document.getElementById("resourceDownloadBtn");

  /* -------------------------------------------------------
     DATA (paths now start with /dashboard/resources/...)
  ------------------------------------------------------- */
  const resourcesData = [
    {
      id: "templates",
      type: "folder",
      name: "Templates",
      desc: "Approved templates used across the team.",
      tag: "Standard",
      children: [
        {
          id: "ppt-template",
          type: "file",
          fileType: "pptx",
          name: "PowerPoint Template",
          desc: "Approved company slide deck template.",
          tag: "PPTX",
          path: "/dashboard/resources/templates/BRI_Slide_Template.pptx"
        },
        {
          id: "word-report",
          type: "file",
          fileType: "docx",
          name: "Word Report Template",
          desc: "Approved report format for investigations.",
          tag: "DOCX",
          path: "/dashboard/resources/templates/BRI_Report_Template.docx"
        }
      ]
    },

    {
      id: "brand-assets",
      type: "folder",
      name: "Brand Assets",
      desc: "Logos, backgrounds, and approved assets.",
      tag: "Brand",
      children: [
        {
          id: "logos-folder",
          type: "folder",
          name: "Logos",
          desc: "Logo variants for light/dark backgrounds.",
          tag: "PNG/SVG",
          children: [
            {
              id: "logo-1",
              type: "file",
              fileType: "png",
              name: "Logo (Black Text)",
              desc: "PNG logo (black text).",
              tag: "PNG",
              path: "/dashboard/resources/brand-assets/logos/logo-black-text.png"
            },
            {
              id: "logo-2",
              type: "file",
              fileType: "png",
              name: "Logo (White Text)",
              desc: "PNG logo (white text).",
              tag: "PNG",
              path: "/dashboard/resources/brand-assets/logos/logo-white-text.png"
            }
          ]
        },
        {
          id: "meeting-bg",
          type: "file",
          fileType: "png",
          name: "Meeting Background",
          desc: "Official branded meeting background.",
          tag: "PNG",
          path: "/dashboard/resources/brand-assets/meeting-background.png"
        },
        {
          id: "service-pagers",
          type: "folder",
          name: "Service Pagers",
          desc: "PDF one-pagers for services.",
          tag: "PDF",
          children: [
            {
              id: "pager-1",
              type: "file",
              fileType: "pdf",
              name: "Service Pager 1",
              desc: "One-pager overview (v1).",
              tag: "PDF",
              path: "/dashboard/resources/brand-assets/service-pagers/service-pager-1.pdf"
            },
            {
              id: "pager-2",
              type: "file",
              fileType: "pdf",
              name: "Service Pager 2",
              desc: "One-pager overview (v2).",
              tag: "PDF",
              path: "/dashboard/resources/brand-assets/service-pagers/service-pager-2.pdf"
            },
            {
              id: "pager-3",
              type: "file",
              fileType: "pdf",
              name: "Service Pager 3",
              desc: "One-pager overview (v3).",
              tag: "PDF",
              path: "/dashboard/resources/brand-assets/service-pagers/service-pager-3.pdf"
            }
          ]
        }
      ]
    },

    {
      id: "content-kit",
      type: "folder",
      name: "Content & Blog Kit",
      desc: "Outlines, formats, and writing guidance for publishing.",
      tag: "Guides",
      children: [
        {
          id: "blog-outline",
          type: "file",
          fileType: "pdf",
          name: "Blog Structure Outline",
          desc: "Internal format for consistent posts.",
          tag: "PDF",
          path: "/dashboard/resources/content-kit/blog-outline.pdf"
        },
        {
          id: "tone-guide",
          type: "file",
          fileType: "pdf",
          name: "Tone of Voice Guide",
          desc: "Brand tone and writing rules.",
          tag: "PDF",
          path: "/dashboard/resources/content-kit/tone-guide.pdf"
        }
      ]
    },

    {
      id: "onboarding",
      type: "folder",
      name: "Onboarding",
      desc: "Starter resources and internal processes.",
      tag: "Internal",
      children: [
        {
          id: "process-overview",
          type: "file",
          fileType: "pdf",
          name: "Analyst Process Overview",
          desc: "How investigations run end-to-end.",
          tag: "PDF",
          path: "/dashboard/resources/onboarding/process-overview.pdf"
        },
        {
          id: "reporting-standards",
          type: "file",
          fileType: "pdf",
          name: "Reporting Standards",
          desc: "Formatting rules and standards for deliverables.",
          tag: "PDF",
          path: "/dashboard/resources/onboarding/reporting-standards.pdf"
        }
      ]
    }
  ];

  /* -------------------------------------------------------
     ICONS (fixed)
     - Folder: folder-open
     - Document: file-text-o
     - PPT: file-powerpoint-o
     - Word: file-word-o
     - PDF: file-pdf-o
     - Image: file-image-o
  ------------------------------------------------------- */
  function iconFor(item) {
    if (item.type === "folder") return "fa-solid fa-folder-open";

    const ft = (item.fileType || "").toLowerCase();

    if (ft === "ppt" || ft === "pptx") return "fa-solid fa-file-powerpoint";
    if (ft === "doc" || ft === "docx") return "fa-solid fa-file-word";
    if (ft === "pdf") return "fa-solid fa-file-pdf";

    if (ft === "png" || ft === "jpg" || ft === "jpeg" || ft === "svg" || ft === "webp")
      return "fa-solid fa-image";

    if (ft === "zip" || ft === "rar" || ft === "7z") return "fa-solid fa-file-zipper";

    // default: generic document icon (paper)
    return "fa-file-text-o";
  }

  const stack = [];
  let currentItems = resourcesData;

  function renderBreadcrumbs() {
    crumbTrail.innerHTML = "";
    crumbSep.style.display = stack.length ? "inline" : "none";

    stack.forEach((folder, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "crumb-link";
      btn.textContent = folder.name;

      btn.addEventListener("click", () => {
        stack.splice(idx + 1);
        currentItems = folder.children;
        render();
      });

      crumbTrail.appendChild(btn);

      if (idx < stack.length - 1) {
        const sep = document.createElement("span");
        sep.className = "crumb-sep";
        sep.textContent = "/";
        crumbTrail.appendChild(sep);
      }
    });

    backBtn.disabled = stack.length === 0;
  }

  function render() {
    renderBreadcrumbs();
    grid.innerHTML = "";
    count.textContent = `${currentItems.length} item${currentItems.length === 1 ? "" : "s"}`;

    currentItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "resource-card";

      card.innerHTML = `
        <div class="resource-top">
          <div class="resource-icon"><i class="fa ${iconFor(item)}"></i></div>
          <div class="resource-type">${item.type === "folder" ? "Folder" : (item.fileType || "DOC").toUpperCase()}</div>
        </div>

        <div class="resource-name">${item.name}</div>
        <div class="resource-desc">${item.desc || ""}</div>
        ${item.tag ? `<div class="resource-tag">${item.tag}</div>` : ``}
      `;

      card.addEventListener("click", () => {
        if (item.type === "folder") {
          stack.push({ id: item.id, name: item.name, children: item.children || [] });
          currentItems = item.children || [];
          render();
          return;
        }

        openResourceModal(item);
      });

      grid.appendChild(card);
    });
  }

  function openResourceModal(item) {
    modalTitle.textContent = item.name;
    modalDesc.textContent = item.desc || "Download this resource.";

    modalMeta.innerHTML = `
      <div><strong>Type:</strong> ${(item.fileType || "DOC").toUpperCase()}</div>
      <div><strong>Category:</strong> ${stack.length ? stack[stack.length - 1].name : "Resources"}</div>
      ${item.path ? `<div><strong>Path:</strong> <span style="color: rgba(255,255,255,0.65)">${item.path}</span></div>` : ``}
    `;

    modalDownload.href = item.path || "#";
    modalDownload.setAttribute("download", "");

    modal.classList.add("is-open");
  }

  function closeResourceModal() {
    modal.classList.remove("is-open");
  }

  document.querySelectorAll("[data-modal-close='resource']").forEach((el) => {
    el.addEventListener("click", closeResourceModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeResourceModal();
  });

  homeCrumb.addEventListener("click", () => {
    stack.length = 0;
    currentItems = resourcesData;
    render();
  });

  backBtn.addEventListener("click", () => {
    stack.pop();
    currentItems = stack.length ? stack[stack.length - 1].children : resourcesData;
    render();
  });

  render();
});
