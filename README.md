# TRIBRONTRO: store website

A dark purple streetwear store. Plain HTML, CSS and JavaScript. No install. The HTML is edited as section files and joined with one small Node command (see below).

## How to run it

**Easiest (no server):** double-click `index.single.html` (make it first with `node build-html.js`). **Normal way:** use Live Server (below), because `index.html` loads its section files with fetch(), which needs a server.

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
| Free delivery amount (৳1,500), delivery fee, promo codes | `js/cart.js` |
| Policy text (shipping, returns, FAQ, privacy, terms) | `src/html/pages/help/` (one file per policy) |
| Size chart numbers | `js/quick-view.js`, search for `SIZE_GUIDE` |
| Announcement bar text | `src/html/sections/announcement.html` |
| Payment logos | replace the files in `assets/images/` (keep the same names) |
| Colours | `css/01-base.css` (the `:root` block). Later CSS files override some colours, so also search for the colour code in `css/` |
| Product photos | in `js/data.js` add `img:'assets/images/your-photo.jpg'` to a product |

## Folder map

```
src/html/             THE HTML, split section by section (edit these)
index.html            Small page: head + placeholders. The loader fills them from src/html/
build-html.js         OPTIONAL: makes index.single.html (everything in one file)
js/include-loader.js  Builds the page from the section files when it opens
supabase/             SQL to run once in Supabase (products, photo storage, demo products)
css/                  Styles, loaded in number order (later files override earlier ones)
js/                   Scripts, one feature per file (loaded in the order listed in index.html)
admin/                Order Desk admin panel (index.html is a small page; css/ and js/ are plain files)
assets/               Logos and favicon
```

## Editing the HTML (section files)

`index.html` is now a small page. It only holds the page head and a list of placeholders like
`<div data-include="pages/shop.html"></div>`. When the page opens, `js/include-loader.js` fills each placeholder
with its section file from `src/html/`, then loads the scripts in order. **No build step: edit a section file, save, refresh.**

This needs a web server, so use **Live Server** in VS Code (right click `index.html`, *Open with Live Server*) or any host.
Double-clicking `index.html` will not work, because browsers block file loading on `file://` pages.

If you need a single file (double-click, or a host with no folders), run `node build-html.js`. It makes
`index.single.html` and `admin/index.single.html`, each with everything in one file.

| Section on the site | File |
|---|---|
| Page head, fonts, meta tags | `src/html/head/meta.html` |
| CSS file list (add new CSS files here) | `src/html/head/styles.html` |
| Announcement bar | `src/html/sections/announcement.html` |
| Navbar | `src/html/sections/navbar.html` |
| Home: hero, collection cards, carousel | `src/html/pages/home/` (`hero`, `collection`, `carousel`) |
| Shop | `src/html/pages/shop.html` |
| Category (+ Coming next) | `src/html/pages/category/` |
| My Account | `src/html/pages/account.html` |
| Checkout: contact, delivery, payment | `src/html/pages/checkout/` |
| Order success | `src/html/pages/success.html` |
| Help: shipping, returns, FAQ, contact, privacy, terms | `src/html/pages/help/` |
| Cart | `src/html/pages/cart.html` |
| Quick view popup | `src/html/sections/quick-view.html` |
| Floating chat button | `src/html/sections/floating-chat.html` |
| Add-to-cart toast | `src/html/sections/toast.html` |
| Service strip above footer | `src/html/sections/perks-strip.html` |
| Footer: newsletter, links, payments, bottom bar | `src/html/sections/footer/` |
| Script list (keep this order) | `src/html/sections/scripts.html` |

A line like `<!-- @include pages/shop.html -->` means "put that file here". Files named `index.html` inside a folder hold the page wrapper and include the smaller section files.

**Admin panel:** the sidebar, login, icons and each screen (dashboard, products, orders, customers, inventory, payments, analytics, settings) are in `src/html/admin/`. Its styles are `admin/css/admin.css` and its scripts are `admin/js/01-core.js` ... `13-navigation-start.js` (one per feature, keep the number order). Open `admin/index.html` with Live Server.

**Scripts** (in load order): `config`, `data`, `shop`, `router`, `cart`, `product-actions`, `init`, `product`, `progress-bar`, `quick-view`, `scroll-links`, `checkout-account`, `home-carousel`, `floating-chat`, `copy-buttons`, then Supabase, `supabase`, `customer-auth`.

Do not reorder the scripts. Some files need the ones before them.

## Adding products from the admin panel

Products are added in the admin panel (**Products & Categories**) and appear on the website by themselves. No code editing.

**One-time setup (Supabase):**
1. Open your Supabase project, then **SQL Editor > New query**.
2. Paste `supabase/setup-products.sql` and click **Run**. This adds the new product columns, the photo storage, and the permissions. Add your own email to the `admins` table first (the file explains how). It is safe to run again.
3. Optional: run `supabase/seed-demo-products.sql` to copy the 13 sample products from `js/data.js` into the table, so you can edit or hide them. **Do this before adding your first product**, because once the table has any product the website shows only the table, not `js/data.js`.

**Adding a product:** fill the form (name, description, price, stock, sizes, colors, shop sections, front and back photo) and click **Save product**. The preview on the right shows the card as the website will show it. Use **Edit** in the list to change a product, and set **Website: Hidden** to hide it without deleting it. Photos are shrunk and stored in the `product-images` bucket. Deleting a product also deletes its photos.

**How the website gets them:** `js/supabase.js` reads the `products` table when a page opens, skips hidden products, and redraws the shop, the category counts, the home carousel and the product page. A copy is kept on the visitor's device so the right products show immediately next time.

Admin columns used: `name, description, price, stock, active, category_id, tags, sizes, colors, color_hex, tex, img, img_back`.

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
