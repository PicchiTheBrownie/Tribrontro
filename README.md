# TRIBRONTRO: store website

A dark purple streetwear store. Plain HTML, CSS and JavaScript. No install, no build step.

## How to run it

**Easiest:** double-click `index.html`. It opens in your browser.

**Best for editing (VS Code):**
1. Open this folder in VS Code (`File > Open Folder`).
2. Install the **Live Server** extension (VS Code will suggest it).
3. Right-click `index.html` and choose **Open with Live Server**. The page reloads every time you save.

You need internet for the fonts (Google Fonts). Everything else works offline.

## Edit these first

| What you want to change | File |
|---|---|
| WhatsApp number, phone, email, bKash and Nagad numbers, Instagram and Facebook links, opening hours | `js/config.js` |
| Products (name, price, colours, sizes, stock) | `js/data.js` |
| Free delivery amount (৳1,500), delivery fee (৳80), promo codes | `js/cart.js` |
| Policy text (shipping, returns, FAQ, privacy, terms) | `index.html`, search for `PAGE: HELP` |
| Size chart numbers | `js/quick-view.js`, search for `SIZE_GUIDE` |
| Announcement bar text | `index.html`, search for `ANNOUNCEMENT BAR` |
| Payment logos | replace the files in `assets/images/` (keep the same names) |
| Colours | `css/01-base.css` (the `:root` block). Later CSS files override some colours, so also search for the colour code in `css/` |
| Product photos | in `js/data.js` add `img:'assets/images/your-photo.jpg'` to a product |

## Folder map

```
index.html            All pages and sections (each one has a banner comment)
css/                  Styles, loaded in number order (later files override earlier ones)
js/                   Scripts, one feature per file (loaded in the order listed in index.html)
assets/               Logos and favicon
```

**Pages inside index.html** (search for the banner to jump to one):
Announcement bar, Navbar, Home (hero, collections, featured product + carousel), Shop, Category, My Account, Checkout, Order success, Help, Cart, Quick view popup, Service strip, Footer, Add-to-cart popup.

**Scripts** (in load order): `config`, `data`, `shop`, `router`, `cart`, `product-actions`, `init`, `progress-bar`, `quick-view`, `scroll-links`, `checkout-account`, `home-carousel`, `floating-chat`, `copy-buttons`.

Do not reorder the `<script>` tags at the bottom of `index.html`. Some files need the ones before them.

## Putting it online

Upload the whole folder to any static host: Netlify (drag and drop), Vercel, GitHub Pages, Cloudflare Pages, or your own hosting. Keep the folder structure as it is.

## What this site does NOT have (you need a backend for these)

- **Orders do not reach you automatically.** After checkout, the customer taps **Send order on WhatsApp**, which sends you the details. For automatic orders you need a backend or a service (Shopify, WooCommerce, Firebase, Supabase, or a form service).
- **No login.** Cart, wishlist, orders and saved details are stored in the customer's own browser (localStorage), so they exist on that device only.
- **bKash and Nagad are manual.** The customer sends money and enters the TrxID. You check it in your own app.
- **Card payment is "Coming soon".** It needs a payment gateway.
- **The newsletter box** only shows a thank-you message. It does not save emails yet.
- **Policies are starter templates.** Edit them to match how your store really works.
- **Social links** are placeholders until you set them in `js/config.js`.

## Notes on the CSS

The CSS was built up in layers, so a few files override earlier ones on purpose (for example `22-payment-cards.css` re-styles things from earlier files). The `*-legacy.css` files hold styles from the first version; some rules are no longer used. They are harmless, and you can clean them up later.
