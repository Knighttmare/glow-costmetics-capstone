# Glow Cosmetics Capstone Specification

**Build:** Solo student project · November 2026 · v1

## 1. Problem & Context

Mrs. Uyi Edokpolo of Glow Cosmetics in New Benin, Benin City receives approximately 50 weekly questions about what cream to use, mainly for dark spots and dry skin. Some customers ask for bleaching creams, which the shop does not sell.

**Never Rule:** The site and assistant must never give medical advice or recommend products for skin problems. Trained staff member Grace handles all skin concerns, reactions, and allergy mentions through Enquire / Book.

## 2. Users & Main Actions

Customers in Benin City and across Nigeria can browse products, check nationwide delivery by city, chat with the Glow Cosmetics assistant, Quick Enquire, place an order, or track an existing `GLW-XXXX` order.

## 3. v1 Must-Haves

- Responsive green-and-white static website using `index.html`, `styles.css`, and vanilla `script.js`.
- Four brand images in `images/` (hero and three categories); image-generation prompts recorded in `PROMPTS.md`.
- Interactive nationwide delivery checker for Benin City and other Nigerian cities.
- Separate Quick Enquire and Order actions on product cards; Order in the navigation/hero and Track Order as the hero's fourth action.
- Quick Enquiry view shows product summary and current `Available` / `Sold Out` status, then collects enquiry type, skin type, name, city, and note.
- Order modal supports multiple catalog items with quantities, skin type, and required delivery details.
- Order catalog: Gentle Hydrating Cleanser, Soothing Rosewater Toner, Daily Barrier Moisturiser, Shea & Ceramide Body Lotion, Vitamin C Glow Serum, and Daily SPF 50 Sunscreen; bleaching products are excluded.
- Admin stock controls toggle each item between `Available` and `Sold Out`, persist the state, disable sold-out order quantities, and show a `SOLD OUT` overlay on its storefront image.
- Order submission saves locally, generates a unique `GLW-XXXX` tracking code, and opens WhatsApp with the order summary. Optional `ENQUIRY_FORM_URL` webhook forwarding is configurable.
- Customer tracking and a detailed admin dashboard use browser-saved orders. Admin access is via `?admin` and a configurable `ADMIN_PIN` (default `2468`); no public footer admin link is shown.
- Botpress Webchat is the live assistant widget, mounted in bubble mode; its bot must follow the Never Rule and direct all skin concerns, reactions, and allergy mentions to Grace.

## 4. Data & Integration

The live assistant loads Botpress Webchat CSS/JS, fetches the configured bot's webchat config, and mounts it in bubble mode. Its knowledge and behavior must cover product authenticity, skin-concern escalation, bleaching-cream policy, nationwide delivery, ordering, and store information while following the Never Rule. Quick enquiries contain product/category, stock status, enquiry type, skin type, name, city, and note. Orders contain tracking code, timestamp, item IDs/names/quantities, skin type, full name, phone, city/state, delivery address, delivery notes, and status (`New`, `Confirmed`, `Dispatched`, or `Delivered`). Orders and stock state persist in browser `localStorage`; orders can be looked up by tracking code and may be POSTed as JSON to `ENQUIRY_FORM_URL` when configured. Placing an order opens a prefilled WhatsApp message to `+234 803 000 0194`; general enquiries use the store line. Admin search/status filters and item stock toggles are PIN-gated at the UI level; staff can mark QA orders as test entries and clear only those. The data can also feed the planned group n8n workflow for `HOT`, `WARM`, or `CHECK` routing and Google Sheets, Gmail, and Telegram connections.

The PIN is a lightweight client-side gate suitable for a static capstone demo; it is not server-side authentication.

## 5. Success Tests

- The page loads cleanly on mobile and desktop with all four images visible.
- The delivery checker returns the expected confirmation for Benin City and other Nigerian cities.
- Hero offers Quick Enquire, Order, Explore categories, and Track Order. Product cards offer Quick Enquire and Order.
- Quick Enquire shows the selected item's summary and stock status; enquiries open WhatsApp with the details.
- Admin can toggle stock; Sold Out items are stamped on their product images and unavailable in the order selector.
- Customers can choose multiple safe catalog items with quantities and must enter delivery details before ordering.
- Each order is saved locally with a unique `GLW-XXXX` tracking code and status `New`, and WhatsApp opens with the order and delivery summary.
- Orders Admin requires the configured PIN and shows searchable, status-filtered order cards with delivery details, stock controls, and status actions for `New`, `Confirmed`, `Dispatched`, and `Delivered`.
- Tracking lookup returns saved order summary and status; admin can clear marked test orders without removing regular orders.
- The assistant escalates skin concerns to Grace and does not recommend products.
- Botpress Webchat config loads and mounts in bubble mode as the page's live assistant.
- Project files are committed to GitHub.
