import api from "@/axios.js";

const trackedInSession = new Set();

/**
 * Records a category visit once per browser session to avoid inflating counts.
 */
export function trackCategoryVisit(categoryId) {
  const id = Number(categoryId);
  if (!id || trackedInSession.has(id)) return;

  trackedInSession.add(id);
  api.post(`/categories/${id}/visit`).catch(() => {
    trackedInSession.delete(id);
  });
}
