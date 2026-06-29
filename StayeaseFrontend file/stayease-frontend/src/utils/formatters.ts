import { DEFAULT_PROPERTY_IMAGE } from "./constants";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getImageUrl = (images?: any[]) => {
  if (!images || images.length === 0 || !images[0].imageData) {
    return DEFAULT_PROPERTY_IMAGE;
  }
  const img = images[0];
  return img.imageData.startsWith("data:")
    ? img.imageData
    : `data:${img.fileType || "image/jpeg"};base64,${img.imageData}`;
};