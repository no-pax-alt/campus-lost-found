const CLOUDINARY_CLOUD_NAME = "modw5gqd";
const CLOUDINARY_UPLOAD_PRESET = "campus_lost_and_found";

export async function uploadImage(file) {
  if (!file) {
    throw new Error("Choose an image to upload.");
  }

  if (typeof file.type !== "string" || !file.type.startsWith("image/")) {
    throw new Error("The selected file is not an image.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );
  } catch (error) {
    throw new Error(
      `Could not connect to Cloudinary: ${error instanceof Error ? error.message : "Please check your connection."}`
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "Cloudinary returned an unreadable response."
        : `Cloudinary upload failed (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    const message =
      result && typeof result === "object" && result.error?.message;
    throw new Error(
      typeof message === "string" && message
        ? `Image upload failed: ${message}`
        : `Image upload failed (HTTP ${response.status}).`
    );
  }

  if (!result || typeof result.secure_url !== "string" || !result.secure_url) {
    throw new Error("Cloudinary did not return a secure image URL.");
  }

  return result.secure_url;
}
