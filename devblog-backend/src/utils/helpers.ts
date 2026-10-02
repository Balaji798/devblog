export const generateSlug = (title: string): string => {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now().toString().slice(-6)
  ); // Ensure uniqueness
};
