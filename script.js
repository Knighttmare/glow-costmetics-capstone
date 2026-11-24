// Set this to the team's n8n webhook URL to forward saved orders automatically.
const ENQUIRY_FORM_URL = "";
const ORDER_WHATSAPP_NUMBER = "2348030000194";
const ENQUIRY_WHATSAPP_NUMBER = "2349066985431";
const ORDERS_KEY = "glowCosmeticsOrders";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const enquiryModal = document.querySelector("#enquiry-modal");
const orderModal = document.querySelector("#order-modal");
const trackingModal = document.querySelector("#tracking-modal");
const adminModal = document.querySelector("#admin-modal");
const enquiryForm = document.querySelector("#enquiry-form");
const orderForm = document.querySelector("#order-form");
const copyStatus = document.querySelector("#copy-status");
let activeDialog = null;
let returnFocus = null;

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

function openEnquiry(category = "", enquiryType = "") {
  enquiryForm.reset();
  const title = category || "General product enquiry";
  document.querySelector("#enquiry-product-name").textContent = title;
  document.querySelector("#enquiry-note").value = category;
  if (enquiryType) document.querySelector("#enquiry-type").value = enquiryType;
  copyStatus.textContent = "";
  openDialog(enquiryModal, "#enquiry-type");
}
document.querySelectorAll("[data-open-enquiry]").forEach((button) => button.addEventListener("click", () => openEnquiry()));
document.querySelectorAll("a[data-enquiry]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  openEnquiry();
}));
document.querySelectorAll(".quick-enquire").forEach((button) => button.addEventListener("click", () => openEnquiry(button.dataset.category)));
function enquiryMessage() {
  const data = new FormData(enquiryForm);
  return [
    `Enquiry Type: ${data.get("type")}`,
    `Product / Category: ${document.querySelector("#enquiry-product-name").textContent}`,
    "Availability: Check Availability with Team",
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

function openOrder(category = "") {
  orderForm.reset();
  document.querySelector("#order-error").textContent = "";
  document.querySelector("#order-status").textContent = "";
  document.querySelector("#order-confirmation").hidden = true;
  const context = document.querySelector("#order-category-context");
  context.hidden = !category;
  context.textContent = category ? `Browsing category: ${category}` : "";
  openDialog(orderModal, ".product-picker button");
}
document.querySelectorAll("[data-open-order]").forEach((button) => button.addEventListener("click", () => openOrder(button.dataset.category || "")));
document.querySelectorAll("[data-quantity]").forEach((button) => button.addEventListener("click", () => {
  const input = button.parentElement.querySelector("input");
  input.value = Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(button.dataset.quantity)));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}));

function readOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); }
  catch { return []; }
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
    .map((input) => ({ name: input.dataset.productName, quantity: Number(input.value) }))
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
    `Delivery Notes: ${order.delivery.notes}`
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
  const orders = readOrders().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (!orders.length) { container.textContent = "No orders saved in this browser yet."; return; }
  orders.forEach((order) => {
    const card = document.createElement("article"); card.className = "admin-order-card";
    const heading = document.createElement("div"); heading.className = "admin-order-heading";
    const code = document.createElement("strong"); code.textContent = order.trackingCode;
    const date = document.createElement("time"); date.dateTime = order.timestamp; date.textContent = new Date(order.timestamp).toLocaleString();
    heading.append(code, date); card.append(heading);
    const itemLines = document.createElement("p"); itemLines.textContent = `Items: ${order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}`; card.append(itemLines);
    const customer = document.createElement("p"); customer.textContent = `${order.delivery.fullName} · ${order.delivery.phone} · ${order.delivery.stateCity}`; card.append(customer);
    const address = document.createElement("p"); address.textContent = `Address: ${order.delivery.address}. Delivery notes: ${order.delivery.notes}`; card.append(address);
    const skin = document.createElement("p"); skin.textContent = `Skin type: ${order.skinType}`; card.append(skin);
    const label = document.createElement("label"); label.textContent = "Order status ";
    const select = document.createElement("select");
    ["New", "Confirmed", "Dispatched"].forEach((value) => { const option = document.createElement("option"); option.value = value; option.textContent = value; select.append(option); });
    select.value = order.status; select.addEventListener("change", () => {
      const current = readOrders();
      const record = current.find((item) => item.trackingCode === order.trackingCode);
      if (record) { record.status = select.value; writeOrders(current); renderAdminOrders(); }
    });
    label.append(select); card.append(label); container.append(card);
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
document.querySelectorAll("[data-open-admin]").forEach((button) => button.addEventListener("click", () => {
  renderAdminOrders();
  openDialog(adminModal, ".modal-close");
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

const launcher = document.querySelector("#chat-launcher");
const chatPanel = document.querySelector("#chat-panel");
const chatMessages = document.querySelector("#chat-messages");
function setChatOpen(open) {
  chatPanel.hidden = !open;
  launcher.setAttribute("aria-expanded", String(open));
  if (open) document.querySelector("#chat-input").focus();
}
launcher.addEventListener("click", () => setChatOpen(chatPanel.hidden));
document.querySelector("#chat-close").addEventListener("click", () => setChatOpen(false));
function addMessage(text, sender) {
  const bubble = document.createElement("p");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  if (sender === "assistant" && /Grace, our trained staff member/.test(text)) {
    const action = document.createElement("button");
    action.className = "chat-grace-action";
    action.type = "button";
    action.textContent = "Quick Enquire with Grace";
    action.addEventListener("click", () => openEnquiry("", "Speak with Grace about a Skin Concern"));
    bubble.append(document.createElement("br"), action);
  }
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function assistantReply(question) {
  const q = question.toLowerCase();
  if (/dark spot|dry skin|cream for|skin concern|skin problem|reaction|allerg|rash|itch|acne|what should i use|what can i use/.test(q)) return "I can’t recommend products or give medical advice for skin concerns, reactions, or allergies. Grace, our trained staff member, handles these questions. Please use Quick Enquire and choose ‘Speak with Grace about a Skin Concern’.";
  if (/bleach|lighten/.test(q)) return "We do not sell bleaching creams or skin-lightening products. I can help with store or delivery information if you like.";
  if (/original|authentic|genuine/.test(q)) return "Yes! Glow Cosmetics offers 100% authentic skincare products.";
  if (/deliver|delivery|city|dispatch|pickup|pick up/.test(q)) return "Yes, we deliver nationwide across Nigeria. Dispatch is typically 24–48 hours; Benin City pickup and delivery are also available. Use our city checker for details.";
  if (/order|buy|payment|pay|availability/.test(q)) return "Choose products and quantities, enter your delivery details, then place the order via WhatsApp. You’ll receive a tracking code.";
  if (/hour|open|close|time|address|location|where|phone|contact/.test(q)) return "Find us at Shop 12, New Benin Market Road, New Benin, Benin City. We’re open Monday–Saturday, 8:30 AM–6:30 PM, and closed Sunday. Call or WhatsApp +234 906 698 5431.";
  return "I can help with authentic products, bleaching-cream policy, delivery, ordering, and store hours. For skin questions or reactions, Grace will help through Quick Enquire.";
}
function sendChat(text) {
  const question = text.trim();
  if (!question) return;
  addMessage(question, "visitor");
  addMessage(assistantReply(question), "assistant");
}
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  sendChat(input.value);
  input.value = "";
});
document.querySelectorAll("[data-chat]").forEach((button) => button.addEventListener("click", () => sendChat(button.dataset.chat)));

renderAdminOrders();
document.querySelector("#year").textContent = new Date().getFullYear();
