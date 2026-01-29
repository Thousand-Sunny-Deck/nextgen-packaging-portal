# Plan: Implement prepareAllOrdersData for Orders API

## Overview

Implement the `prepareAllOrdersData` function that transforms database Order objects into `Invoice[]` format for the GET `/api/orders` endpoint.

## Current State

- `fetchOrdersForUser(userId)` returns `OrderDetailsForOrderId[]` (Order with items and billingAddress)
- `prepareAllOrdersData` exists as empty stub in `src/app/api/orders/utils.ts`
- Bug in route.ts: returns undefined `orders` instead of `allOrders`, missing import

## Target Invoice Type

```typescript
type Invoice = {
	invoiceId: string;
	amount: number;
	status: "Pending" | "Processing" | "Success" | "Failed";
	date: string;
};
```

## Files to Modify

### 1. `src/app/api/orders/utils.ts`

Implement `prepareAllOrdersData` function:

```typescript
import { Invoice } from "@/components/dynamic-table/invoices/columns";
import { OrderDetailsForOrderId } from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";

const mapOrderStatusToInvoiceStatus = (
	status: OrderStatus,
): Invoice["status"] => {
	switch (status) {
		case "PENDING":
			return "Pending";
		case "PROCESSING":
		case "PDF_GENERATED":
		case "PDF_STORED":
			return "Processing";
		case "EMAIL_SENT":
			return "Success";
		case "FAILED":
			return "Failed";
		default:
			return "Pending";
	}
};

export const prepareAllOrdersData = (
	orders: OrderDetailsForOrderId[],
): Invoice[] => {
	return orders.map((order) => ({
		invoiceId: order.orderId,
		amount: order.totalOrderCost,
		status: mapOrderStatusToInvoiceStatus(order.status),
		date: order.createdAt.toISOString().split("T")[0], // "YYYY-MM-DD"
	}));
};
```

### 2. `src/app/api/orders/route.ts`

- Add import: `import { prepareAllOrdersData } from "./utils";`
- Line 104: Change `orders` to `allOrders`

## Status Mapping Logic

| OrderStatus     | Invoice Status | Meaning                     |
| --------------- | -------------- | --------------------------- |
| `PENDING`       | `"Pending"`    | Order placed, not started   |
| `PROCESSING`    | `"Processing"` | Invoice being generated     |
| `PDF_GENERATED` | `"Processing"` | PDF created, not stored yet |
| `PDF_STORED`    | `"Processing"` | PDF in S3, email not sent   |
| `EMAIL_SENT`    | `"Success"`    | Fully completed             |
| `FAILED`        | `"Failed"`     | Something went wrong        |

## Verification

1. Run `npm run dev`
2. Login and call GET `/api/orders`
3. Verify response shape matches `{ success: true, data: Invoice[] }`
