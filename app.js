/* Pina's Thrift — Shared App Logic
   Supports three modes (auto-detected in this order):
     1. Vercel API   → if deployed to Vercel with /api/* serverless functions
     2. Supabase     → if SUPABASE_CONFIG is filled in
     3. localStorage → fallback for local dev / no DB configured
*/

// ===========================================================
// 🔧 MODE 1 — SUPABASE  (★ active for your setup ★)
// Paste your two values below.
// Get them from Supabase: Project Settings → API
// ===========================================================
const SUPABASE_CONFIG = {
  url: 'https://ohdyyrdpulatcjmxzdqm.supabase.co',     // e.g. 'https://sadgikmxvfrnlpotnjol.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZHl5cmRwdWxhdGNqbXh6ZHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTExOTIsImV4cCI6MjA5Nzg4NzE5Mn0.5RFO2gvNa6azUZfrzWm9ZxIOFTx1D4K7i_1ITMVP2HU', // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZGdpa214dmZybmxwb3Ruam9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODI3MzUsImV4cCI6MjA5Nzg1ODczNX0.KgC_phstGPu9uW5Pjvvm5QK63bhiEyRbLUrcbyL0h3I'
};

// ===========================================================
// 🔧 MODE 2 — VERCEL POSTGRES (alternative, not used here)
// Leave USE_VERCEL_API = false when using Supabase.
// ===========================================================
const USE_VERCEL_API = false;
const VERCEL_API_BASE = '/api';

// ---- auto-detect which mode is actually available ----
// Vercel mode is "active" only if a quick probe to /api/products succeeds.
// We do that probe asynchronously; until it completes we optimistically
// use Vercel mode (if enabled), then fall back if it fails.
let MODE = 'local';
const USE_SUPABASE = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
let sb = null;

if (USE_VERCEL_API) {
  MODE = 'vercel';
} else if (USE_SUPABASE && window.supabase) {
  MODE = 'supabase';
  sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

function logMode(){
  if (MODE === 'vercel')   console.log('%c▲ Pina\'s Thrift: connected to Vercel Postgres', 'color:#e84072;font-weight:bold');
  if (MODE === 'supabase') console.log('%c☁ Pina\'s Thrift: connected to Supabase', 'color:#e84072;font-weight:bold');
  if (MODE === 'local')    console.log('%c💾 Pina\'s Thrift: localStorage mode (no DB configured)', 'color:#888');
}
logMode();

// Tiny fetch helper for Vercel API
async function api(path, opts = {}) {
  const res = await fetch(VERCEL_API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  // Some endpoints return empty body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ===========================================================
// Local-only keys (cart, sessions, OTP — these are per-device)
// ===========================================================
const DB = {
  CURRENT:    'pinas_current_user',
  CART:       'pinas_cart',
  OTP:        'pinas_pending_otp',
  RESET:      'pinas_pending_reset',
  ADMIN:      'pinas_admin_session',
  // localStorage fallback storage keys
  USERS_LS:    'pinas_users',
  PRODUCTS_LS: 'pinas_products',
  ORDERS_LS:   'pinas_orders',
};

const CATEGORIES = ['Skirt and Blouse', 'Corporate Outfit', 'Kids Attire', 'Gowns'];

const DEFAULT_PRODUCTS = [
  { id:'p1',  name:'Floral Midi Skirt & Silk Blouse Set', category:'Skirt and Blouse', price:180, stock:6,  image:'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80' },
  { id:'p2',  name:'Pleated Pastel Skirt + White Top',    category:'Skirt and Blouse', price:150, stock:4,  image:'https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=600&q=80' },
  { id:'p3',  name:'Boho Print Wrap Skirt Set',           category:'Skirt and Blouse', price:165, stock:3,  image:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80' },
  { id:'p4',  name:'Classic Navy Blazer Suit',            category:'Corporate Outfit', price:320, stock:5,  image:'https://images.unsplash.com/photo-1632149877166-f75d49000351?w=600&q=80' },
  { id:'p5',  name:'Beige Pencil Skirt & Jacket',         category:'Corporate Outfit', price:280, stock:4,  image:'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80' },
  { id:'p6',  name:'Charcoal Power Suit',                 category:'Corporate Outfit', price:350, stock:2,  image:'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80' },
  { id:'p7',  name:'Pink Princess Party Dress',           category:'Kids Attire',      price:95,  stock:8,  image:'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80' },
  { id:'p8',  name:'Little Girl Denim Set',               category:'Kids Attire',      price:85,  stock:7,  image:'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80' },
  { id:'p9',  name:'Floral Toddler Sunday Dress',         category:'Kids Attire',      price:70,  stock:10, image:'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80' },
  { id:'p10', name:'Emerald Satin Evening Gown',          category:'Gowns',            price:420, stock:3,  image:'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80' },
  { id:'p11', name:'Rose Lace Wedding Gown',              category:'Gowns',            price:550, stock:2,  image:'https://images.unsplash.com/photo-1594552072238-5c4a26f10f6f?w=600&q=80' },
  { id:'p12', name:'Champagne A-Line Gown',               category:'Gowns',            price:380, stock:4,  image:'https://images.unsplash.com/photo-1546961342-1c7d4e8b9b85?w=600&q=80' },
];

const ORDER_STAGES = ['Pending','Processing','Ready to Deliver','Delivered'];

// In-memory caches
let _productsCache = [];
let _ordersCache   = [];

// ============== storage helpers ==============
function load(k, f){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):f}catch(e){return f} }
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

function initLocalDB(){
  if (!localStorage.getItem(DB.PRODUCTS_LS)) save(DB.PRODUCTS_LS, DEFAULT_PRODUCTS);
  if (!localStorage.getItem(DB.USERS_LS))    save(DB.USERS_LS, []);
  if (!localStorage.getItem(DB.CART))        save(DB.CART, []);
  if (!localStorage.getItem(DB.ORDERS_LS))   save(DB.ORDERS_LS, []);
}
initLocalDB();

// ===========================================================
// PRODUCTS
// ===========================================================
function _mapProduct(p){
  return { id:p.id, name:p.name, category:p.category, price:Number(p.price), stock:Number(p.stock), image:p.image };
}

async function loadProducts(){
  try {
    if (MODE === 'vercel') {
      const data = await api('/products');
      _productsCache = data.map(_mapProduct);
    } else if (MODE === 'supabase') {
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending:false });
      if (error) throw error;
      _productsCache = data.map(_mapProduct);
    } else {
      _productsCache = load(DB.PRODUCTS_LS, []);
    }
  } catch (err) {
    console.warn('Falling back to localStorage:', err.message);
    MODE = 'local';
    _productsCache = load(DB.PRODUCTS_LS, []);
  }
  return _productsCache;
}
function getProducts(){ return _productsCache; }

async function addProduct(p){
  if (MODE === 'vercel') {
    await api('/products', { method: 'POST', body: p });
  } else if (MODE === 'supabase') {
    const { error } = await sb.from('products').insert([{
      id: 'p_' + Date.now(),
      name: p.name, category: p.category, price: p.price, stock: p.stock, image: p.image
    }]);
    if (error) throw new Error(error.message);
  } else {
    const products = load(DB.PRODUCTS_LS, []);
    products.push({ ...p, id:'p_'+Date.now() });
    save(DB.PRODUCTS_LS, products);
  }
  await loadProducts();
}

async function updateProduct(id, data){
  if (MODE === 'vercel') {
    await api('/products', { method: 'PATCH', body: { id, ...data } });
  } else if (MODE === 'supabase') {
    const { error } = await sb.from('products').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const products = load(DB.PRODUCTS_LS, []);
    const i = products.findIndex(p=>p.id===id);
    if (i>=0){ products[i] = {...products[i], ...data}; save(DB.PRODUCTS_LS, products); }
  }
  await loadProducts();
}

async function deleteProduct(id){
  if (MODE === 'vercel') {
    await api('/products?id=' + encodeURIComponent(id), { method: 'DELETE' });
  } else if (MODE === 'supabase') {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    save(DB.PRODUCTS_LS, load(DB.PRODUCTS_LS, []).filter(p=>p.id!==id));
  }
  await loadProducts();
}

async function updateProductStock(id, stock){
  await updateProduct(id, { stock: Number(stock) });
}

// ===========================================================
// ORDERS
// ===========================================================
function _mapOrder(o){
  return {
    id: o.id,
    reference: o.reference,
    customerName:   o.customer_name   ?? o.customerName,
    customerMobile: o.customer_mobile ?? o.customerMobile,
    customerEmail:  o.customer_email  ?? o.customerEmail,
    items: o.items || [],
    total: Number(o.total),
    status: o.status,
    history: o.history || [],
    createdAt: o.createdAt || (o.created_at ? new Date(o.created_at).getTime() : Date.now()),
  };
}

async function loadOrders(){
  try {
    if (MODE === 'vercel') {
      const data = await api('/orders');
      _ordersCache = data.map(_mapOrder);
    } else if (MODE === 'supabase') {
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending:false });
      if (error) throw error;
      _ordersCache = data.map(_mapOrder);
    } else {
      _ordersCache = load(DB.ORDERS_LS, []).map(_mapOrder);
    }
  } catch (err) {
    console.warn('Falling back to localStorage:', err.message);
    MODE = 'local';
    _ordersCache = load(DB.ORDERS_LS, []).map(_mapOrder);
  }
  return _ordersCache;
}
function getOrders(){ return _ordersCache; }

async function createOrder({ reference, customerName, customerMobile, customerEmail, items, total }){
  if (MODE === 'vercel') {
    const { id } = await api('/orders', { method: 'POST', body: { reference, customerName, customerMobile, customerEmail, items, total } });
    await loadProducts(); // refresh stock
    return { id, reference, customerName, customerMobile, customerEmail, items, total, status:'Pending', history:[{status:'Pending', at:Date.now()}], createdAt: Date.now() };
  }

  const id = 'PT-' + Math.random().toString(36).slice(2,7).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const history = [{ status:'Pending', at: Date.now() }];

  if (MODE === 'supabase') {
    const { error } = await sb.from('orders').insert([{
      id, reference,
      customer_name: customerName,
      customer_mobile: customerMobile,
      customer_email: customerEmail,
      items, total, status:'Pending', history
    }]);
    if (error) throw new Error(error.message);
    for (const it of items){
      const p = _productsCache.find(x=>x.id===it.id);
      if (p) await updateProduct(it.id, { stock: Math.max(0, p.stock - it.qty) });
    }
  } else {
    const order = { id, reference, customerName, customerMobile, customerEmail, items, total, status:'Pending', history, createdAt: Date.now() };
    const orders = load(DB.ORDERS_LS, []);
    orders.push(order);
    save(DB.ORDERS_LS, orders);
    const products = load(DB.PRODUCTS_LS, []);
    items.forEach(it => {
      const p = products.find(x=>x.id===it.id);
      if (p) p.stock = Math.max(0, p.stock - it.qty);
    });
    save(DB.PRODUCTS_LS, products);
    await loadProducts();
  }
  return { id, reference, customerName, customerMobile, customerEmail, items, total, status:'Pending', history, createdAt: Date.now() };
}

async function updateOrderStatus(orderId, status){
  if (MODE === 'vercel') {
    await api('/orders', { method: 'PATCH', body: { id: orderId, status } });
  } else if (MODE === 'supabase') {
    const { data, error } = await sb.from('orders').select('history').eq('id', orderId).single();
    if (error) throw new Error(error.message);
    const history = [...(data.history||[]), { status, at: Date.now() }];
    const { error: e2 } = await sb.from('orders').update({ status, history }).eq('id', orderId);
    if (e2) throw new Error(e2.message);
  } else {
    const orders = load(DB.ORDERS_LS, []);
    const o = orders.find(x=>x.id===orderId);
    if (o){ o.status = status; (o.history = o.history||[]).push({status, at: Date.now()}); save(DB.ORDERS_LS, orders); }
  }
  await loadOrders();
}

async function findOrder(query){
  const q = (query||'').trim();
  if (!q) return null;
  if (MODE === 'vercel') {
    const data = await api('/orders?q=' + encodeURIComponent(q));
    return data ? _mapOrder(data) : null;
  }
  if (MODE === 'supabase') {
    let r = await sb.from('orders').select('*').ilike('id', q).limit(1);
    if (!r.data || !r.data.length){
      r = await sb.from('orders').select('*').ilike('reference', q).limit(1);
    }
    return (r.data && r.data[0]) ? _mapOrder(r.data[0]) : null;
  }
  const lower = q.toLowerCase();
  const found = load(DB.ORDERS_LS, []).find(o =>
    o.id.toLowerCase() === lower || (o.reference||'').toLowerCase() === lower
  );
  return found ? _mapOrder(found) : null;
}

// ===========================================================
// USERS / AUTH
// ===========================================================
function getCurrentUser(){ return load(DB.CURRENT, null); }
function setCurrentUser(u){ save(DB.CURRENT, u); }
function logout(){ localStorage.removeItem(DB.CURRENT); localStorage.removeItem(DB.ADMIN); location.href='index.html'; }

async function registerUser({name, email, mobile, password}){
  if (MODE === 'vercel') {
    const existing = await api('/users?action=check&mobile=' + encodeURIComponent(mobile) + '&email=' + encodeURIComponent(email));
    if (existing && existing.length){
      if (existing.some(u => u.mobile === mobile)) throw new Error('Mobile number already registered.');
      throw new Error('Email already in use.');
    }
  } else if (MODE === 'supabase') {
    const { data: existing } = await sb.from('users').select('mobile,email').or(`mobile.eq.${mobile},email.eq.${email}`);
    if (existing && existing.length){
      if (existing.some(u => u.mobile === mobile)) throw new Error('Mobile number already registered.');
      throw new Error('Email already in use.');
    }
  } else {
    const users = load(DB.USERS_LS, []);
    if (users.find(u=>u.mobile===mobile)) throw new Error('Mobile number already registered.');
    if (users.find(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('Email already in use.');
  }
  const otp = String(Math.floor(100000 + Math.random()*900000));
  save(DB.OTP, { name, email, mobile, password, otp, createdAt: Date.now() });
  return otp;
}

async function verifyOtp(code){
  const pending = load(DB.OTP, null);
  if (!pending) throw new Error('No pending registration. Please sign up again.');
  if (pending.otp !== code) throw new Error('Invalid OTP code.');

  const user = {
    id: 'u_' + Date.now(),
    name: pending.name,
    email: pending.email,
    mobile: pending.mobile,
    password: pending.password
  };

  if (MODE === 'vercel') {
    await api('/users?action=register', { method: 'POST', body: user });
  } else if (MODE === 'supabase') {
    const { error } = await sb.from('users').insert([user]);
    if (error) throw new Error(error.message);
  } else {
    const users = load(DB.USERS_LS, []);
    users.push({ ...user, createdAt: Date.now() });
    save(DB.USERS_LS, users);
  }
  localStorage.removeItem(DB.OTP);
  setCurrentUser({ id:user.id, name:user.name, email:user.email, mobile:user.mobile });
  return user;
}

async function loginUser(mobile, password){
  let user = null;
  if (MODE === 'vercel') {
    try {
      user = await api('/users?action=login', { method: 'POST', body: { mobile, password } });
    } catch (e) { user = null; }
  } else if (MODE === 'supabase') {
    const { data, error } = await sb.from('users').select('*').eq('mobile', mobile).eq('password', password).maybeSingle();
    if (error) throw new Error(error.message);
    user = data;
  } else {
    user = load(DB.USERS_LS, []).find(u => u.mobile===mobile && u.password===password);
  }
  if (!user) throw new Error('Invalid mobile number or password.');
  setCurrentUser({ id:user.id, name:user.name, email:user.email, mobile:user.mobile });
  return user;
}

async function requestPasswordReset(mobile){
  let user = null;
  if (MODE === 'vercel') {
    user = await api('/users?action=find&mobile=' + encodeURIComponent(mobile));
  } else if (MODE === 'supabase') {
    const { data } = await sb.from('users').select('mobile').eq('mobile', mobile).maybeSingle();
    user = data;
  } else {
    user = load(DB.USERS_LS, []).find(u => u.mobile===mobile);
  }
  if (!user) throw new Error('No account found with that mobile number.');
  const code = String(Math.floor(100000 + Math.random()*900000));
  save(DB.RESET, { mobile, code, createdAt: Date.now() });
  return code;
}

async function resetPassword(code, newPassword){
  const pending = load(DB.RESET, null);
  if (!pending) throw new Error('No reset in progress.');
  if (pending.code !== code) throw new Error('Invalid reset code.');
  if (MODE === 'vercel') {
    await api('/users?action=reset', { method: 'PATCH', body: { mobile: pending.mobile, password: newPassword } });
  } else if (MODE === 'supabase') {
    const { error } = await sb.from('users').update({ password: newPassword }).eq('mobile', pending.mobile);
    if (error) throw new Error(error.message);
  } else {
    const users = load(DB.USERS_LS, []);
    const i = users.findIndex(u => u.mobile === pending.mobile);
    if (i>=0){ users[i].password = newPassword; save(DB.USERS_LS, users); }
  }
  localStorage.removeItem(DB.RESET);
}

// ===========================================================
// ADMIN session
// ===========================================================
function adminLogin(mobile, password){
  if (mobile==='admin' && password==='admin'){ save(DB.ADMIN, { at: Date.now() }); return true; }
  throw new Error('Invalid admin credentials.');
}
function isAdmin(){ return !!load(DB.ADMIN, null); }

// ===========================================================
// CART (always per-device in localStorage)
// ===========================================================
function getCart(){ return load(DB.CART, []); }
function saveCart(c){ save(DB.CART, c); updateCartBadge(); }

function addToCart(productId){
  const product = getProducts().find(p => p.id === productId);
  if (!product || product.stock < 1){ toast('Out of stock','error'); return; }
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing){
    if (existing.qty + 1 > product.stock){ toast('No more stock available','error'); return; }
    existing.qty += 1;
  } else {
    cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, qty:1 });
  }
  saveCart(cart);
  toast('Added to cart ✓','success');
}

function updateCartQty(id, delta){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const product = getProducts().find(p => p.id === id);
  const newQty = item.qty + delta;
  if (newQty < 1){ saveCart(cart.filter(i=>i.id!==id)); return; }
  if (product && newQty > product.stock){ toast('Stock limit reached','error'); return; }
  item.qty = newQty;
  saveCart(cart);
}
function removeFromCart(id){ saveCart(getCart().filter(i => i.id !== id)); }
function cartTotal(){ return getCart().reduce((s,i)=> s + i.price*i.qty, 0); }
function cartCount(){ return getCart().reduce((s,i)=> s + i.qty, 0); }
function clearCart(){ saveCart([]); }

function updateCartBadge(){
  const el = document.getElementById('cartBadge');
  if (el){ const c = cartCount(); el.textContent = c; el.style.display = c>0 ? 'grid' : 'none'; }
}

// ===========================================================
// UI helpers
// ===========================================================
function toast(msg, type=''){
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='.3s'; setTimeout(()=>t.remove(), 300); }, 2600);
}
function money(n){ return 'GH₵ ' + Number(n).toFixed(2); }
function formatDate(ts){ return new Date(ts).toLocaleString(); }

// ===========================================================
// Shared Nav / Footer
// ===========================================================
function renderNav(active=''){
  const user = getCurrentUser();
  const accountLink = user
    ? `<a href="track.html" title="Welcome ${user.name.split(' ')[0]}"><span style="font-size:.85rem">Hi, ${user.name.split(' ')[0]}</span></a>
       <button class="icon-btn" onclick="logout()" title="Logout">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
       </button>`
    : `<a href="auth.html" class="btn btn-outline btn-sm" style="padding:.5rem 1.1rem">Sign In</a>`;
  return `
  <div class="topbar">✨ Free delivery on orders over GH₵ 500 — Quality pre-loved fashion, hand-picked by Pina ✨</div>
  <nav class="nav">
    <div class="nav-inner">
      <a href="index.html" class="brand">
        <div class="brand-mark">P</div>
        <div class="brand-title">Pina's<span> Thrift</span></div>
      </a>
      <div class="nav-links" id="navLinks">
        <a href="index.html" class="${active==='shop'?'active':''}">Shop</a>
        <a href="index.html#categories" class="${active==='cat'?'active':''}">Categories</a>
        <a href="track.html" class="${active==='track'?'active':''}">Track Order</a>
        
      </div>
      <div class="nav-actions">
        ${accountLink}
        <a href="cart.html" class="icon-btn" title="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <span class="cart-badge" id="cartBadge" style="display:none">0</span>
        </a>
        <button class="menu-toggle" id="menuToggle" title="Menu" onclick="document.getElementById('navLinks').classList.toggle('open')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  </nav>`;
}

function renderFooter(){
  return `
  <footer class="footer">
    <div class="footer-inner">
      <div>
        <div class="brand" style="color:#fff;margin-bottom:.5rem">
          <div class="brand-mark">P</div>
          <div class="brand-title" style="color:#fff">Pina's<span> Thrift</span></div>
        </div>
        <p style="font-size:.88rem;line-height:1.6;color:#9ea1b8">Hand-picked pre-loved fashion for the modern woman. Quality you can trust, prices you'll love.</p>
      </div>
      <div>
        <h4>Shop</h4>
        <a href="index.html">All Products</a>
        <a href="index.html">Skirts & Blouses</a>
        <a href="index.html">Corporate Wear</a>
        <a href="index.html">Gowns</a>
      </div>
      <div>
        <h4>Help</h4>
        <a href="track.html">Track Order</a>
        <a href="auth.html">My Account</a>
        <a href="#">Contact</a>
        <a href="#">Returns</a>
      </div>
      <div>
        <h4>Contact</h4>
        <a href="tel:0591617017">📞 0591617017</a>
        <a href="tel:0502365727">📞 0502365727</a>
        <a href="#">Accra, Ghana</a>
      </div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} Pina's Thrift • Curated by Lotal Ghana</div>
  </footer>`;
}

function mountChrome(active){
  const nav = document.getElementById('siteNav');
  const ft  = document.getElementById('siteFooter');
  if (nav) nav.innerHTML = renderNav(active);
  if (ft)  ft.innerHTML  = renderFooter();
  updateCartBadge();
}
