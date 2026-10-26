/* ══════════════════════════════════════════════════════════
   ✏️  YAHAN APNI DETAILS DALO — bas is file me badlav karna hai
   (index.html, app.js wagaira ko haath mat lagana)
   ══════════════════════════════════════════════════════════ */

window.CONFIG = {

  /* ── 1. NAAM ── */
  name: "HARIOM",

  /* ── 2. BIRTHDAY KA DATE & TIME ────────────────────────
     year   : janam year (e.g. 2003)  → "You've lived" stats page ke liye
              (nahi pata/blank rakhna hai to null likho — page skip ho jayegi)
     month  : mahina ka number  → 1 = January, 2 = February, ... 12 = December
     day    : tarikh            → 1 se 31
     hour   : ghanta (24-hour)  → 0 = raat 12 baje, 12 = dopahar 12, 18 = shaam 6
     minute : minute            → 0 se 59

     Example: 14 August 2003, raat ko 12 baje:
       { year: 2003, month: 8, day: 14, hour: 0, minute: 0 }
  ──────────────────────────────────────────────────────── */
  birthday: {
    year:   null,   // ← TODO: janam year daalo (e.g. 2003)
    month:  10,      // ← TODO: birthday ka month (1-12)
    day:    27,      // ← TODO: birthday ki date (1-31)
    hour:   0,      // ← countdown kis baje khatam ho (0-23)
    minute: 0,      // ← minute (0-59)
  },

  /* ── 3. TUMHARA WHATSAPP NUMBER ─────────────────────────
     Country code ke saath, bina + aur bina space.
     India: 91 aage lagao  →  "919876543210"
  ──────────────────────────────────────────────────────── */
  phone: "919661134659",   // ← TODO: apna number daalo

  /* ── 4. WHATSAPP MESSAGE ──
     Button dabane pe WhatsApp khulega aur keyboard me ye message
     pehle se likha hoga — Hariom bas SEND dabayega */
  waText: "Hello bhai!",

};
