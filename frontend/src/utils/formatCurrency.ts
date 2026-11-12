export function formatCurrency(amount: number) {
  const fraction = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(amount);
}
