import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const itemsCollection = collection(db, "items");

// Add a new lost/found item
export async function addItem(itemData) {
  const docRef = await addDoc(itemsCollection, {
    ...itemData,
    status: "open",
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

// Listen for items in real time
export function listenToItems(callback) {
  const q = query(
    itemsCollection,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(items);
  });
}

// Mark an item as resolved
export async function markResolved(id) {
  const itemRef = doc(db, "items", id);

  await updateDoc(itemRef, {
    status: "resolved"
  });
}