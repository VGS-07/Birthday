/**
 * Customizer Engine
 * Manages configuration, real-time live preview, state persistence,
 * theme switching, photo uploads, and URL shareable link generation.
 */

// Default Configuration
const DEFAULT_CONFIG = {
  recipientName: "Sarah",
  senderName: "Alex",
  recipientTitle: "Birthday Queen",
  age: "23",
  theme: "strawberry-cream",
  cakeFlavorText: "Happy Birthday Sarah ✨",
  candleCount: 5,
  sliceNote: "The sweetest slice for the sweetest person! ❤️",
  reasons: [
    "Your laugh that instantly brightens up any room",
    "How you make even the simplest days feel magical",
    "Your giant heart and how deeply you care for people",
    "The way your eyes sparkle when you get excited",
    "Because having you in my life is my favorite blessing"
  ],
  photos: [
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
      caption: "Your beautiful smile ✨"
    },
    {
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
      caption: "Making lovely memories 🎈"
    },
    {
      url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80",
      caption: "To many more adventures together 🥂"
    },
    {
      url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80",
      caption: "Forever celebrating you ❤️"
    }
  ],
  letter: {
    heading: "To My Favorite Person in the World,",
    body: `Happy Birthday! Today is all about celebrating you and the beautiful soul that you are.

Thank you for being my constant comfort, my funniest conversation, and the person who makes life feel extraordinary. Every moment with you is a gift I cherish deeply.

I hope this year brings you as much happiness, love, and wonder as you bring to everyone around you. Keep shining as bright as you always do.`,
    signoff: "Forever yours with all my love,\nAlex ❤️"
  },
  coupons: [
    {
      icon: "☕",
      title: "Cozy Coffee & Pastry Date",
      desc: "Valid anytime at your favorite café. My treat with zero rush!"
    },
    {
      icon: "🛡️",
      title: "24-Hour Argument Immunity",
      desc: "You automatically win any debate or argument for 24 whole hours."
    },
    {
      icon: "🍦",
      title: "Midnight Ice Cream & Drive",
      desc: "A late night drive with good music and your favorite scoop."
    },
    {
      icon: "✨",
      title: "One Wildcard Wish",
      desc: "Whatever you want within reason, no questions asked!"
    }
  ],
  dateQuestion: {
    question: "Birthday date with me? 🌹",
    btnYes: "Yes, absolutely! 🥰",
    btnNo: "No 😜",
    timeOptions: ["Tonight 🌙", "This Weekend 🥂", "You Plan It! ✨"],
    whatsappNumber: ""
  },
  musicUrl: "",
  passcode: ""
};

class Customizer {
  constructor() {
    this.config = this.loadConfig();
    this.activeTab = "general";
  }

  // Parse configuration data from URL hash or query params
  parseUrlData() {
    try {
      const fullQuery = (window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "") +
                        "&" +
                        (window.location.search.startsWith("?") ? window.location.search.slice(1) : "");
      const params = new URLSearchParams(fullQuery);
      let dataStr = params.get("data");

      if (!dataStr && window.location.hash.includes("data=")) {
        const match = window.location.hash.match(/data=([^&]+)/);
        if (match) dataStr = match[1];
      }

      if (dataStr) {
        const jsonStr = decodeURIComponent(atob(dataStr));
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.warn("Could not parse configuration from URL", e);
    }
    return null;
  }

  // Detect if current visitor is the recipient (friend) or the creator (editor)
  isRecipientMode() {
    const fullQuery = (window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "") +
                      "&" +
                      (window.location.search.startsWith("?") ? window.location.search.slice(1) : "");
    const params = new URLSearchParams(fullQuery);

    // If edit mode explicitly requested
    if (params.get("mode") === "edit" || params.get("edit") === "true") {
      return false;
    }

    // If surprise mode is flagged
    if (params.get("mode") === "surprise" || params.get("view") === "surprise" || fullQuery.includes("surprise")) {
      return true;
    }

    return false;
  }

  // Hides customize controls when friend opens the surprise link
  applyRecipientMode() {
    const btnCustomizer = document.getElementById("btn-open-customizer");
    const drawer = document.getElementById("customizer-drawer");
    const backdrop = document.getElementById("customizer-backdrop");

    if (this.isRecipientMode()) {
      if (btnCustomizer) {
        btnCustomizer.style.setProperty("display", "none", "important");
      }
      if (drawer) drawer.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
      console.log("Friend Surprise Mode active: Customize controls hidden.");
    } else {
      if (btnCustomizer) {
        btnCustomizer.style.display = "inline-flex";
      }
    }
  }

  // Load config from URL, localStorage, or fallback to DEFAULT_CONFIG
  loadConfig() {
    // 1. Try URL data
    const urlConfig = this.parseUrlData();
    if (urlConfig) {
      return { ...DEFAULT_CONFIG, ...urlConfig };
    }

    // 2. Try localStorage
    try {
      const saved = localStorage.getItem("birthday_surprise_cfg");
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }

    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  saveConfig() {
    try {
      localStorage.setItem("birthday_surprise_cfg", JSON.stringify(this.config));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  // Apply configuration to current DOM
  applyConfig() {
    const cfg = this.config;

    // Apply Theme
    document.body.dataset.theme = cfg.theme || "strawberry-cream";

    // Text & Names
    this.safeSetText("#gift-tag-name", `To: ${cfg.recipientName}`);
    this.safeSetText("#gift-from-name", `From: ${cfg.senderName}`);
    this.safeSetText("#cake-piped-name", cfg.cakeFlavorText || `Happy Birthday ${cfg.recipientName}`);
    this.safeSetText("#cake-milestone-badge", cfg.age ? `${cfg.age}` : "✨");
    this.safeSetText("#slice-note-text", cfg.sliceNote);

    // Letter
    this.safeSetText("#letter-heading-display", cfg.letter.heading);
    this.safeSetText("#letter-body-display", cfg.letter.body);
    this.safeSetText("#letter-signoff-display", cfg.letter.signoff);

    // Date Question
    this.safeSetText("#date-question-title", cfg.dateQuestion.question);
    this.safeSetText("#btn-yes-text", cfg.dateQuestion.btnYes);
    this.safeSetText("#btn-no-text", cfg.dateQuestion.btnNo);

    // Certificate
    this.safeSetText("#cert-recipient-name", cfg.recipientName);
    this.safeSetText("#cert-title-display", `Official ${cfg.recipientTitle}`);
    this.safeSetText(
      "#cert-description-display",
      `Presented by ${cfg.senderName} on this glorious day in recognition of your unconditional charm, wonderful soul, and endless radiance.`
    );
    this.safeSetText("#cert-signature-name", cfg.senderName);

    // Populate Dynamic Lists
    this.renderCandles(cfg.candleCount || 5);
    this.renderBalloons(cfg.reasons);
    this.renderPhotos(cfg.photos);
    this.renderCoupons(cfg.coupons);
    this.renderTimeOptions(cfg.dateQuestion.timeOptions);

    // Re-fill form inputs in drawer
    this.populateFormInputs();

    // Check and apply recipient view mode (hides customize button if shared with friend)
    this.applyRecipientMode();
  }

  safeSetText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  renderCandles(count) {
    const container = document.querySelector("#candles-row");
    if (!container) return;
    container.innerHTML = "";
    const num = Math.max(1, Math.min(10, count));
    for (let i = 0; i < num; i++) {
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.innerHTML = `
        <div class="candle-wick"></div>
        <div class="candle-flame"></div>
        <div class="candle-smoke"></div>
      `;
      container.appendChild(candle);
    }
  }

  renderBalloons(reasons) {
    const container = document.querySelector("#balloons-area");
    const reasonsList = document.querySelector("#reasons-list");
    if (!container || !reasonsList) return;

    container.innerHTML = "";
    reasonsList.innerHTML = "";

    reasons.forEach((reason, index) => {
      const balloon = document.createElement("div");
      balloon.className = "balloon-item";
      balloon.dataset.index = index;
      balloon.innerHTML = `
        <span>${index + 1}</span>
        <div class="balloon-string"></div>
      `;
      balloon.addEventListener("click", () => {
        if (!balloon.classList.contains("popped")) {
          balloon.classList.add("popped");
          if (window.soundEngine) window.soundEngine.playPop();

          const card = document.createElement("div");
          card.className = "reason-card";
          card.innerHTML = `
            <div class="reason-number">#${index + 1}</div>
            <div class="reason-text">${reason}</div>
          `;
          reasonsList.appendChild(card);

          // Check if all popped
          const poppedCount = document.querySelectorAll(".balloon-item.popped").length;
          const total = reasons.length;
          const counterEl = document.querySelector("#balloons-counter");
          if (counterEl) counterEl.textContent = `${poppedCount} / ${total} Popped 🎉`;
          if (poppedCount === total) {
            if (window.soundEngine) window.soundEngine.playFanfare();
            const nextBtn = document.querySelector("#balloons-next-btn");
            if (nextBtn) nextBtn.style.display = "inline-flex";
          }
        }
      });
      container.appendChild(balloon);
    });

    const counterEl = document.querySelector("#balloons-counter");
    if (counterEl) counterEl.textContent = `0 / ${reasons.length} Popped`;
  }

  renderPhotos(photos) {
    const grid = document.querySelector("#polaroid-grid");
    if (!grid) return;
    grid.innerHTML = "";

    photos.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.innerHTML = `
        <div class="polaroid-pin"></div>
        <img class="polaroid-img" src="${item.url}" alt="Memory photo ${idx + 1}" loading="lazy" />
        <div class="polaroid-caption">${item.caption || "Special moment"}</div>
      `;
      card.addEventListener("click", () => {
        this.openLightbox(item.url, item.caption);
      });
      grid.appendChild(card);
    });
  }

  openLightbox(url, caption) {
    if (window.soundEngine) window.soundEngine.playChime();
    const modal = document.querySelector("#lightbox-modal");
    const img = document.querySelector("#lightbox-img");
    const cap = document.querySelector("#lightbox-caption");
    if (modal && img && cap) {
      img.src = url;
      cap.textContent = caption || "";
      modal.classList.add("active");
    }
  }

  renderCoupons(coupons) {
    const grid = document.querySelector("#coupons-grid");
    if (!grid) return;
    grid.innerHTML = "";

    coupons.forEach((coupon, idx) => {
      const card = document.createElement("div");
      card.className = "coupon-card";
      card.innerHTML = `
        <span class="coupon-badge">Birthday Voucher</span>
        <div class="coupon-icon">${coupon.icon || "🎁"}</div>
        <h4 class="coupon-title">${coupon.title}</h4>
        <p class="coupon-desc">${coupon.desc}</p>
        <button class="claim-coupon-btn">Claim Voucher 💖</button>
        <div class="redeemed-stamp">Claimed!</div>
      `;

      const btn = card.querySelector(".claim-coupon-btn");
      btn.addEventListener("click", () => {
        if (!card.classList.contains("redeemed")) {
          card.classList.add("redeemed");
          btn.textContent = "Claimed & Sent to " + (this.config.senderName || "Me") + " ❤️";
          if (window.soundEngine) window.soundEngine.playFanfare();
          this.triggerConfetti();
        }
      });

      grid.appendChild(card);
    });
  }

  renderTimeOptions(options) {
    const container = document.querySelector("#time-options-container");
    if (!container) return;
    container.innerHTML = "";

    options.forEach((opt, idx) => {
      const chip = document.createElement("button");
      chip.className = "time-chip" + (idx === 0 ? " selected" : "");
      chip.textContent = opt;
      chip.addEventListener("click", () => {
        container.querySelectorAll(".time-chip").forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
        this.selectedDateOption = opt;
      });
      container.appendChild(chip);
    });
    this.selectedDateOption = options[0] || "Tonight";
  }

  // Populate Customizer Drawer form inputs
  populateFormInputs() {
    const cfg = this.config;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("input-recipient-name", cfg.recipientName);
    setVal("input-sender-name", cfg.senderName);
    setVal("input-recipient-title", cfg.recipientTitle);
    setVal("input-age", cfg.age);
    setVal("input-cake-piped", cfg.cakeFlavorText);
    setVal("input-candle-count", cfg.candleCount);
    setVal("input-slice-note", cfg.sliceNote);
    setVal("input-letter-heading", cfg.letter.heading);
    setVal("input-letter-body", cfg.letter.body);
    setVal("input-letter-signoff", cfg.letter.signoff);
    setVal("input-date-question", cfg.dateQuestion.question);
    setVal("input-whatsapp-num", cfg.dateQuestion.whatsappNumber);
    setVal("input-music-url", cfg.musicUrl);
    setVal("input-passcode", cfg.passcode);

    // Theme swatches active state
    document.querySelectorAll(".theme-swatch").forEach(swatch => {
      if (swatch.dataset.theme === cfg.theme) {
        swatch.classList.add("active");
      } else {
        swatch.classList.remove("active");
      }
    });

    // Populate Reasons list editor
    this.populateReasonsEditor();

    // Populate Photos list editor
    this.populatePhotosEditor();

    // Populate Coupons editor
    this.populateCouponsEditor();
  }

  populateReasonsEditor() {
    const container = document.getElementById("reasons-editor-container");
    if (!container) return;
    container.innerHTML = "";

    this.config.reasons.forEach((r, idx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.alignItems = "center";
      row.innerHTML = `
        <span style="font-weight:700;color:var(--primary);min-width:24px;">#${idx+1}</span>
        <input type="text" class="form-input reason-input" value="${r}" data-index="${idx}" />
        <button class="btn-remove-reason" data-index="${idx}" style="background:none;border:none;color:#ef4444;font-size:1.2rem;cursor:pointer;">&times;</button>
      `;
      container.appendChild(row);
    });

    // Event listeners
    container.querySelectorAll(".reason-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.reasons[i] = e.target.value;
        this.saveConfig();
        this.renderBalloons(this.config.reasons);
      });
    });

    container.querySelectorAll(".btn-remove-reason").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.reasons.splice(i, 1);
        this.saveConfig();
        this.applyConfig();
      });
    });
  }

  populatePhotosEditor() {
    const container = document.getElementById("photos-editor-container");
    if (!container) return;
    container.innerHTML = "";

    this.config.photos.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.style.background = "#f9fafb";
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "8px";
      card.style.padding = "10px";
      card.style.display = "flex";
      card.style.gap = "10px";
      card.style.alignItems = "center";
      card.innerHTML = `
        <img src="${photo.url}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;" />
        <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
          <input type="text" class="form-input photo-url-input" placeholder="Image URL" value="${photo.url}" data-index="${idx}" style="font-size:0.8rem;padding:4px 8px;" />
          <input type="text" class="form-input photo-cap-input" placeholder="Caption" value="${photo.caption}" data-index="${idx}" style="font-size:0.8rem;padding:4px 8px;" />
        </div>
        <button class="btn-remove-photo" data-index="${idx}" style="background:none;border:none;color:#ef4444;font-size:1.2rem;cursor:pointer;">&times;</button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll(".photo-url-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.photos[i].url = e.target.value;
        this.saveConfig();
        this.renderPhotos(this.config.photos);
      });
    });

    container.querySelectorAll(".photo-cap-input").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.photos[i].caption = e.target.value;
        this.saveConfig();
        this.renderPhotos(this.config.photos);
      });
    });

    container.querySelectorAll(".btn-remove-photo").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.photos.splice(i, 1);
        this.saveConfig();
        this.applyConfig();
      });
    });
  }

  populateCouponsEditor() {
    const container = document.getElementById("coupons-editor-container");
    if (!container) return;
    container.innerHTML = "";

    this.config.coupons.forEach((coupon, idx) => {
      const card = document.createElement("div");
      card.style.background = "#f9fafb";
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "8px";
      card.style.padding = "10px";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.gap = "6px";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <input type="text" class="form-input coupon-icon-input" value="${coupon.icon}" data-index="${idx}" style="width:48px;font-size:1.2rem;text-align:center;" />
          <input type="text" class="form-input coupon-title-input" value="${coupon.title}" data-index="${idx}" style="flex:1;margin-left:8px;" />
          <button class="btn-remove-coupon" data-index="${idx}" style="background:none;border:none;color:#ef4444;font-size:1.2rem;cursor:pointer;margin-left:6px;">&times;</button>
        </div>
        <textarea class="form-textarea coupon-desc-input" data-index="${idx}" style="min-height:48px;font-size:0.85rem;">${coupon.desc}</textarea>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll(".coupon-icon-input").forEach(inp => {
      inp.addEventListener("input", e => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.coupons[i].icon = e.target.value;
        this.saveConfig();
        this.renderCoupons(this.config.coupons);
      });
    });

    container.querySelectorAll(".coupon-title-input").forEach(inp => {
      inp.addEventListener("input", e => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.coupons[i].title = e.target.value;
        this.saveConfig();
        this.renderCoupons(this.config.coupons);
      });
    });

    container.querySelectorAll(".coupon-desc-input").forEach(inp => {
      inp.addEventListener("input", e => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.coupons[i].desc = e.target.value;
        this.saveConfig();
        this.renderCoupons(this.config.coupons);
      });
    });

    container.querySelectorAll(".btn-remove-coupon").forEach(btn => {
      btn.addEventListener("click", e => {
        const i = parseInt(e.target.dataset.index, 10);
        this.config.coupons.splice(i, 1);
        this.saveConfig();
        this.applyConfig();
      });
    });
  }

  // Setup UI event handlers for Customizer Drawer
  initListeners() {
    // Open & Close Customizer Drawer
    const btnOpen = document.getElementById("btn-open-customizer");
    const btnClose = document.getElementById("btn-close-customizer");
    const drawer = document.getElementById("customizer-drawer");
    const backdrop = document.getElementById("customizer-backdrop");

    const openDrawer = () => {
      // Check creator passcode if set
      if (this.config.passcode && this.config.passcode.trim().length > 0) {
        const savedAuth = sessionStorage.getItem("birthday_creator_auth");
        if (savedAuth !== this.config.passcode.trim()) {
          const entered = prompt("🔒 Enter Creator Passcode to customize:");
          if (!entered || entered.trim() !== this.config.passcode.trim()) {
            alert("Incorrect passcode! Only the creator can customize this surprise.");
            return;
          }
          sessionStorage.setItem("birthday_creator_auth", this.config.passcode.trim());
        }
      }
      drawer.classList.add("open");
      backdrop.classList.add("open");
      this.populateFormInputs();
    };

    const closeDrawer = () => {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
    };

    if (btnOpen) btnOpen.addEventListener("click", openDrawer);
    if (btnClose) btnClose.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    // Tab switching
    document.querySelectorAll(".drawer-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".drawer-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const targetId = tab.dataset.tab;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");
      });
    });

    // Theme selector
    document.querySelectorAll(".theme-swatch").forEach(swatch => {
      swatch.addEventListener("click", () => {
        const theme = swatch.dataset.theme;
        this.config.theme = theme;
        this.saveConfig();
        this.applyConfig();
        this.showToast(`Theme changed to ${swatch.innerText.trim()}! ✨`);
      });
    });

    // General inputs live preview
    const bindInput = (id, propPath) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", (e) => {
        const parts = propPath.split(".");
        if (parts.length === 1) {
          this.config[parts[0]] = e.target.value;
        } else if (parts.length === 2) {
          this.config[parts[0]][parts[1]] = e.target.value;
        }
        this.saveConfig();
        this.applyConfig();
      });
    };

    bindInput("input-recipient-name", "recipientName");
    bindInput("input-sender-name", "senderName");
    bindInput("input-recipient-title", "recipientTitle");
    bindInput("input-age", "age");
    bindInput("input-cake-piped", "cakeFlavorText");
    bindInput("input-slice-note", "sliceNote");
    bindInput("input-letter-heading", "letter.heading");
    bindInput("input-letter-body", "letter.body");
    bindInput("input-letter-signoff", "letter.signoff");
    bindInput("input-date-question", "dateQuestion.question");
    bindInput("input-whatsapp-num", "dateQuestion.whatsappNumber");
    bindInput("input-music-url", "musicUrl");
    bindInput("input-passcode", "passcode");

    // Candle count change
    const candleInp = document.getElementById("input-candle-count");
    if (candleInp) {
      candleInp.addEventListener("change", (e) => {
        this.config.candleCount = parseInt(e.target.value, 10) || 5;
        this.saveConfig();
        this.applyConfig();
      });
    }

    // Add Reason button
    const btnAddReason = document.getElementById("btn-add-reason");
    if (btnAddReason) {
      btnAddReason.addEventListener("click", () => {
        this.config.reasons.push("A wonderful thing about you ❤️");
        this.saveConfig();
        this.applyConfig();
      });
    }

    // Photo file upload (local FileReader -> base64)
    const photoFileInput = document.getElementById("photo-file-upload");
    if (photoFileInput) {
      photoFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            this.config.photos.push({
              url: dataUrl,
              caption: "Our favorite memory ✨"
            });
            this.saveConfig();
            this.applyConfig();
            this.showToast("Photo uploaded successfully! 📸");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Add Coupon button
    const btnAddCoupon = document.getElementById("btn-add-coupon");
    if (btnAddCoupon) {
      btnAddCoupon.addEventListener("click", () => {
        this.config.coupons.push({
          icon: "🎁",
          title: "Special Birthday Perk",
          desc: "Valid whenever you want to redeem it with me!"
        });
        this.saveConfig();
        this.applyConfig();
      });
    }

    // 1. Shareable Link for Friend (Surprise Only - NO customize button)
    const btnShareFriend = document.getElementById("btn-generate-share-link");
    if (btnShareFriend) {
      btnShareFriend.addEventListener("click", () => {
        const encoded = btoa(encodeURIComponent(JSON.stringify(this.config)));
        const baseUrl = window.location.href.split("#")[0].split("?")[0];
        const friendUrl = `${baseUrl}#mode=surprise&data=${encoded}`;
        navigator.clipboard.writeText(friendUrl).then(() => {
          this.showToast("🎁 Friend Link copied! Customize button is hidden.");
        }).catch(() => {
          prompt("Copy this link to send to your friend (Customize button is hidden):", friendUrl);
        });
      });
    }

    // 2. Private Edit Link for Creator (Allows editing)
    const btnShareEdit = document.getElementById("btn-generate-edit-link");
    if (btnShareEdit) {
      btnShareEdit.addEventListener("click", () => {
        const encoded = btoa(encodeURIComponent(JSON.stringify(this.config)));
        const baseUrl = window.location.href.split("#")[0].split("?")[0];
        const editUrl = `${baseUrl}#mode=edit&data=${encoded}`;
        navigator.clipboard.writeText(editUrl).then(() => {
          this.showToast("🔑 Private Edit Link copied! Keep this to make future edits.");
        }).catch(() => {
          prompt("Your private edit link (allows editing):", editUrl);
        });
      });
    }

    // Secret keyboard shortcut: Ctrl + Shift + E unlocks creator mode on any link
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        this.unlockCreatorMode();
      }
    });

    // Secret gesture: 3 quick clicks on top action bar unlocks creator mode
    let clickCount = 0;
    let clickTimeout = null;
    const topBar = document.querySelector(".top-action-bar");
    if (topBar) {
      topBar.addEventListener("click", (e) => {
        if (e.target && e.target.id === "btn-toggle-music") return;
        clickCount++;
        clearTimeout(clickTimeout);
        if (clickCount >= 3) {
          clickCount = 0;
          this.unlockCreatorMode();
        } else {
          clickTimeout = setTimeout(() => { clickCount = 0; }, 800);
        }
      });
    }

    // Reset to defaults
    const btnReset = document.getElementById("btn-reset-defaults");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("Reset all settings back to default demo?")) {
          this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
          localStorage.removeItem("birthday_surprise_cfg");
          window.location.hash = "";
          this.applyConfig();
          this.showToast("Reset to demo defaults!");
        }
      });
    }

    // Close lightbox
    const closeLightbox = document.getElementById("close-lightbox");
    const lightboxModal = document.getElementById("lightbox-modal");
    if (closeLightbox && lightboxModal) {
      closeLightbox.addEventListener("click", () => lightboxModal.classList.remove("active"));
      lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) lightboxModal.classList.remove("active");
      });
    }
  }

  // Secret unlock method for creator
  unlockCreatorMode() {
    if (this.config.passcode && this.config.passcode.trim().length > 0) {
      const entered = prompt("🔒 Enter Creator Passcode to customize:");
      if (!entered || entered.trim() !== this.config.passcode.trim()) {
        alert("Incorrect passcode!");
        return;
      }
      sessionStorage.setItem("birthday_creator_auth", this.config.passcode.trim());
    }

    const btnCustomizer = document.getElementById("btn-open-customizer");
    if (btnCustomizer) {
      btnCustomizer.style.setProperty("display", "inline-flex", "important");
      btnCustomizer.click();
    }
    this.showToast("🔓 Creator Mode Unlocked!");
  }

  showToast(msg) {
    let toast = document.querySelector("#toast-notice");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notice";
      toast.className = "toast-notice";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }
}

window.customizerEngine = new Customizer();
