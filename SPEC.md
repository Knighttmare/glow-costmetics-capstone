# Glow Cosmetics Capstone Specification

**Build:** Destiny John's project ( T4y-1246 ) · November 2026 · v1

## 1. Problem & Context

Mrs. Uyi Edokpolo of Glow Cosmetics in New Benin, Benin City receives approximately 50 weekly questions about what cream to use, mainly for dark spots and dry skin. Some customers ask for bleaching creams, which the shop does not sell.

**Never Rule:** The site and assistant must never give medical advice or recommend products for skin problems. Trained staff member Grace handles all skin concerns, reactions, and allergy mentions through Enquire / Book.

## 2. Users & Main Actions

Customers in Benin City and across Nigeria can browse product categories, check nationwide delivery by city, chat with the Glow Cosmetics assistant, and submit an enquiry or booking through the Enquire / Book flow.

## 3. v1 Must-Haves

- Responsive green-and-white static website using `index.html`, `styles.css`, and vanilla `script.js`.
- Four brand images in `images/` (hero and three categories); image-generation prompts recorded in `PROMPTS.md`.
- Interactive nationwide delivery checker for Benin City and other Nigerian cities.
- Quick enquiry modal collecting name, city, enquiry type, and message; `ENQUIRY_FORM_URL` is ready for the team's shared n8n form link.
- Glow Cosmetics assistant/chat widget that answers approved shop FAQs and follows the Never Rule.

## 4. Data & Integration

The FAQ knowledge covers product authenticity, skin-concern escalation, bleaching-cream policy, nationwide delivery, ordering, and store information. Enquiry fields are name, city, enquiry type, category (optional), and note/message. These inputs are prepared for the group n8n workflow, which will route enquiries as `HOT`, `WARM`, or `CHECK` and connect to Google Sheets, Gmail, and Telegram. The n8n workflow is a planned integration; the static v1 uses the configurable form URL or a copied enquiry summary.

## 5. Success Tests

- The page loads cleanly on mobile and desktop with all four images visible.
- The delivery checker returns the expected confirmation for Benin City and other Nigerian cities.
- Enquire / Book opens the modal; customers can submit to the configured form URL or copy their enquiry summary.
- The assistant escalates skin concerns to Grace and does not recommend products.
- Project files are committed to GitHub.
