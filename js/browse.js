import { deleteItem, listenToItems, markResolved } from "./api.js";

const mockItems = [
  {
    id: "mock-1",
    type: "lost",
    title: "Student ID Card",
    description: "Blue student ID card with name and photo, last seen near the library entrance.",
    category: "ids and documents",
    location: "Main library",
    date: "2026-10-05",
    contactName: "Aisha Patel",
    contact: "aisha.patel@campus.edu",
    imageUrl: "",
    status: "open",
    createdAt: 1728138000000
  },
  {
    id: "mock-2",
    type: "found",
    title: "Silver Earphones",
    description: "Wireless earphones in a small black case found under a study table in the engineering block.",
    category: "accessories",
    location: "Engineering block",
    date: "2026-10-04",
    contactName: "Jordan Lee",
    contact: "jordan.lee@campus.edu",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    status: "open",
    createdAt: 1728051600000
  },
  {
    id: "mock-3",
    type: "lost",
    title: "Blue Water Bottle",
    description: "Insulated bottle with a silver lid and campus sticker on the side.",
    category: "other",
    location: "Science building",
    date: "2026-10-03",
    contactName: "Nina Gomez",
    contact: "nina.gomez@campus.edu",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    status: "resolved",
    createdAt: 1727965200000
  },
  {
    id: "mock-4",
    type: "found",
    title: "Laptop Charger",
    description: "USB-C charger with a thin grey cable found near the computer lab desk.",
    category: "electronics",
    location: "Computer lab",
    date: "2026-10-02",
    contactName: "Marcus Hill",
    contact: "marcus.hill@campus.edu",
    imageUrl: "",
    status: "open",
    createdAt: 1727878800000
  },
  {
    id: "mock-5",
    type: "lost",
    title: "Math Notebook",
    description: "Black spiral notebook with handwritten calculus notes and a blue bookmark.",
    category: "other",
    location: "Library study room 2",
    date: "2026-09-28",
    contactName: "Priya Shah",
    contact: "priya.shah@campus.edu",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    status: "open",
    createdAt: 1727480400000
  },
  {
    id: "mock-6",
    type: "found",
    title: "Silver Keyring",
    description: "Small silver keyring with three campus keys and a round tag.",
    category: "accessories",
    location: "Student center",
    date: "2026-09-27",
    contactName: "Liam Chen",
    contact: "liam.chen@campus.edu",
    imageUrl: "",
    status: "resolved",
    createdAt: 1727394000000
  },
  {
    id: "mock-7",
    type: "lost",
    title: "Scientific Calculator",
    description: "Black calculator with a cracked screen protector and a sticker from the mathematics department.",
    category: "electronics",
    location: "Lecture hall B",
    date: "2026-09-25",
    contactName: "Sara Kim",
    contact: "sara.kim@campus.edu",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    status: "open",
    createdAt: 1727221200000
  },
  {
    id: "mock-8",
    type: "found",
    title: "Red Backpack",
    description: "Red backpack with a small zip pocket and a campus festival sticker attached.",
    category: "bags",
    location: "Cafeteria",
    date: "2026-09-22",
    contactName: "Ethan Brooks",
    contact: "ethan.brooks@campus.edu",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    status: "open",
    createdAt: 1726935600000
  }
];

let allItems = [...mockItems];
let browseInitialized = false;

function getSafeText(value) {
  return typeof value === "string" ? value : "";
}

function parseDateValue(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (value && typeof value.toDate === "function") {
    const parsed = value.toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getItemSortableTimestamp(item) {
  if (typeof item?.createdAt === "number") return item.createdAt;
  const createdDate = parseDateValue(item?.createdAt);
  if (createdDate) return createdDate.getTime();
  const itemDate = parseDateValue(item?.date);
  if (itemDate) return itemDate.getTime();
  return 0;
}

function sortItems(items) {
  return [...items].sort((a, b) => getItemSortableTimestamp(b) - getItemSortableTimestamp(a));
}

function getItemDateLabel(item) {
  const parsed = parseDateValue(item?.date);
  if (!parsed) return "Unknown date";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle("error", Boolean(isError));

  if (toast._toastTimer) {
    clearTimeout(toast._toastTimer);
  }

  toast._toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2500);
}

function openItemModal(item) {
  const modal = document.getElementById("item-modal");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-description");

  if (!modal || !title || !body) {
    console.warn("Modal elements are missing from the page.");
    return;
  }

  title.textContent = getSafeText(item?.title) || "Item details";
  title.dataset.itemId = item?.id || "";
  body.replaceChildren();

  const fieldList = document.createElement("div");
  fieldList.className = "details-list";

  const rows = [
    ["Type", item?.type ? item.type.toUpperCase() : "Unknown"],
    ["Category", getSafeText(item?.category) || "Not specified"],
    ["Location", getSafeText(item?.location) || "Not specified"],
    ["Date", getItemDateLabel(item)],
    ["Contact", getSafeText(item?.contact) || "Not specified"],
    ["Status", item?.status === "resolved" ? "Resolved" : "Open"]
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "detail-row";

    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}: `;

    const valueElement = document.createElement("span");
    valueElement.textContent = value;

    row.append(labelElement, valueElement);
    fieldList.appendChild(row);
  });

  const description = document.createElement("p");
  description.className = "detail-description";
  description.textContent = getSafeText(item?.description) || "No description provided.";

  body.append(description, fieldList);

  if (item?.imageUrl) {
    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = getSafeText(item?.title) || "Item image";
    image.loading = "lazy";
    image.className = "detail-image";
    body.appendChild(image);
  }

  modal.hidden = false;
}

function closeItemModal() {
  const modal = document.getElementById("item-modal");
  if (!modal) return;
  modal.hidden = true;
}

function createItemCard(item) {
  const card = document.createElement("article");
  card.className = "item-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "item-image-wrap";

  if (item.imageUrl) {
    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = getSafeText(item?.title) || "Item photo";
    image.loading = "lazy";
    image.className = "item-image";
    imageWrap.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "item-image placeholder";
    placeholder.textContent = item.type === "lost" ? "Lost" : "Found";
    imageWrap.appendChild(placeholder);
  }

  const content = document.createElement("div");
  content.className = "item-content";

  const badgeRow = document.createElement("div");
  badgeRow.className = "item-badges";

  const typeBadge = document.createElement("span");
  typeBadge.className = `type-badge ${item.type === "lost" ? "lost" : "found"}`;
  typeBadge.textContent = item.type === "lost" ? "Lost" : "Found";

  const statusBadge = document.createElement("span");
  statusBadge.className = `status-badge ${item.status === "resolved" ? "resolved" : "open"}`;
  statusBadge.textContent = item.status === "resolved" ? "Resolved" : "Open";

  badgeRow.append(typeBadge, statusBadge);

  const title = document.createElement("h3");
  title.className = "item-title";
  title.textContent = getSafeText(item?.title) || "Untitled item";

  const meta = document.createElement("div");
  meta.className = "item-meta";

  const category = document.createElement("p");
  category.textContent = `Category: ${getSafeText(item?.category) || "Not specified"}`;

  const location = document.createElement("p");
  location.textContent = `Location: ${getSafeText(item?.location) || "Not specified"}`;

  const date = document.createElement("p");
  date.textContent = `Date: ${getItemDateLabel(item)}`;

  meta.append(category, location, date);

  const actionRow = document.createElement("div");
  actionRow.className = "item-actions";

  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.dataset.action = "details";
  detailsButton.dataset.id = item.id;
  detailsButton.textContent = "View Details";

  const resolveButton = document.createElement("button");
  resolveButton.type = "button";
  resolveButton.dataset.action = "resolve";
  resolveButton.dataset.id = item.id;
  resolveButton.textContent = item.status === "resolved" ? "Resolved" : "Mark as Resolved";
  resolveButton.disabled = item.status === "resolved";

  if (item.status === "resolved") {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = item.id;
    deleteButton.textContent = "Delete";
    actionRow.append(detailsButton, resolveButton, deleteButton);
  } else {
    actionRow.append(detailsButton, resolveButton);
  }

  content.append(badgeRow, title, meta, actionRow);
  card.append(imageWrap, content);

  return card;
}

function renderItems(items) {
  const itemsList = document.getElementById("items-list");
  const emptyState = document.getElementById("empty-state");

  if (!itemsList) {
    console.warn("Items list container is missing.");
    return;
  }

  itemsList.replaceChildren();

  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.querySelector("p")?.replaceChildren();
      const message = document.createElement("span");
      message.textContent = "No items match the current search or filters.";
      emptyState.querySelector("p")?.appendChild(message);
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  safeItems.forEach((item) => {
    itemsList.appendChild(createItemCard(item));
  });
}

function matchesDateFilter(item, fromDate, toDate) {
  if (!fromDate && !toDate) return true;

  const itemDate = parseDateValue(item?.date);
  if (!itemDate) return false;

  const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

  if (from && itemDate < from) return false;
  if (to && itemDate > to) return false;

  return true;
}

function applyFilters() {
  const searchInput = document.getElementById("search-box");
  const typeFilter = document.getElementById("filter-type");
  const categoryFilter = document.getElementById("filter-category");
  const fromInput = document.getElementById("filter-from");
  const toInput = document.getElementById("filter-to");

  const searchText = (searchInput?.value || "").trim().toLowerCase();
  const selectedType = typeFilter?.value || "";
  const selectedCategory = categoryFilter?.value || "";
  const fromDate = fromInput?.value || "";
  const toDate = toInput?.value || "";

  const filteredItems = allItems.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.category,
      item.location
    ]
      .join(" ")
      .toLowerCase();

    if (searchText && !haystack.includes(searchText)) {
      return false;
    }

    if (selectedType && item.type !== selectedType) {
      return false;
    }

    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }

    if (!matchesDateFilter(item, fromDate, toDate)) {
      return false;
    }

    return true;
  });

  renderItems(sortItems(filteredItems));
}

async function handleResolve(item) {
  if (!item || item.status === "resolved") return;

  try {
    await markResolved(item.id);

    allItems = allItems.map((currentItem) =>
      currentItem.id === item.id ? { ...currentItem, status: "resolved" } : currentItem
    );

    applyFilters();
    showToast(`Marked “${getSafeText(item.title) || "item"}” as resolved.`);
  } catch (error) {
    console.error("Failed to mark item as resolved:", error);
    showToast("Unable to mark this item as resolved.", true);
  }
}

async function handleDelete(item) {
  if (!item || item.status !== "resolved") return;
  if (!window.confirm(`Delete “${getSafeText(item.title) || "this item"}”? This cannot be undone.`)) return;

  try {
    await deleteItem(item.id);

    allItems = allItems.filter((currentItem) => currentItem.id !== item.id);

    if (document.getElementById("item-modal") && !document.getElementById("item-modal").hidden) {
      const modalTitle = document.getElementById("modal-title");
      const activeItemId = modalTitle?.dataset?.itemId;
      if (activeItemId === item.id) {
        closeItemModal();
      }
    }

    applyFilters();
    showToast(`Deleted “${getSafeText(item.title) || "item"}” from the list.`);
  } catch (error) {
    console.error("Failed to delete item:", error);
    showToast("Unable to delete this item.", true);
  }
}

export function initBrowse() {
  if (browseInitialized) {
    return;
  }

  browseInitialized = true;

  const itemsList = document.getElementById("items-list");
  if (!itemsList) {
    console.warn("Browse functionality could not start because the list container is missing.");
    return;
  }

  const controls = [
    document.getElementById("search-box"),
    document.getElementById("filter-type"),
    document.getElementById("filter-category"),
    document.getElementById("filter-from"),
    document.getElementById("filter-to")
  ].filter(Boolean);

  controls.forEach((control) => {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  const modal = document.getElementById("item-modal");
  const modalCloseButton = document.querySelector("#item-modal .modal-close");
  const modalBackdrop = document.querySelector("#item-modal [data-close-modal]");

  if (modalCloseButton) {
    modalCloseButton.addEventListener("click", closeItemModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeItemModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeItemModal();
      }
    });
  }

  itemsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    const item = allItems.find((entry) => entry.id === id);

    if (!item) return;

    if (action === "details") {
      openItemModal(item);
      return;
    }

    if (action === "resolve") {
      await handleResolve(item);
      return;
    }

    if (action === "delete") {
      await handleDelete(item);
    }
  });

  allItems = sortItems(allItems);
  renderItems(allItems);

  try {
    listenToItems((items) => {
      if (!Array.isArray(items)) {
        console.error("Firestore listener returned an invalid payload.", items);
        allItems = sortItems(mockItems);
        renderItems(allItems);
        return;
      }

      if (items.length === 0) {
        console.info("Firestore returned no items; using mock data fallback for local development.");
        allItems = sortItems(mockItems);
        renderItems(allItems);
        return;
      }

      allItems = sortItems(items);
      applyFilters();
    });
  } catch (error) {
    console.error("Firestore listener could not be started. Using mock data fallback.", error);
    allItems = sortItems(mockItems);
    renderItems(allItems);
  }
}
