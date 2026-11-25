// Set this to the team's n8n webhook URL to forward saved orders automatically.
const ENQUIRY_FORM_URL = "";
const ADMIN_PIN = "2468";
const ORDER_WHATSAPP_NUMBER = "2349066985431";
const ENQUIRY_WHATSAPP_NUMBER = "2349066985431";
const ORDERS_KEY = "glowCosmeticsOrders";
const STOCK_KEY = "glowCosmeticsStock";
const PRODUCTS = [
  { id: "gentle-cleanser", name: "Gentle Hydrating Cleanser", category: "Gentle Cleansers & Toners", summary: "A gentle cleanser for removing everyday surface impurities.", usage: ["Wet face with lukewarm water.", "Massage a small amount gently over skin.", "Rinse thoroughly and pat dry."] },
  { id: "rosewater-toner", name: "Soothing Rosewater Toner", category: "Gentle Cleansers & Toners", summary: "A refreshing rosewater toner for a simple daily routine.", usage: ["Apply a small amount to a cotton pad or clean hands.", "Sweep or pat gently over clean skin.", "Allow it to dry before the next routine step."] },
  { id: "barrier-moisturiser", name: "Daily Barrier Moisturiser", category: "Nourishing Moisturisers & Lotions", summary: "An everyday moisturiser that helps keep skin feeling hydrated.", usage: ["Apply a small amount to clean, dry skin.", "Spread gently over the face and neck.", "Use as directed on the product packaging."] },
  { id: "shea-lotion", name: "Shea & Ceramide Body Lotion", category: "Nourishing Moisturisers & Lotions", summary: "A nourishing body lotion for everyday moisture.", usage: ["Apply to clean skin.", "Massage gently over the body until absorbed.", "Follow the directions on the product packaging."] },
  { id: "vitamin-c-serum", name: "Vitamin C Glow Serum", category: "Serums & Daily Sun Care", summary: "A lightweight vitamin C serum in the daily skincare collection.", usage: ["Apply a small amount to clean, dry skin.", "Spread gently over the face, avoiding the eyes.", "Follow the directions on the product packaging."] },
  { id: "daily-sunscreen", name: "Daily SPF 50 Sunscreen", category: "Serums & Daily Sun Care", summary: "A daily sun-care product with SPF 50.", usage: ["Apply evenly to exposed skin before going outdoors.", "Reapply as directed on the product packaging.", "Use the amount and directions stated on the label."] }
];

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const enquiryModal = document.querySelector("#enquiry-modal");
const productInfoModal = document.querySelector("#product-info-modal");
const orderModal = document.querySelector("#order-modal");
const trackingModal = document.querySelector("#tracking-modal");
const adminModal = document.querySelector("#admin-modal");
const adminGateModal = document.querySelector("#admin-gate-modal");
const enquiryForm = document.querySelector("#enquiry-form");
const orderForm = document.querySelector("#order-form");
const copyStatus = document.querySelector("#copy-status");
let activeDialog = null;
let returnFocus = null;
let activeStatusFilter = "All";

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("open", !open);
  });
  navLinks.querySelectorAll("a, button").forEach((link) => link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }));
}

function openDialog(dialog, focusSelector) {
  returnFocus = document.activeElement;
  activeDialog = dialog;
  dialog.hidden = false;
  document.body.classList.add("modal-open");
  dialog.querySelector(focusSelector)?.focus();
}
function closeDialog(dialog = activeDialog) {
  if (!dialog) return;
  dialog.hidden = true;
  if (dialog === activeDialog) activeDialog = null;
  if (!document.querySelector(".modal-backdrop:not([hidden])")) document.body.classList.remove("modal-open");
  returnFocus?.focus();
}
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => closeDialog(button.closest(".modal-backdrop"))));
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) closeDialog(backdrop);
}));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeDialog) closeDialog();
  if (event.key === "Tab" && activeDialog && !activeDialog.hidden) {
    const focusable = [...activeDialog.querySelectorAll("button, input, select, textarea, a[href]")].filter((el) => !el.disabled && el.offsetParent !== null);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function stockAvailable(productId) {
  return readStock()[productId] !== false;
}
function openEnquiry(enquiryType = "") {
  enquiryForm.reset();
  if (enquiryType) document.querySelector("#enquiry-type").value = enquiryType;
  copyStatus.textContent = "";
  openDialog(enquiryModal, "#enquiry-type");
}
document.querySelectorAll("[data-open-enquiry]").forEach((button) => button.addEventListener("click", () => openEnquiry()));
document.querySelectorAll("a[data-enquiry]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  openEnquiry();
}));
function openProductInfo(productId) {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) return;
  document.querySelector("#product-detail-name").textContent = product.name;
  document.querySelector("#product-detail-category").textContent = product.category;
  document.querySelector("#product-detail-summary").textContent = product.summary;
  const status = document.querySelector("#product-detail-status");
  const available = stockAvailable(product.id);
  status.textContent = available ? "Available" : "Sold Out";
  status.classList.toggle("sold-out", !available);
  const steps = document.querySelector("#product-detail-steps");
  steps.replaceChildren(...product.usage.map((step) => { const item = document.createElement("li"); item.textContent = step; return item; }));
  document.querySelector("#product-info-order").dataset.product = product.id;
  openDialog(productInfoModal, "[data-close-modal]");
}
document.querySelectorAll(".quick-enquire").forEach((button) => button.addEventListener("click", () => openProductInfo(button.dataset.product)));
document.querySelector("#product-info-order").addEventListener("click", (event) => {
  const productId = event.currentTarget.dataset.product;
  const trigger = returnFocus;
  closeDialog(productInfoModal);
  openOrder(productId);
  returnFocus = trigger;
});
function enquiryMessage() {
  const data = new FormData(enquiryForm);
  return [
    `Enquiry Type: ${data.get("type")}`,
    `Skin Type: ${data.get("skinType") || "Not specified"}`,
    `Name: ${data.get("name")}`,
    `City: ${data.get("city")}`,
    `Note for the team: ${data.get("note") || "None"}`
  ].join("\n");
}
enquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = encodeURIComponent(enquiryMessage());
  window.open(`https://wa.me/${ENQUIRY_WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  copyStatus.textContent = "Opening WhatsApp with your enquiry details.";
});

function openOrder(productId = "") {
  orderForm.reset();
  document.querySelector("#order-error").textContent = "";
  document.querySelector("#order-status").textContent = "";
  document.querySelector("#order-confirmation").hidden = true;
  const product = PRODUCTS.find((item) => item.id === productId);
  const context = document.querySelector("#order-category-context");
  context.hidden = !product;
  context.textContent = product ? `Starting with ${product.name}; you can add more available items below.` : "";
  syncStockUI();
  if (product && stockAvailable(product.id)) {
    const input = orderForm.querySelector(`input[data-product-id="${product.id}"]`);
    if (input) input.value = "1";
  }
  openDialog(orderModal, ".product-picker button");
}
document.querySelectorAll("[data-open-order]").forEach((button) => button.addEventListener("click", () => openOrder(button.dataset.product || "")));
document.querySelectorAll("[data-quantity]").forEach((button) => button.addEventListener("click", () => {
  const input = button.parentElement.querySelector("input");
  input.value = Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(button.dataset.quantity)));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}));

function readOrders() {
  try { const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); return Array.isArray(orders) ? orders : []; }
  catch { return []; }
}
function readStock() {
  let saved = {};
  try { const parsed = JSON.parse(localStorage.getItem(STOCK_KEY) || "{}"); saved = parsed && typeof parsed === "object" ? parsed : {}; } catch { saved = {}; }
  return Object.fromEntries(PRODUCTS.map((product) => [product.id, saved[product.id] !== false]));
}
function saveStock(stock) {
  localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  syncStockUI();
  renderAdminStock();
}
function syncStockUI() {
  const stock = readStock();
  PRODUCTS.forEach((product) => {
    const available = stock[product.id];
    document.querySelectorAll(`[data-product-card="${product.id}"]`).forEach((card) => {
      const status = card.querySelector("[data-product-status]");
      const stamp = card.querySelector("[data-stock-stamp]");
      if (status) { status.textContent = available ? "Available" : "Sold Out"; status.classList.toggle("sold-out", !available); }
      if (stamp) stamp.hidden = available;
      card.classList.toggle("is-sold-out", !available);
    });
    document.querySelectorAll(`[data-product-id="${product.id}"][data-product-name]`).forEach((input) => {
      const row = input.closest(".product-option");
      const status = row?.querySelector("[data-order-stock]");
      if (status) { status.textContent = available ? "Available" : "Sold Out"; status.classList.toggle("sold-out", !available); }
      input.disabled = !available;
      row?.querySelectorAll("button[data-quantity]").forEach((button) => { button.disabled = !available; });
      if (!available) input.value = "0";
      row?.classList.toggle("is-sold-out", !available);
    });
  });
}
function renderAdminStock() {
  const grid = document.querySelector("#admin-stock-grid");
  if (!grid) return;
  grid.replaceChildren();
  const stock = readStock();
  PRODUCTS.forEach((product) => {
    const row = document.createElement("div"); row.className = "admin-stock-row";
    const name = document.createElement("span"); name.textContent = product.name;
    const label = document.createElement("label");
    const toggle = document.createElement("input"); toggle.type = "checkbox"; toggle.checked = stock[product.id];
    toggle.setAttribute("aria-label", `${product.name} available`);
    const status = document.createElement("span"); status.textContent = stock[product.id] ? "Available" : "Sold Out";
    toggle.addEventListener("change", () => {
      const next = readStock(); next[product.id] = toggle.checked;
      try { saveStock(next); } catch { status.textContent = "Could not save stock status"; }
    });
    label.append(toggle, status); row.append(name, label); grid.append(row);
  });
}
function writeOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
function createTrackingCode(orders) {
  let code;
  do { code = `GLW-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`; }
  while (orders.some((order) => order.trackingCode === code));
  return code;
}
function selectedItems() {
  return [...orderForm.querySelectorAll("[data-product-name]")]
    .map((input) => ({ name: input.dataset.productName, productId: input.dataset.productId, quantity: Number(input.value) }))
    .filter((item) => item.quantity > 0);
}
function orderWhatsAppMessage(order) {
  return [
    `Tracking Code: ${order.trackingCode}`,
    "Glow Cosmetics Order",
    "Items:",
    ...order.items.map((item) => `${item.quantity}x ${item.name}`),
    `Skin Type: ${order.skinType || "Not specified"}`,
    "Delivery Details:",
    `Full Name: ${order.delivery.fullName}`,
    `Phone Number: ${order.delivery.phone}`,
    `State / City: ${order.delivery.stateCity}`,
    `Full Delivery Address: ${order.delivery.address}`,
    `Delivery Notes: ${order.delivery.notes || "None"}`
  ].join("\n");
}
function forwardOrderToWebhook(order) {
  if (!ENQUIRY_FORM_URL) return;
  fetch(ENQUIRY_FORM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  }).catch(() => {
    document.querySelector("#order-status").textContent = "WhatsApp opened. The configured webhook could not be reached from this page.";
  });
}
orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const items = selectedItems();
  const error = document.querySelector("#order-error");
  if (!items.length) {
    error.textContent = "Choose at least one product and quantity to continue.";
    orderForm.querySelector(".product-picker button")?.focus();
    return;
  }
  error.textContent = "";
  const existing = readOrders();
  const data = new FormData(orderForm);
  const order = {
    trackingCode: createTrackingCode(existing),
    timestamp: new Date().toISOString(),
    items,
    skinType: data.get("skinType") || "Not specified",
    delivery: {
      fullName: data.get("name"),
      phone: data.get("phone"),
      stateCity: data.get("city"),
      address: data.get("address"),
      notes: data.get("deliveryNotes")
    },
    status: "New"
  };
  let saved = false;
  try {
    existing.push(order);
    writeOrders(existing);
    saved = true;
  } catch {
    document.querySelector("#order-status").textContent = "This browser could not save the order locally; WhatsApp will still open.";
  }
  const whatsappUrl = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(orderWhatsAppMessage(order))}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  document.querySelector("#confirmation-code").textContent = order.trackingCode;
  document.querySelector("#order-confirmation").hidden = false;
  if (saved) document.querySelector("#order-status").textContent = "Order saved in this browser. WhatsApp is opening with the order details.";
  forwardOrderToWebhook(order);
  renderAdminOrders();
});
document.querySelector("#copy-tracking").addEventListener("click", async () => {
  const code = document.querySelector("#confirmation-code").textContent;
  try {
    await navigator.clipboard.writeText(code);
    document.querySelector("#order-status").textContent = "Tracking code copied.";
  } catch {
    document.querySelector("#order-status").textContent = `Your tracking code is ${code}.`;
  }
});

function openTracking(code = "") {
  document.querySelector("#tracking-code-input").value = code;
  document.querySelector("#tracking-result").replaceChildren();
  openDialog(trackingModal, "#tracking-code-input");
  if (code) findTrackedOrder();
}
document.querySelectorAll("[data-open-tracking]").forEach((button) => button.addEventListener("click", () => openTracking()));
function findTrackedOrder() {
  const code = document.querySelector("#tracking-code-input").value.trim().toUpperCase();
  const result = document.querySelector("#tracking-result");
  result.replaceChildren();
  if (!/^GLW-\d{4}$/.test(code)) { result.textContent = "Enter a tracking code in the format GLW-4829."; return; }
  const order = readOrders().find((item) => item.trackingCode === code);
  if (!order) { result.textContent = "No saved order matches that code in this browser."; return; }
  const title = document.createElement("h3"); title.textContent = `Order ${order.trackingCode}`; result.append(title);
  const status = document.createElement("p"); status.className = "order-status-pill"; status.textContent = `Status: ${order.status}`; result.append(status);
  const items = document.createElement("p"); items.textContent = `Items: ${order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}`; result.append(items);
  const delivery = document.createElement("p"); delivery.textContent = `Delivery to ${order.delivery.stateCity} · ${order.delivery.fullName}`; result.append(delivery);
  const live = document.createElement("a");
  live.className = "button"; live.target = "_blank"; live.rel = "noopener noreferrer";
  live.textContent = "Ask for Live Update on WhatsApp";
  live.href = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Glow Cosmetics, please share a live update for order ${order.trackingCode}.`)}`;
  result.append(live);
}
document.querySelector("#track-order-button").addEventListener("click", findTrackedOrder);
document.querySelector("#tracking-code-input").addEventListener("keydown", (event) => { if (event.key === "Enter") findTrackedOrder(); });

function renderAdminOrders() {
  const container = document.querySelector("#admin-orders");
  if (!container) return;
  container.replaceChildren();
  const query = document.querySelector("#admin-search").value.trim().toLowerCase();
  const orders = readOrders().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).filter((order) => {
    return (activeStatusFilter === "All" || order.status === activeStatusFilter) && (!query || JSON.stringify(order).toLowerCase().includes(query));
  });
  if (!orders.length) { container.textContent = "No orders saved in this browser yet."; return; }
  orders.forEach((order) => {
    const card = document.createElement("article"); card.className = "admin-order-card";
    const heading = document.createElement("div"); heading.className = "admin-order-heading";
    const code = document.createElement("strong"); code.textContent = order.trackingCode;
    const date = document.createElement("time"); date.dateTime = order.timestamp; date.textContent = new Date(order.timestamp).toLocaleString();
    const badge = document.createElement("span"); badge.className = "admin-status-badge"; badge.textContent = order.status;
    heading.append(code, date, badge); card.append(heading);
    const itemLines = document.createElement("ul"); itemLines.className = "admin-item-list";
    order.items.forEach((item) => { const line = document.createElement("li"); line.textContent = `${item.quantity} x ${item.name}`; itemLines.append(line); });
    card.append(itemLines);
    const skin = document.createElement("p"); skin.textContent = `Skin type: ${order.skinType}`; card.append(skin);
    const delivery = order.delivery || {};
    [["Name", delivery.fullName], ["Phone", delivery.phone], ["City / State", delivery.stateCity], ["Delivery Address", delivery.address], ["Delivery Notes", delivery.notes]].forEach(([label, value]) => {
      const detail = document.createElement("p"); detail.textContent = `${label}: ${value || "—"}`; card.append(detail);
    });
    const actions = document.createElement("div"); actions.className = "order-status-actions";
    ["New", "Confirmed", "Dispatched", "Delivered"].forEach((value) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = value;
      button.classList.toggle("active", order.status === value);
      button.addEventListener("click", () => {
        const current = readOrders(); const record = current.find((item) => item.trackingCode === order.trackingCode);
        if (record) { record.status = value; writeOrders(current); renderAdminOrders(); }
      });
      actions.append(button);
    });
    card.append(actions); container.append(card);
    const testLabel = document.createElement("label");
    testLabel.className = "test-entry-toggle";
    const testToggle = document.createElement("input");
    testToggle.type = "checkbox";
    testToggle.checked = Boolean(order.isTest);
    testToggle.addEventListener("change", () => {
      const current = readOrders();
      const record = current.find((item) => item.trackingCode === order.trackingCode);
      if (record) { record.isTest = testToggle.checked; writeOrders(current); renderAdminOrders(); }
    });
    testLabel.append(testToggle, document.createTextNode(" Mark as test entry"));
    card.append(testLabel);
  });
}
function openAdminGate() {
  document.querySelector("#admin-pin-input").value = "";
  document.querySelector("#admin-pin-error").textContent = "";
  openDialog(adminGateModal, "#admin-pin-input");
}
function authenticateAdmin() {
  const input = document.querySelector("#admin-pin-input");
  if (input.value !== ADMIN_PIN) { document.querySelector("#admin-pin-error").textContent = "That PIN is not correct."; input.focus(); return; }
  const accessTrigger = returnFocus;
  closeDialog(adminGateModal);
  syncStockUI(); renderAdminStock(); renderAdminOrders();
  openDialog(adminModal, ".modal-close");
  returnFocus = accessTrigger;
}
document.querySelector("#open-admin-dashboard").addEventListener("click", authenticateAdmin);
document.querySelector("#admin-pin-input").addEventListener("keydown", (event) => { if (event.key === "Enter") authenticateAdmin(); });
if (new URLSearchParams(window.location.search).has("admin")) openAdminGate();
document.querySelector("#admin-search").addEventListener("input", renderAdminOrders);
document.querySelectorAll("[data-status-filter]").forEach((button) => button.addEventListener("click", () => {
  activeStatusFilter = button.dataset.statusFilter;
  document.querySelectorAll("[data-status-filter]").forEach((filter) => filter.classList.toggle("active", filter === button));
  renderAdminOrders();
}));
document.querySelector("#clear-orders").addEventListener("click", () => {
  const orders = readOrders();
  const kept = orders.filter((order) => !order.isTest);
  const removed = orders.length - kept.length;
  if (!removed) { window.alert("No test entries are marked. Use a test-entry checkbox first."); return; }
  if (window.confirm(`Clear ${removed} marked test entr${removed === 1 ? "y" : "ies"}? Regular orders will remain.`)) {
    writeOrders(kept);
    renderAdminOrders();
  }
});

const deliveryResult = document.querySelector("#delivery-result");
function checkCity(rawCity) {
  const city = rawCity.trim();
  if (!city) { deliveryResult.textContent = "Enter a Nigerian city to check delivery."; return; }
  const benin = city.toLowerCase() === "benin" || city.toLowerCase() === "benin city";
  deliveryResult.textContent = `Yes! We deliver to ${benin ? "Benin City" : city} — 24–48 hrs nationwide dispatch; same-day pickup/delivery in Benin City.`;
}
document.querySelectorAll("[data-city]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector("#delivery-city").value = button.dataset.city;
  checkCity(button.dataset.city);
}));
document.querySelector("#check-city").addEventListener("click", () => checkCity(document.querySelector("#delivery-city").value));
document.querySelector("#delivery-city").addEventListener("keydown", (event) => { if (event.key === "Enter") checkCity(event.currentTarget.value); });

syncStockUI();
renderAdminOrders();
window.addEventListener("storage", (event) => {
  if (event.key === STOCK_KEY) syncStockUI();
  if (event.key === ORDERS_KEY) renderAdminOrders();
});
document.querySelector("#year").textContent = new Date().getFullYear();
