# 🎂 Interactive Birthday Surprise Website

A magical, interactive birthday surprise website inspired by the SubhSandesh "Blow the Candles" experience, with a **built-in Live Customizer Studio** that allows you to easily personalize every single aspect of the experience.

---

## ✨ Features Included

1. **🎁 3D Gift Box Ribbon Untie**:
   - Recipient is welcomed with a beautifully wrapped gift box with a 3D ribbon bow.
   - Tapping or tugging the bow unties the ribbon with realistic zip sound, explodes confetti, and starts gentle background music.

2. **🎂 Virtual Birthday Cake & Blow the Candles**:
   - Multi-tiered frosted cake customized in your chosen flavor theme.
   - Recipient's name piped in cursive calligraphy on the cake + custom age milestone badge.
   - **Microphone Blowing**: Recipient can enable their mic and literally blow into their phone/computer microphone! Real-time Web Audio frequency analysis makes the flame lean, flicker, and extinguish with smoke puffs!
   - **Hold-to-Blow Button**: Alternative touch/mouse button for devices without microphone permissions.

3. **🍰 Interactive Cake Slicing**:
   - Tap or drag across the cake to cut the first slice.
   - The cake slice slides out to reveal a personalized secret note.

4. **🎈 Popping Floating Balloons (Reasons Why You're Special)**:
   - Floating bobbing balloons with physics-like float animations.
   - Popping each balloon triggers a pop sound effect and reveals a numbered card with a reason why you love/cherish them.

5. **📸 Fairy Lights Polaroid Photo Gallery**:
   - Glowing, twinkling fairy lights string holding polaroid memory cards.
   - Tapping any polaroid opens an elegant lightbox with personalized captions.
   - Upload your own pictures directly from your phone/computer or use image URLs!

6. **💌 Wax-Sealed Vintage Birthday Letter**:
   - Classic envelope sealed with a red wax stamp.
   - Tapping the wax seal cracks it open, unfolds the paper, and displays a heartwarming letter with romantic typography.

7. **🎟️ VIP Birthday Coupons**:
   - Redeemable coupons (e.g. *Free Coffee Date*, *24h Argument Immunity*, *Midnight Ice Cream*, *Wildcard Wish*).
   - Recipient taps "Claim Voucher" to stamp the coupon as redeemed and send it to you.

8. **🌹 "Birthday Date with Me?" & Runaway "No" Button**:
   - Playful interactive question modal.
   - If they try to click or touch "No", the button playfully dodges and runs away across the screen with funny quips!
   - Clicking "YES!" triggers confetti, fanfare, and lets them pick a date time (*Tonight*, *This Weekend*, or *You Plan It!*).
   - Includes a one-click **"Send via WhatsApp"** button that pre-fills a response to your phone number!

9. **👑 Official Royalty Certificate**:
   - "Birthday Queen", "Birthday King", "Birthday Star", or custom royal decree.
   - Built-in canvas renderer exports a crisp, high-resolution downloadable PNG image complete with ornate gold borders, official seal, and your signature.

10. **🎵 Zero-Dependency Web Audio Synthesizer**:
    - Synthesizes all sound effects (balloon pops, candle extinguish whoosh, ribbon zip, culinary cake slice, dodge boing, celebration fanfare) natively without needing any external audio assets!
    - Includes a gentle synthesized music box melody of "Happy Birthday" or supports custom MP3/audio streams.

---

## 🛠️ How to Customize & Protect Your Surprise

Everything can be customized directly in the web page, with **built-in privacy protection** so your friend only sees the pure surprise without any edit buttons:

1. Open `index.html` in your browser.
2. Click the **"✨ Customize Surprise"** button in the top-right corner.
3. The **Surprise Studio** drawer lets you edit:
   - **General**: Recipient's name, your name, royal title, and age milestone.
   - **Creator Passcode / PIN**: *(Optional)* Set a password (e.g. `1234`) to lock the customizer so only you can make changes!
   - **Theme**: Choose from 5 palettes (*Strawberry Cream*, *Vanilla Gold*, *Lavender Dream*, *Mint Macaron*, *Midnight Velvet*).
   - **Cake**: Piped message, number of candles (1 to 10), and the slice note.
   - **Reasons**: Add, edit, or remove balloon messages.
   - **Photos**: Upload photos directly from your phone/computer or paste image URLs, plus captions.
   - **Letter**: Edit the letter salutation, body text, and handwritten signoff.
   - **Coupons**: Add or edit custom perks, icons, and coupon titles.
   - **Date & Music**: Customize the date question, add your WhatsApp number, or paste a custom song URL.
4. **Sending to your Friend**:
   - Click **"🎁 Copy Link for Friend (Surprise Only)"**.
   - This creates a private link (`#mode=surprise&data=...`).
   - When your friend opens this link, the **"✨ Customize Surprise" button is completely hidden**! They will experience only the romantic surprise.
5. **Editing Later (Only for You)**:
   - Click **"🔑 Copy My Edit Link"** to save your personal editing bookmark (`#mode=edit&data=...`).
   - If you ever open the friend's link on your device and want to edit, simply press `Ctrl + Shift + E` (or triple-tap the top bar) to unlock Creator Mode. If you set a passcode, enter it to open the studio.

---

## 🚀 How to Run & Share

### Option 1: Open Locally
Double click `index.html` or open it with your browser.

### Option 2: Run a Local Server
In PowerShell:
```powershell
# Using Python (if installed)
python -m http.server 8000

# Or open directly in your default browser:
Start-Process index.html
```

### Option 3: Free Web Hosting (Zero Cost)
- **GitHub Pages**: Upload this folder to a GitHub repository and turn on Pages in repository settings.
- **Vercel / Netlify**: Drag and drop this folder onto [netlify.com/drop](https://app.netlify.com/drop) to get a free live URL in 10 seconds!
