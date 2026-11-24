# Glow Cosmetics Capstone Specification

**Build:** Solo student project · November 2026 · v1

## 1. Problem & Context

Mrs. Uyi Edokpolo of Glow Cosmetics in New Benin, Benin City receives approximately 50 weekly questions about what cream to use, mainly for dark spots and dry skin. Some customers ask for bleaching creams, which the shop does not sell.

**Never Rule:** The site and assistant must never give medical advice or recommend products for skin problems. Trained staff member Grace handles all skin concerns, reactions, and allergy mentions through Enquire / Book.

## 2. Users & Main Actions

Customers in Benin City and across Nigeria can browse product categories, check nationwide delivery by city, chat with the Glow Cosmetics assistant, and submit an enquiry or booking through the Enquire / Book flow.

## 3. v1 Must-Haves

- Responsive green-and-white static website using `index.html`, `styles.css`, and vanilla `script.js`.
- Four brand images in `images/` (hero and three categories); image-generation prompts recorded in `PROMPTS.md`.
- Interactive nationwide delivery checker for Benin City and other Nigerian cities.
- Separate Quick Enquire and Order actions on product cards, plus order access from the navigation and hero.
- Quick Enquiry modal shows category and availability, then collects enquiry type, skin type, name, city, and note; product enquiry options exclude delivery quotes.
- Order modal supports multiple catalog items with quantities, skin type, and required delivery details.
- Order catalog: Gentle Hydrating Cleanser, Soothing Rosewater Toner, Daily Barrier Moisturiser, Shea & Ceramide Body Lotion, Vitamin C Glow Serum, and Daily SPF 50 Sunscreen; bleaching products are excluded.
- Order submission saves locally, generates a `GLW-XXXX` tracking code, and opens WhatsApp with the order summary. Optional `ENQUIRY_FORM_URL` webhook forwarding is configurable.
- Customer order tracking and a Staff / Admin Orders dashboard use the browser's saved order records.
- Glow Cosmetics assistant/chat widget that answers approved shop FAQs and follows the Never Rule.

## 4. Data & Integration

The FAQ knowledge covers product authenticity, skin-concern escalation, bleaching-cream policy, nationwide delivery, ordering, and store information. Quick enquiries contain category, availability, enquiry type, skin type, name, city, and note. Orders contain a tracking code, timestamp, item names and quantities, skin type, full name, phone, state/city, delivery address, delivery notes, and status (`New`, `Confirmed`, or `Dispatched`). Orders persist in browser `localStorage`, can be looked up by tracking code, and may be POSTed as JSON to `ENQUIRY_FORM_URL` when configured. Placing an order opens a prefilled WhatsApp message to `+234 803 000 0194`; general enquiries use the store line. Staff can mark QA orders as test entries and clear only those marked entries. The data can also feed the planned group n8n workflow for `HOT`, `WARM`, or `CHECK` routing and Google Sheets, Gmail, and Telegram connections.

## 5. Success Tests

- The page loads cleanly on mobile and desktop with all four images visible.
- The delivery checker returns the expected confirmation for Benin City and other Nigerian cities.
- Each category offers Quick Enquire and Order; enquiry modal shows category context and the team availability badge.
- Customers can choose multiple safe catalog items with quantities and must enter delivery details before ordering.
- Each order is saved locally with a unique `GLW-XXXX` tracking code and status `New`, and WhatsApp opens with the order and delivery summary.
- Tracking lookup returns saved order summary and status; staff can update it to `Confirmed` or `Dispatched` and clear test entries.
- The assistant escalates skin concerns to Grace and does not recommend products.
- Project files are committed to GitHub.
