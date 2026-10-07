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

export async function addItem(itemData) {
  try {
    const docRef = await addDoc(itemsCollection, {
      ...itemData,
      status: "open",
      createdAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error("Failed to add item to Firestore:", error);
    throw error;
  }
}

export function listenToItems(callback) {
  const q = query(itemsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));

      callback(items);
    },
    (error) => {
      console.error("Failed to listen for items:", error);
      throw error;
    }
  );
}

export async function markResolved(id) {
  try {
    const itemRef = doc(db, "items", id);

    await updateDoc(itemRef, {
      status: "resolved"
    });
  } catch (error) {
    console.error(`Failed to mark item ${id} as resolved:`, error);
    throw error;
  }
}