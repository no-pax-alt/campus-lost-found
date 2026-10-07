document.addEventListener("DOMContentLoaded", async () => {
  const [{ initBrowse } = {}, { initPostForm } = {}] = await Promise.all([
    import("./browse.js").catch(() => ({})),
    import("./post.js").catch(() => ({}))
  ]);

  if (typeof initBrowse === "function") {
    initBrowse();
  }

  if (typeof initPostForm === "function") {
    initPostForm();
  }
});