/* FILE: js/config.js
   STORE SETTINGS: WhatsApp, phone, email, bKash/Nagad numbers, social links, logos (EDIT THIS FIRST) */

/* =====================================================================
   STORE SETTINGS — EDIT THESE (they update the whole site)
   ===================================================================== */
const STORE = {
  whatsapp:    '8801000000000',        // WhatsApp number, country code first, no + or spaces  <-- CHANGE: 880 + number without the leading 0 (01712345678 -> 8801712345678)
  phoneDisplay:'+880 1000-000000',     // shown on the Contact section
  email:       'tribrontro.official@gmail.com',
  bkash:       '01751234360',          // your bKash personal number (Send Money)
  nagad:       '01751234360',          // your Nagad personal number
  hours:       'Saturday to Thursday, 10 AM to 8 PM',
  instagram:   'https://www.instagram.com/tribrontro',   // opens your Instagram DM directly. CHANGE: put your username (no @, no spaces)
  facebook:    'https://www.facebook.com/tribrontro',   // your Facebook page link. CHANGE: put your page name
  /* OFFICIAL LOGOS (optional): put the logo file path (e.g. 'images/bkash.png') or a data: URI here.
     Get the official files from your bKash / Nagad merchant account. Leave '' to use the styled wordmark. */
  logos:       { bkash:'assets/images/bkash.png', nagad:'assets/images/nagad.png', cod:'assets/images/cod.png', card:'' }
};