# Campus Lost & Found Board

## Project description

CampusFind is a student-friendly board for reporting lost and found items around campus. Students can post useful details, search the community board, and reconnect with an owner or finder.

## Problem

Lost items are often reported across disconnected chats and noticeboards, making it difficult to search by item, location, or date. CampusFind provides one focused place for these updates.

## Main features

- Lost and found item posting form
- Item title, description, category, location, date, contact, and image fields
- Search and type/category/date filter controls
- Item cards rendered into a stable browse container
- Item details modal and empty-state areas
- Toast/notification area for user feedback
- Responsive desktop and mobile layout
- Firebase Firestore data layer maintained by the backend team

## Technologies used

- HTML5
- CSS3
- Vanilla JavaScript modules
- Firebase and Firestore

## Team

This is a four-person hackathon project. Member 4 owns UI/UX, responsive frontend presentation, accessibility-focused markup, QA support, and pitch/demo documentation. Backend, Firestore, browse behavior, posting behavior, and upload behavior remain with the relevant team members.

## Run locally

From the project root, serve the files with any static HTTP server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. Firebase behavior requires the project’s configured Firebase environment.

## Firebase live deployment

Live demo: **[Add Firebase Hosting URL here]**

## Screenshots / demo

Add desktop, mobile, posting-form, and item-details screenshots here when available.

## Project structure

```text
index.html
css/style.css
js/firebase.js
js/api.js
js/app.js
js/browse.js
js/post.js
js/upload.js
firebase.json
firestore.rules
README.md
```