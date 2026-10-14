/* FILE: js/data.js
   Products, colours, categories, price ranges (EDIT PRODUCTS HERE) */

const COLORS = { 'Black':'#18140F', 'Purple':'#6A1B9A', 'Off-white':'#F3EEE4', 'Brown':'#7C6A55', 'Charcoal':'#3A352D' };
const CATEGORIES = [
  { id:'all', label:'ALL' },{ id:'t-shirts', label:'T-SHIRTS' },{ id:'oversized', label:'OVERSIZED' },{ id:'graphic', label:'GRAPHIC' },
  { id:'essentials', label:'ESSENTIALS' },{ id:'new-arrivals', label:'NEW ARRIVALS' },{ id:'limited-drop', label:'LIMITED DROP' }
];
const PRODUCTS = [
  { id:1,  name:'Essential Tee',     price:990,  tex:1, tags:['t-shirts','essentials'],                         colors:['Black','Purple','Off-white'], sizes:['S','M','L','XL','XXL'], stock:40 },
  { id:2,  name:'Boxy Graphic',      price:1150, tex:2, tags:['t-shirts','oversized','graphic'],                colors:['Black','Brown'],              sizes:['M','L','XL'],           stock:22 },
  { id:3,  name:'After Dark Tee',    price:1290, tex:3, tags:['t-shirts','oversized','graphic','new-arrivals'], colors:['Black','Purple'],             sizes:['S','M','L','XL'],       stock:18 },
  { id:4,  name:'Layer Tee',         price:1050, tex:4, tags:['t-shirts','essentials'],                         colors:['Charcoal','Off-white'],       sizes:['S','M','L','XL','XXL'], stock:30 },
  { id:5,  name:'Oversized Fit Tee', price:1190, tex:5, tags:['t-shirts','oversized','new-arrivals'],           colors:['Black'],                      sizes:['M','L','XL','XXL'],     stock:25 },
  { id:6,  name:'Statement Graphic', price:1250, tex:1, tags:['t-shirts','graphic'],                            colors:['Purple','Black'],             sizes:['S','M','L'],            stock:14 },
  { id:7,  name:'Studio Tee',        price:950,  tex:2, tags:['t-shirts','essentials','new-arrivals'],          colors:['Off-white','Brown'],          sizes:['S','M','L','XL'],       stock:35 },
  { id:8,  name:'Limited Drop 01',   price:1390, tex:3, tags:['t-shirts','graphic','limited-drop'],             colors:['Black'],                      sizes:['M','L','XL'],           stock:6  },
  { id:9,  name:'Daylight Oversized',price:1230, tex:4, tags:['t-shirts','oversized'],                          colors:['Off-white','Charcoal'],       sizes:['M','L','XL','XXL'],     stock:20 },
  { id:10, name:'Plain Black Tee',   price:890,  tex:5, tags:['t-shirts','essentials'],                         colors:['Black'],                      sizes:['S','M','L','XL','XXL'], stock:60 },
  { id:11, name:'Drop 01 Back Print',price:1450, tex:1, tags:['t-shirts','graphic','limited-drop'],             colors:['Black','Purple'],             sizes:['M','L'],                stock:0  },
  { id:12, name:'Slow Burn Tee',     price:1190, tex:2, tags:['t-shirts','graphic','new-arrivals'],             colors:['Purple','Charcoal'],          sizes:['S','M','L','XL'],       stock:16 },
  { id:13, name:'Midnight Run Tee',  price:1490, tex:3, tags:['t-shirts','graphic','limited-drop'],             colors:['Black','Charcoal'],           sizes:['M','L','XL'],           stock:4  }
];
const PRICE_RANGES = {
  low:  { label:'Under ৳1,000',    test:p => p < 1000 },
  mid:  { label:'৳1,000 – ৳1,200', test:p => p >= 1000 && p <= 1200 },
  high: { label:'Over ৳1,200',     test:p => p > 1200 }
};
const SIZE_ORDER = ['XS','S','M','L','XL','XXL'];

/* ---------------------------------------------------------------------
   Products that come from the admin panel (js/supabase.js loads them).
   normId: product ids can be numbers or text, this keeps both working.
   setProducts: swaps the product list and adds any new colours / sizes.
   A copy is kept on the visitor's device so the right products show straight away.
   --------------------------------------------------------------------- */
const PRODUCT_CACHE_KEY = 'tb_products_v1';
function normId(v){ return /^-?\d+$/.test(String(v)) ? Number(v) : String(v); }
function setProducts(rows){
  rows.forEach(function (r) {
    Object.keys(r.colorHex || {}).forEach(function (n) { COLORS[n] = r.colorHex[n]; });
    (r.sizes || []).forEach(function (z) { if (SIZE_ORDER.indexOf(z) < 0) SIZE_ORDER.push(z); });
  });
  PRODUCTS.length = 0;
  rows.forEach(function (r) { PRODUCTS.push(r); });
}
try {
  const saved = JSON.parse(localStorage.getItem(PRODUCT_CACHE_KEY) || 'null');
  if (Array.isArray(saved) && saved.length) setProducts(saved);
} catch (err) {}
