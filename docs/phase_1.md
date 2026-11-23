> Historical planning document. Kulinara is a discontinued proof of concept. See [README](../README.md) for implemented behavior, setup, limitations, and the retrospective. References below to Core Data, on-device recognition, future phases, and pricing describe the original proposal; the prototype uses SQLite and an external API.

### **React Native app with API (external) photo processing

- Build React Native + Expo app with grocery list UI.

- Integrate external API for food classification model.

- Detect multiple grocery items from a photo.

- Store items locally in Core Data with default expiration values.

- Enable manual editing of items (name, expiration, notes).

- Schedule basic **local notifications** for expirations.

# React Native Grocery App with Photo-Based Item Detection

## Overview

This project is a **mobile application built with React Native and Expo** that allows users to manage a grocery list by **taking photos of groceries**. The app sends the photo to an **external food classification API**, detects multiple grocery items, and stores them locally with expiration tracking and notifications.

The primary goal is to explore:

- React Native + Expo

- External API integration for ML-based food recognition

- Local data persistence

- Basic UX for editing and managing grocery items

- Local notifications on mobile

---

## Core Features (Original Scope)

- Build **React Native + Expo** app with a grocery list UI

- Integrate **external API** for food classification model

- Detect **multiple grocery items from a single photo**

- Store items locally in **Core Data** with default expiration values

- Enable **manual editing** of items (name, expiration, notes)

- Schedule **local notifications** for expiration reminders

---

## Extended Functional Requirements

### 1. Grocery List UI

- Display a list of grocery items with:

  - Item name

  - Expiration date

  - Days remaining (derived field)

- Visually distinguish:

  - Expired items

  - Items expiring soon (e.g., within 2–3 days)

- Allow:

  - Adding items manually

  - Editing existing items

  - Deleting items

---

### 2. Photo Capture & Processing

- Use **Expo Camera** or **Image Picker** to:

  - Capture a photo using the device camera

  - Select a photo from the gallery

- Photo is sent to an **external food recognition API**:

  - In Phase 1, upload the full image directly (no resizing/normalization)

  - Direct app → external API calls (no gateway)

  - API accepts an image

  - Returns a list of detected food items (strings or labels)

- App should:

  - Handle multiple detected items from one image

  - Allow user to confirm or edit detected items before saving

---

### 3. Food Classification API Integration

- External API responsibilities:

  - Receive an image (multipart or base64)

  - Return detected food items with optional confidence scores

- App responsibilities:

  - Abstract API logic into a dedicated service layer

  - Gracefully handle:

    - Network errors

    - Invalid API responses

    - Low-confidence detections

- API keys or secrets:

  - The prototype reads a locally ignored `.env`; the key is still embedded in the client build. A distributed app would require a backend to keep it secret.

---

### 4. Local Data Storage

- Use **local persistence** to store grocery items

  - On iOS: Core Data (or an abstraction like SQLite / WatermelonDB if needed)

  - On Android: Equivalent local storage (SQLite)

- Each grocery item should include:

  - `id` (UUID)

  - `name` (string)

  - `expirationDate` (date)

  - `notes` (optional string)

  - `createdAt` (date)

  - `source` (manual | photo)

- Default expiration values:

  - Derived from a predefined mapping (e.g., milk = 7 days, apples = 14 days)

  - Fallback to a generic default if item is unknown

---

### 5. Manual Editing & Item Management

- Users can:

  - Rename detected items

  - Change expiration date

  - Add personal notes

- Editing UI:

  - Modal or separate screen

  - Simple form with validation

- Changes are persisted immediately to local storage

---

### 6. Local Notifications

- Use **Expo Notifications** to:

  - Schedule local notifications for each item

- Notification rules:

  - Notify once before expiration (e.g., 1 day before)

  - Optional same-day expiration notification

- Notifications should:

  - Be rescheduled if expiration date changes

  - Be canceled if item is deleted

---

## Non-Functional Requirements

### Architecture

- Prefer **clean separation of concerns**:

  - UI components

  - API service layer

  - Storage layer

  - Notification scheduling

- Use functional components and React Hooks

- Keep business logic out of UI components where possible

---

### Tech Stack

- **React Native**

- **Expo**

- TypeScript (preferred)

- Expo Camera / Image Picker

- Expo Notifications

- Local storage solution (SQLite / Core Data abstraction)

- External food recognition API (mockable)

---

### Error Handling & UX

- Show loading states during:

  - Photo processing

  - API requests

- User-friendly error messages for:

  - Camera permission issues

  - Network/API failures

- App must function fully **offline** except for photo classification

---

## Assumptions & Constraints

- Food classification accuracy is not guaranteed

- Users are expected to review and correct detected items

- No backend owned by this app (API is external only)

- User data never leaves the device except images sent for classification

  - Phase 1 sends full images directly to the external API for testing; no preprocessing pipeline or gateway is used

- Authentication is **out of scope**

---

## Out of Scope (Explicitly)

- Cloud sync or user accounts

- Barcode scanning

- Nutrition tracking

- Recipe suggestions

- Push notifications (remote)

---

## Deliverables Expected from Code Assistant

The code assistant should:

1. Propose a **high-level architecture**

2. Define **data models**

3. Create a **step-by-step implementation plan**

4. Generate:

    - Core screens (List, Add/Edit, Camera)

    - API service integration

    - Local storage logic

    - Notification scheduling logic

5. Use mock data or mock API where needed
