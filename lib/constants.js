export const DUBAI_AREAS = [
  "Jumeirah", "Downtown Dubai", "Dubai Marina", "JLT", "Business Bay",
  "Al Barsha", "Deira", "Bur Dubai", "Mirdif", "Palm Jumeirah",
  "DIFC", "Al Quoz", "Sports City", "Silicon Oasis", "Discovery Gardens",
  "Al Nahda", "Karama", "Satwa", "Oud Metha", "Rashidiya"
];

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const PRODUCT_CATEGORIES = [
  "Tops", "Bottoms", "Dresses", "Co-ords", "Outerwear", "Accessories"
];

// Free delivery across Dubai on orders over AED 200 (stored in fils)
export const FREE_DELIVERY_THRESHOLD = 20000;

// Format a fils amount as an AED price string, e.g. 129900 -> "د.إ 1,299"
export function formatPrice(fils) {
  const aed = fils / 100;
  const hasFils = aed % 1 !== 0;
  return `د.إ ${aed.toLocaleString('en-US', {
    minimumFractionDigits: hasFils ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
