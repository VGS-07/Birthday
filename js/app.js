/**
 * Main Application Engine
 * Handles step transitions, interactive animations, microphone candle blowing,
 * cake cutting, runaway "No" button physics, and certificate canvas generator.
 */

class BirthdayApp {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 8;
    this.micStream = null;
    this.micAudioContext = null;
    this.micAnalyser = null;
    this.isListeningMic = false;
    this.candlesBlown = false;
    this.cakeSliced = false;
    this.noDodgeCount = 0;
  }

  init() {
    // Apply configuration and bind listeners
    window.customizerEngine.initListeners();
    window.customizerEngine.applyConfig();

    // Start background particle canvas
    this.initParticles();

    // Bind step event listeners
    this.bindGiftBox();
    this.bindCandleBlowing();
    this.bindCakeCutting();
    this.bindEnvelope();
    this.bindRunawayButton();
    this.bindCertificateDownload();
    this.bindTopBarControls();

    // Set step 0 active
    this.goToStep(0);
  }

  // --- Step Navigation ---
  goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex > this.totalSteps) return;
    this.currentStep = stepIndex;

    document.querySelectorAll(".step-section").forEach((sec, idx) => {
      if (idx === stepIndex) {
        sec.classList.add("active");
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        sec.classList.remove("active");
      }
    });

    // Step-specific initializations
    if (stepIndex === 1 && !this.candlesBlown) {
      // Cake screen - ready candles
    } else if (stepIndex === 7) {
      this.resetRunawayButton();
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // --- Step 0: Gift Box & Ribbon ---
  bindGiftBox() {
    const giftBox = document.getElementById("gift-box");
    if (!giftBox) return;

    giftBox.addEventListener("click", () => {
      if (giftBox.classList.contains("opened")) return;
      giftBox.classList.add("opened");

      // Play ribbon zip sound
      if (window.soundEngine) {
        window.soundEngine.playRibbon();
        // Start background music on user's first tap!
        window.soundEngine.playBackgroundMusic(window.customizerEngine.config.musicUrl);
      }

      // Confetti burst
      this.triggerConfetti(100);

      // Transition to cake step after 1.1s
      setTimeout(() => {
        this.goToStep(1);
      }, 1200);
    });
  }

  // --- Step 1: Cake & Candle Blowing ---
  bindCandleBlowing() {
    const holdBtn = document.getElementById("btn-hold-blow");
    const micToggle = document.getElementById("btn-toggle-mic");

    // Hold to blow button
    let blowTimer = null;
    let blowProgress = 0;

    const startBlowing = (e) => {
      e.preventDefault();
      if (this.candlesBlown) return;

      const flames = document.querySelectorAll(".candle-flame");
      flames.forEach(f => f.classList.add("leaning"));

      blowProgress = 0;
      blowTimer = setInterval(() => {
        blowProgress += 25;
        if (blowProgress >= 100) {
          clearInterval(blowTimer);
          this.extinguishCandles();
        }
      }, 100);
    };

    const stopBlowing = () => {
      if (this.candlesBlown) return;
      if (blowTimer) clearInterval(blowTimer);
      const flames = document.querySelectorAll(".candle-flame");
      flames.forEach(f => f.classList.remove("leaning"));
    };

    if (holdBtn) {
      holdBtn.addEventListener("mousedown", startBlowing);
      holdBtn.addEventListener("mouseup", stopBlowing);
      holdBtn.addEventListener("mouseleave", stopBlowing);
      holdBtn.addEventListener("touchstart", startBlowing, { passive: false });
      holdBtn.addEventListener("touchend", stopBlowing);
    }

    // Microphone Blowing
    if (micToggle) {
      micToggle.addEventListener("click", () => {
        if (!this.isListeningMic) {
          this.startMicBlowing();
        } else {
          this.stopMicBlowing();
        }
      });
    }
  }

  async startMicBlowing() {
    const micToggle = document.getElementById("btn-toggle-mic");
    const micStatus = document.getElementById("mic-status-text");

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.micAudioContext = new AudioCtx();
      const source = this.micAudioContext.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.micAudioContext.createAnalyser();
      this.micAnalyser.fftSize = 256;
      source.connect(this.micAnalyser);

      this.isListeningMic = true;
      if (micToggle) micToggle.classList.add("active");
      if (micStatus) micStatus.textContent = "Listening... Blow into the mic! 💨";

      let blowScore = 0;
      const dataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);

      const checkBlow = () => {
        if (!this.isListeningMic || this.candlesBlown) return;

        this.micAnalyser.getByteFrequencyData(dataArray);

        // Low frequency wind noise typically registers strong energy in the lowest 8 bins
        let lowFreqSum = 0;
        for (let i = 1; i <= 8; i++) {
          lowFreqSum += dataArray[i];
        }
        const lowFreqAvg = lowFreqSum / 8;

        const flames = document.querySelectorAll(".candle-flame");

        if (lowFreqAvg > 45) {
          // Flame leans
          flames.forEach(f => f.classList.add("leaning"));
          blowScore += 1;
          if (blowScore > 6) {
            this.stopMicBlowing();
            this.extinguishCandles();
            return;
          }
        } else {
          flames.forEach(f => f.classList.remove("leaning"));
          blowScore = Math.max(0, blowScore - 1);
        }

        requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch (err) {
      console.warn("Microphone access denied or unsupported", err);
      if (micStatus) micStatus.textContent = "Mic unavailable. Use the button below!";
      window.customizerEngine.showToast("Could not access mic. You can use the button below!");
    }
  }

  stopMicBlowing() {
    this.isListeningMic = false;
    const micToggle = document.getElementById("btn-toggle-mic");
    const micStatus = document.getElementById("mic-status-text");

    if (micToggle) micToggle.classList.remove("active");
    if (micStatus) micStatus.textContent = "Tap to blow with mic";

    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micAudioContext) {
      this.micAudioContext.close().catch(() => {});
      this.micAudioContext = null;
    }
  }

  extinguishCandles() {
    if (this.candlesBlown) return;
    this.candlesBlown = true;

    // SFX
    if (window.soundEngine) {
      window.soundEngine.playBlow();
      setTimeout(() => window.soundEngine.playFanfare(), 300);
    }

    // Extinguish flames
    document.querySelectorAll(".candle-flame").forEach(f => {
      f.classList.remove("leaning");
      f.classList.add("extinguished");
    });

    // Puffs of smoke
    document.querySelectorAll(".candle").forEach(c => {
      c.classList.add("blown");
    });

    // Confetti
    this.triggerConfetti(150);

    // Update title
    const titleEl = document.getElementById("cake-status-title");
    if (titleEl) {
      titleEl.textContent = "Your Wish is Made! ✨";
    }

    // Reveal next button
    const nextBtn = document.getElementById("cake-next-btn");
    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // --- Step 2: Cake Cutting ---
  bindCakeCutting() {
    const cutContainer = document.getElementById("cake-slice-stage");
    const slicePiece = document.getElementById("slice-cut-piece");
    const sliceNote = document.getElementById("cake-slice-note");
    const nextBtn = document.getElementById("slice-next-btn");

    if (!cutContainer || !slicePiece) return;

    let isCutting = false;

    const performCut = () => {
      if (this.cakeSliced) return;
      this.cakeSliced = true;

      slicePiece.classList.add("sliced");
      if (window.soundEngine) window.soundEngine.playSlice();

      setTimeout(() => {
        if (sliceNote) sliceNote.style.display = "block";
        if (nextBtn) nextBtn.style.display = "inline-flex";
        this.triggerConfetti(60);
        if (window.soundEngine) window.soundEngine.playFanfare();
      }, 500);
    };

    cutContainer.addEventListener("click", performCut);
    cutContainer.addEventListener("touchstart", performCut, { passive: true });
  }

  // --- Step 5: Wax Sealed Envelope ---
  bindEnvelope() {
    const envelope = document.getElementById("envelope-wrapper");
    const fullLetter = document.getElementById("full-letter-container");
    const nextBtn = document.getElementById("letter-next-btn");

    if (!envelope || !fullLetter) return;

    envelope.addEventListener("click", () => {
      if (envelope.classList.contains("opened")) return;
      envelope.classList.add("opened");

      if (window.soundEngine) window.soundEngine.playChime();

      setTimeout(() => {
        fullLetter.classList.add("visible");
        if (nextBtn) nextBtn.style.display = "inline-flex";
        fullLetter.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
    });
  }

  // --- Step 7: Runaway "No" Button ---
  bindRunawayButton() {
    const btnNo = document.getElementById("btn-no-runaway");
    const btnYes = document.getElementById("btn-yes");
    const container = document.getElementById("date-buttons-row");
    const celebration = document.getElementById("date-celebration-panel");
    const nextBtn = document.getElementById("date-next-btn");

    if (!btnNo || !btnYes || !container) return;

    const wittyQuotes = [
      "Oops, missed me! 😜",
      "Try again! 😂",
      "No isn't an option! 😉",
      "Almost got me! 💨",
      "You know you want to! ❤️",
      "Nice try haha! ✨",
      "Still running! 🏃‍♂️"
    ];

    const dodgeButton = (e) => {
      e.preventDefault();
      this.noDodgeCount++;

      if (window.soundEngine) window.soundEngine.playDodged();

      const rect = container.getBoundingClientRect();
      const maxX = Math.max(20, rect.width - 120);
      const maxY = 100;

      const randomX = (Math.random() - 0.5) * maxX;
      const randomY = (Math.random() - 0.5) * maxY;

      btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.9)`;
      btnNo.textContent = wittyQuotes[this.noDodgeCount % wittyQuotes.length];

      // Grow the YES button slightly on each dodge!
      const yesScale = Math.min(1.4, 1 + this.noDodgeCount * 0.06);
      btnYes.style.transform = `scale(${yesScale})`;
    };

    btnNo.addEventListener("mouseenter", dodgeButton);
    btnNo.addEventListener("touchstart", dodgeButton, { passive: false });

    // Click YES
    btnYes.addEventListener("click", () => {
      if (window.soundEngine) window.soundEngine.playFanfare();
      this.triggerConfetti(150);

      btnNo.style.display = "none";
      btnYes.textContent = "YAAAY! 🥰💖";
      btnYes.style.pointerEvents = "none";

      if (celebration) celebration.classList.add("active");
      if (nextBtn) nextBtn.style.display = "inline-flex";

      // Bind WhatsApp send button
      this.bindWhatsAppSend();
    });
  }

  resetRunawayButton() {
    const btnNo = document.getElementById("btn-no-runaway");
    const btnYes = document.getElementById("btn-yes");
    if (btnNo && btnYes) {
      btnNo.style.transform = "none";
      btnNo.style.display = "inline-block";
      btnNo.textContent = window.customizerEngine.config.dateQuestion.btnNo || "No 😜";
      btnYes.style.transform = "none";
      btnYes.style.pointerEvents = "auto";
    }
  }

  bindWhatsAppSend() {
    const btnSend = document.getElementById("btn-send-whatsapp");
    if (!btnSend) return;

    btnSend.addEventListener("click", () => {
      const cfg = window.customizerEngine.config;
      const timeChoice = window.customizerEngine.selectedDateOption || "Tonight";
      const msg = `Hey ${cfg.senderName}! Here is your Treat (${timeChoice})!🥰💖`;
      const phone = (cfg.dateQuestion.whatsappNumber || "").replace(/[^0-9]/g, "");

      let waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      if (phone) {
        waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }
      window.open(waUrl, "_blank");
    });
  }

  // --- Step 8: Certificate High-Res Canvas Generator & Download ---
  bindCertificateDownload() {
    const btnDownload = document.getElementById("btn-download-cert");
    if (!btnDownload) return;

    btnDownload.addEventListener("click", () => {
      this.generateCertificateImage();
    });
  }

  generateCertificateImage() {
    const cfg = window.customizerEngine.config;
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 950;
    const ctx = canvas.getContext("2d");

    // Background Gradient & Parchment
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, "#fffef8");
    bgGrad.addColorStop(0.5, "#fdf9ee");
    bgGrad.addColorStop(1, "#f7eed8");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ornate Gold Double Border
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.lineWidth = 3;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

    // Corner Ornaments
    const drawCorner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 40);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 40, y);
      ctx.strokeStyle = "#8c7324";
      ctx.lineWidth = 4;
      ctx.stroke();
    };
    drawCorner(65, 65, 1, 1);
    drawCorner(canvas.width - 65, 65, -1, 1);
    drawCorner(65, canvas.height - 65, 1, -1);
    drawCorner(canvas.width - 65, canvas.height - 65, -1, -1);

    // Crown Icon
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.fillText("👑", canvas.width / 2, 160);

    // Subtitle / Proclamation
    ctx.font = "bold 26px 'Playfair Display', serif";
    ctx.fillStyle = "#8c7324";
    ctx.letterSpacing = "6px";
    ctx.fillText("OFFICIAL ROYAL DECREE", canvas.width / 2, 230);

    // Title
    ctx.font = "bold 64px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#4a350c";
    ctx.fillText(cfg.recipientTitle.toUpperCase(), canvas.width / 2, 310);

    // "This certifies that"
    ctx.font = "italic 28px 'Playfair Display', serif";
    ctx.fillStyle = "#735c2b";
    ctx.fillText("This honor is solemnly bestowed upon", canvas.width / 2, 380);

    // Recipient Name in Large Script
    ctx.font = "bold italic 72px 'Dancing Script', cursive, Georgia";
    ctx.fillStyle = "#ea3e5b";
    ctx.fillText(cfg.recipientName, canvas.width / 2, 470);

    // Underline
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 280, 495);
    ctx.lineTo(canvas.width / 2 + 280, 495);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Proclamation Text
    ctx.font = "26px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#4b3d22";
    const desc = `In recognition of unmatched kindness, boundless joy, and being the world's most wonderful human. Presented with all my love on this magnificent day!`;

    // Word wrap description
    const words = desc.split(" ");
    let line = "";
    let yPos = 570;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && n > 0) {
        ctx.fillText(line, canvas.width / 2, yPos);
        line = words[n] + " ";
        yPos += 42;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, yPos);

    // Signatures & Gold Wax Seal
    const botY = 820;

    // Date
    ctx.font = "bold 22px 'Playfair Display', serif";
    ctx.fillStyle = "#735c2b";
    ctx.fillText("DATE", 260, botY - 50);
    ctx.font = "italic 26px Georgia, serif";
    ctx.fillText(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), 260, botY);

    // Seal
    ctx.beginPath();
    ctx.arc(canvas.width / 2, botY - 30, 65, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();
    ctx.strokeStyle = "#8c7324";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#4a350c";
    ctx.fillText("OFFICIAL", canvas.width / 2, botY - 40);
    ctx.fillText("SEAL OF LOVE", canvas.width / 2, botY - 15);

    // Signature
    ctx.font = "bold 22px 'Playfair Display', serif";
    ctx.fillStyle = "#735c2b";
    ctx.fillText("SIGNED BY", canvas.width - 260, botY - 50);
    ctx.font = "italic 36px 'Dancing Script', cursive, Georgia";
    ctx.fillStyle = "#4a350c";
    ctx.fillText(cfg.senderName + " ❤️", canvas.width - 260, botY);

    // Trigger Download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${cfg.recipientName}_${cfg.recipientTitle.replace(/\s+/g, "_")}_Certificate.png`;
    link.href = dataUrl;
    link.click();

    window.customizerEngine.showToast("Certificate downloaded in high resolution! 🏆");
  }

  // --- Top Bar Controls ---
  bindTopBarControls() {
    const musicBtn = document.getElementById("btn-toggle-music");
    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        const isMuted = window.soundEngine.toggleMute();
        if (isMuted) {
          musicBtn.classList.remove("playing");
          musicBtn.innerHTML = "🔇 Music Off";
        } else {
          musicBtn.classList.add("playing");
          musicBtn.innerHTML = "🎵 Music On";
        }
      });
    }

    // Step navigation buttons
    document.querySelectorAll("[data-nav-step]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const step = parseInt(btn.dataset.navStep, 10);
        this.goToStep(step);
      });
    });
  }

  // --- Ambient Background Particles Canvas ---
  initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 6,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        type: Math.random() > 0.4 ? "heart" : "star",
        opacity: Math.random() * 0.5 + 0.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    const drawHeart = (x, y, size, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fillStyle = `rgba(234, 62, 91, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (x, y, size, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2));
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.rot += p.rotSpeed;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.type === "heart") {
          drawHeart(p.x, p.y, p.size, p.opacity);
        } else {
          drawStar(p.x, p.y, p.size, p.opacity);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  triggerConfetti(count = 80) {
    if (window.confetti) {
      window.confetti({
        particleCount: count,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  window.birthdayApp = new BirthdayApp();
  window.birthdayApp.init();
});
