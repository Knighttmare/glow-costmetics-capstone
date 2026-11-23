// Add the team's shared n8n form URL here when ready. Leave blank to copy the enquiry summary.
const ENQUIRY_FORM_URL = "";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const modal = document.querySelector("#enquiry-modal");
const enquiryForm = document.querySelector("#enquiry-form");
const copyStatus = document.querySelector("#copy-status");
let lastFocusedElement;

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("open", !open);
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }));
}

function openEnquiry(category = "") {
  lastFocusedElement = document.activeElement;
  if (category) document.querySelector("#enquiry-category").value = category;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector("#enquiry-type").focus();
}
function closeEnquiry() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}
document.querySelectorAll("[data-open-enquiry], [data-enquiry]").forEach((control) => {
  control.addEventListener("click", (event) => {
    if (control.tagName === "A") event.preventDefault();
    openEnquiry();
  });
});
document.querySelectorAll(".quick-enquire").forEach((button) => button.addEventListener("click", () => openEnquiry(button.dataset.category)));
modal.querySelector(".modal-close").addEventListener("click", closeEnquiry);
modal.addEventListener("click", (event) => { if (event.target === modal) closeEnquiry(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeEnquiry();
  if (event.key === "Tab" && !modal.hidden) {
    const focusable = [...modal.querySelectorAll("button, input, select, textarea")].filter((el) => !el.disabled);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function enquirySummary() {
  const data = new FormData(enquiryForm);
  return [
    "Glow Cosmetics Enquiry",
    `Type: ${data.get("type")}`,
    `Category: ${data.get("category") || "Not specified"}`,
    `Name: ${data.get("name")}`,
    `City: ${data.get("city")}`,
    `Note: ${data.get("note") || "None"}`
  ].join("\n");
}
document.querySelector("#copy-enquiry").addEventListener("click", async () => {
  if (!enquiryForm.reportValidity()) return;
  try {
    await navigator.clipboard.writeText(enquirySummary());
    copyStatus.textContent = "Enquiry summary copied. Paste it into your message to the team.";
  } catch {
    copyStatus.textContent = "Copy was blocked by your browser. Select and copy the details after submitting the form.";
  }
});
enquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const summary = enquirySummary();
  if (ENQUIRY_FORM_URL) {
    const target = new URL(ENQUIRY_FORM_URL, window.location.href);
    target.searchParams.set("enquiry", summary);
    window.open(target.href, "_blank", "noopener,noreferrer");
    copyStatus.textContent = "Your enquiry form is opening in a new tab.";
  } else {
    navigator.clipboard.writeText(summary).then(() => {
      copyStatus.textContent = "Your enquiry summary has been copied. Share it with the Glow team to continue.";
    }).catch(() => {
      copyStatus.textContent = "Your details are ready. Please copy your summary using the button above.";
    });
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
    action.textContent = "Enquire / Book with Grace";
    action.addEventListener("click", () => openEnquiry());
    bubble.append(document.createElement("br"), action);
  }
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function assistantReply(question) {
  const q = question.toLowerCase();
  if (/dark spot|dry skin|cream for|skin concern|skin problem|reaction|allerg|rash|itch|acne|what should i use|what can i use/.test(q)) {
    return "I can’t recommend products or give medical advice for skin concerns, reactions, or allergies. Grace, our trained staff member, handles these questions. Please use Enquire / Book and choose ‘Speak with Grace about a Skin Concern’.";
  }
  if (/bleach|lighten/.test(q)) return "We do not sell bleaching creams or skin-lightening products. I can help with store or delivery information if you like.";
  if (/original|authentic|genuine/.test(q)) return "Yes! Glow Cosmetics offers 100% authentic skincare products.";
  if (/deliver|delivery|city|dispatch|pickup|pick up/.test(q)) return "Yes, we deliver nationwide across Nigeria. Dispatch is typically 24–48 hours; Benin City pickup and delivery are also available. Use our city checker for details.";
  if (/order|buy|payment|pay|availability/.test(q)) return "Choose items or enquire with us, confirm availability and delivery details with the team, then complete payment. Tap Enquire / Book to start.";
  if (/hour|open|close|time|address|location|where|phone|contact/.test(q)) return "Find us at Shop 12, New Benin Market Road, New Benin, Benin City. We’re open Monday–Saturday, 8:30 AM–6:30 PM, and closed Sunday. Call or WhatsApp +234 906 698 5431.";
  return "I can help with authentic products, bleaching-cream policy, delivery, ordering, and store hours. For skin questions or reactions, Grace will help through Enquire / Book.";
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

document.querySelector("#year").textContent = new Date().getFullYear();
