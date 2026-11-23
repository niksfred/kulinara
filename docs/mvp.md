> Historical planning document. Kulinara is a discontinued proof of concept. See [README](../README.md) for implemented behavior, setup, limitations, and the retrospective. References below to Core Data, on-device recognition, future phases, and pricing describe the original proposal; the prototype uses SQLite and an external API.

# 🍎 Smart Kitchen App – One Page Pitch Deck

---

## **Problem**

- Households in high-income countries waste **$12–$125 per person/month** in food.

- People forget groceries in the fridge or don’t use them before expiration.

- Rising food prices make waste more costly and frustrating.

---

## **Solution**

An **iOS-first app** that helps users **save money and reduce waste**:

- 📸 Detect groceries from photos (Core ML + Vision)

- ⏰ Track expiration dates automatically

- 🔔 Push reminders before food spoils

- 🍳 Suggest recipes to use items before they expire

---

## **User Benefits**

- 💰 Save money → cut waste, lower grocery bills

- ⏳ Save time → less manual tracking

- 🥗 Eat smarter → recipe suggestions

- ✅ Peace of mind → fewer forgotten foods

- Give recommendation on how to store food

---

## **Tech Stack**

- **Frontend:** React Native & Expo

- **Backend:** Cloudflare Workers, KV/D1/R2

- **Notifications:** Apple Push Notification Service (APNs)

---

## **MVP Roadmap**

### **Phase 1: React Native app with API (external) photo processing

- Build React Native + Expo app with grocery list UI.

- Integrate external API for food classification model.

- Detect multiple grocery items from a photo.

- Store items locally in Core Data with default expiration values.

- Enable manual editing of items (name, expiration, notes).

- Schedule basic **local notifications** for expirations.

### **Phase 2: Backend & Cloud Sync**

- Deploy **Cloudflare Worker API** (auth, CRUD for groceries, user data).

- Store grocery lists in **Cloudflare D1 (SQL)** or KV.

- Add **Sign in with Apple** for authentication.

- Sync local Core Data with backend (online/offline support).

- Start preparing backend for subscription tracking.

### **Phase 3: Push Notifications**

- Connect backend with **APNs** for server-driven notifications.

- Implement **scheduled Workers** (daily cron) to scan for upcoming expirations.

- Send personalized push alerts even when the app is closed.

- Add settings for notification preferences.

### **Phase 4: Recipes & Suggestions**

- Build small **recipe database** (JSON or SQLite in backend).

- Implement matching logic: map expiring items → suggest recipes.

- Add recipe browsing UI in the app.

- Optional: allow users to favorite/save recipes.

### **Phase 5: Monetization (Subscriptions)**

- Implement **App Store subscriptions** (monthly $4.99, annual $49).

- Server-side receipt validation in Cloudflare Worker.

- Lock premium features: unlimited items, push notifications, recipes, cloud sync.

- Track subscription state and enforce in-app.

---

## **Business Model**

- **Freemium:**

  - Free: 10 items/week, manual expirations

  - Paid: unlimited tracking, push notifications, recipes, sync

- **Pricing:** $4.99/month or $49/year

**Revenue Split (per $4.99):**

- Apple: $0.75

- Backend: $0.10

- Taxes: $0.50

- **Net: $3.64/user/month**

---

## **Why Now**

- 📈 Rising food costs worldwide

- 🌍 Sustainability focus from consumers

- ☁️ Serverless tech keeps scaling costs low

---

### ✅ Tagline

**“Save money. Eat smarter. Waste less.”**
