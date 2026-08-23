import Decimal from "decimal.js";

export type CostMode = "average" | "total";

export type PositionInputRow = {
  quantity: string;
  cost: string;
  costMode: CostMode;
};

export type PositionPreview = {
  totalQuantity: string;
  totalOpenCost: string;
  averageCost: string;
};

const POSITIVE_DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;
const UiDecimal = Decimal.clone({
  precision: 80,
  rounding: Decimal.ROUND_HALF_UP,
});

export function isPositiveDecimalInput(value: string): boolean {
  const normalized = value.trim();
  if (!POSITIVE_DECIMAL_PATTERN.test(normalized)) {
    return false;
  }

  return new UiDecimal(normalized).greaterThan(0);
}

export function isNonNegativeDecimalInput(value: string): boolean {
  const normalized = value.trim();
  if (!POSITIVE_DECIMAL_PATTERN.test(normalized)) {
    return false;
  }

  return new UiDecimal(normalized).greaterThanOrEqualTo(0);
}

export function calculatePositionPreview(
  rows: readonly PositionInputRow[],
): PositionPreview | null {
  if (
    rows.length === 0 ||
    rows.some(
      (row) =>
        !isPositiveDecimalInput(row.quantity) ||
        !isNonNegativeDecimalInput(row.cost),
    )
  ) {
    return null;
  }

  let totalQuantity = new UiDecimal(0);
  let totalOpenCost = new UiDecimal(0);

  for (const row of rows) {
    const quantity = new UiDecimal(row.quantity.trim());
    const cost = new UiDecimal(row.cost.trim());

    totalQuantity = totalQuantity.plus(quantity);
    totalOpenCost = totalOpenCost.plus(
      row.costMode === "average" ? quantity.times(cost) : cost,
    );
  }

  return {
    totalQuantity: totalQuantity.toString(),
    totalOpenCost: totalOpenCost.toString(),
    averageCost: totalOpenCost.dividedBy(totalQuantity).toString(),
  };
}

function groupIntegerDigits(value: string): string {
  const [integer = "0", decimal] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal === undefined ? grouped : `${grouped}.${decimal}`;
}

export function formatQuantity(value: string): string {
  const fixed = new UiDecimal(value).toFixed(8);
  return groupIntegerDigits(fixed.replace(/\.?0+$/, ""));
}

export function formatUsd(value: string): string {
  const amount = new UiDecimal(value);
  return `${amount.isNegative() ? "−" : ""}$${groupIntegerDigits(
    amount.abs().toFixed(2),
  )}`;
}

export function formatCny(value: string): string {
  const amount = new UiDecimal(value);
  return `${amount.isNegative() ? "−" : ""}¥${groupIntegerDigits(
    amount.abs().toFixed(2),
  )}`;
}
