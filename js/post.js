import { addItem } from "./api.js";
import { uploadImage } from "./upload.js";

const initializedForms = new WeakSet();

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle("error", isError);

  if (toast._toastTimer) {
    clearTimeout(toast._toastTimer);
  }

  toast._toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

function getFormValues(form) {
  const fields = {
    type: ["f-type", "item type"],
    title: ["f-title", "title"],
    description: ["f-description", "description"],
    category: ["f-category", "category"],
    location: ["f-location", "location"],
    date: ["f-date", "date"],
    contactName: ["f-contactName", "contact name"],
    contact: ["f-contact", "contact information"]
  };
  const values = {};

  for (const [name, [id, label]] of Object.entries(fields)) {
    const field = form.querySelector(`#${id}`);
    const value = field?.value.trim() ?? "";
    if (!value) {
      field?.focus();
      throw new Error(`Please enter or select a ${label}.`);
    }
    values[name] = value;
  }

  return values;
}

function validateImageFile(file) {
  if (!file) return null;
  if (typeof file.type !== "string" || !file.type.startsWith("image/")) {
    return "The selected file is not an image. Please choose an image file.";
  }
  return null;
}

export function initPost() {
  const form = document.getElementById("post-form");
  if (!form || initializedForms.has(form)) return;

  initializedForms.add(form);
  form.noValidate = true;

  const imageInput = form.querySelector("#f-image");
  const submitButton = form.querySelector('[type="submit"]');
  const originalButtonText = submitButton?.textContent ?? "Post item";

  imageInput?.addEventListener("change", () => {
    const error = validateImageFile(imageInput.files?.[0]);
    if (error) {
      imageInput.value = "";
      showToast(error, true);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === "true") return;

    let values;
    const imageFile = imageInput?.files?.[0] ?? null;

    try {
      values = getFormValues(form);
      const imageError = validateImageFile(imageFile);
      if (imageError) {
        imageInput?.focus();
        throw new Error(imageError);
      }
    } catch (error) {
      showToast(error.message || "Please check the form and try again.", true);
      return;
    }

    form.dataset.submitting = "true";
    form.setAttribute("aria-busy", "true");
    if (submitButton) submitButton.disabled = true;

    try {
      let imageUrl = "";
      if (imageFile) {
        if (submitButton) submitButton.textContent = "Uploading image...";
        imageUrl = await uploadImage(imageFile);
      }

      if (submitButton) submitButton.textContent = "Posting item...";
      await addItem({ ...values, imageUrl });

      form.reset();
      showToast("Your item has been posted successfully.");
    } catch (error) {
      console.error("Failed to submit lost and found item:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "We couldn't post your item. Please try again.",
        true
      );
    } finally {
      delete form.dataset.submitting;
      form.removeAttribute("aria-busy");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

export function initPostForm() {
  initPost();
}
