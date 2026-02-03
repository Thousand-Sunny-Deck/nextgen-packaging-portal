# Checkout Page Mobile Redesign Plan

## Current State Analysis

### Layout Issues

The current checkout page uses a **side-by-side layout** that breaks on mobile/tablet:

```
Desktop Layout (current):
┌─────────────────────────────────────────────────────┐
│  CartSummary (60%)    │    OrderInfo (40%)          │
│  or BillingSelector   │    - Progress bar           │
│                       │    - Order summary          │
│                       │    - Action buttons         │
└─────────────────────────────────────────────────────┘
```

### Problem Components

| Component                      | Issue                                            |
| ------------------------------ | ------------------------------------------------ |
| `checkout-form.tsx`            | `flex justify-between` - no mobile stacking      |
| `cart-summary.tsx`             | Fixed `w-[60%]` width                            |
| `billing-address-selector.tsx` | Fixed `w-[60%]` and inner `w-2/3`                |
| `order-info.tsx`               | `w-full md:w-[42%] lg:w-[40%]` - jumps awkwardly |
| `cart-row.tsx`                 | Grid may be cramped on very small screens        |

---

## Proposed Mobile Design

### Option A: Stacked Layout with Sticky Footer (Recommended)

```
Mobile Layout:
┌──────────────────────┐
│    Progress Bar      │
├──────────────────────┤
│                      │
│    Cart Items        │
│    (scrollable)      │
│                      │
├──────────────────────┤
│    Order Summary     │
│    (collapsible)     │
├──────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  <- Sticky bottom
│  Total: $XXX  [CTA]  │
└──────────────────────┘
```

**Pros:**

- CTA always visible
- Natural scroll flow
- Familiar e-commerce pattern

**Cons:**

- Order summary takes extra tap to expand

### Option B: Step-by-Step Wizard

```
Mobile Layout:
┌──────────────────────┐
│    Step 1 of 3       │
│    ● ○ ○             │
├──────────────────────┤
│                      │
│   [Full screen       │
│    content for       │
│    current step]     │
│                      │
├──────────────────────┤
│  [Back]    [Next]    │
└──────────────────────┘
```

**Pros:**

- Focused, one thing at a time
- Less overwhelming

**Cons:**

- More taps to complete
- Can't see cart while selecting billing

---

## Implementation Plan (Option A)

### Phase 1: Core Layout Changes

#### 1.1 Update `checkout-form.tsx`

```tsx
// Change from:
<div className="w-full mt-10 flex justify-between gap-4 md:gap-6 lg:gap-8">

// To:
<div className="w-full mt-6 md:mt-10 flex flex-col lg:flex-row lg:justify-between gap-4 md:gap-6 lg:gap-8">
```

#### 1.2 Update `cart-summary.tsx`

```tsx
// Change from:
<div className="w-[60%] max-h-[600px] overflow-y-auto">

// To:
<div className="w-full lg:w-[60%] max-h-[400px] lg:max-h-[600px] overflow-y-auto">
```

#### 1.3 Update `billing-address-selector.tsx`

```tsx
// Change from:
<div className="w-[60%] h-[400px]">
  <div className="w-2/3 space-y-6">

// To:
<div className="w-full lg:w-[60%] min-h-[300px] lg:h-[400px]">
  <div className="w-full md:w-2/3 space-y-6">
```

#### 1.4 Update `order-info.tsx`

```tsx
// Change from:
<div className="w-full md:w-[42%] lg:w-[40%] border flex flex-col items-start">

// To:
<div className="w-full lg:w-[40%] border rounded-lg flex flex-col items-start
               lg:sticky lg:top-16">
```

### Phase 2: Mobile-Specific Enhancements

#### 2.1 Add Collapsible Order Summary for Mobile

Create a new component or modify `order-summary.tsx`:

```tsx
// Mobile: Collapsible summary
<details className="lg:hidden">
  <summary className="flex justify-between p-4 cursor-pointer">
    <span>Order Summary</span>
    <span className="font-bold">${totalCost}</span>
  </summary>
  {/* Summary content */}
</details>

// Desktop: Always visible
<div className="hidden lg:block">
  {/* Existing summary content */}
</div>
```

#### 2.2 Add Sticky Bottom CTA for Mobile

In `order-info.tsx`, add a mobile-specific sticky footer:

```tsx
{
	/* Mobile sticky footer */
}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-50">
	<div className="flex items-center justify-between max-w-lg mx-auto">
		<div>
			<p className="text-sm text-gray-500">Total</p>
			<p className="text-lg font-bold">${totalCost}</p>
		</div>
		<Button onClick={onAction} disabled={!canProceed}>
			{actionLabel}
		</Button>
	</div>
</div>;

{
	/* Add bottom padding to prevent content hiding behind sticky footer */
}
<div className="h-24 lg:hidden" />;
```

#### 2.3 Update `cart-row.tsx` for Small Screens

```tsx
// Change from:
<div className="w-full grid grid-cols-[1fr_auto_auto] gap-6 ...">

// To:
<div className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-6 ...">
  {/* Description */}
  <div className="flex flex-col min-w-0">
    <p className="text-sm font-medium">{description}</p>
    <p className="text-xs text-gray-500">{textUnderDescription}</p>
    {/* Show qty inline on mobile */}
    <p className="text-xs text-gray-500 sm:hidden">Qty: {quantity}</p>
  </div>

  {/* Quantity - hidden on mobile, shown in description */}
  <div className="hidden sm:block text-sm text-gray-600">
    Qty: {quantity}
  </div>

  {/* Total */}
  <div className="text-sm font-semibold text-right">${total}</div>
</div>
```

### Phase 3: Component Reordering for Mobile

On mobile, reorder components so progress bar and summary context appear first:

```tsx
// In checkout-form.tsx
return (
  <div className="w-full mt-6 md:mt-10 flex flex-col lg:flex-row lg:justify-between gap-4">
    {/* Mobile: Show OrderInfo first (progress bar context) */}
    <div className="lg:hidden">
      <MobileProgressBar steps={progressSteps} currentStep={currentStepIndex} />
    </div>

    {/* Main content area */}
    <div className="w-full lg:w-[60%]">
      {isReviewOrderState && <CartSummary cart={cart} />}
      {isBillingState && <BillingAddressSelector ... />}
    </div>

    {/* Desktop: OrderInfo sidebar */}
    <div className="hidden lg:block lg:w-[40%]">
      <OrderInfo ... />
    </div>

    {/* Mobile: Sticky bottom with collapsible summary */}
    <MobileCheckoutFooter ... />
  </div>
);
```

---

## Files to Modify

| File                                                           | Changes                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `src/components/checkout/checkout-form.tsx`                    | Add responsive flex direction, mobile component ordering |
| `src/components/checkout/cart/cart-summary.tsx`                | Responsive width classes                                 |
| `src/components/checkout/cart/cart-row.tsx`                    | Responsive grid, mobile qty display                      |
| `src/components/checkout/billing/billing-address-selector.tsx` | Responsive widths                                        |
| `src/components/checkout/order/order-info.tsx`                 | Sticky positioning, mobile footer                        |
| `src/components/checkout/order/order-summary.tsx`              | Collapsible on mobile                                    |
| `src/app/dashboard/[uuid]/order/checkout/page.tsx`             | Adjust container padding                                 |

## New Components (Optional)

| Component                    | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `mobile-checkout-footer.tsx` | Sticky bottom bar with total and CTA     |
| `collapsible-summary.tsx`    | Mobile-friendly expandable order summary |

---

## Testing Checklist

- [ ] iPhone SE (375px) - smallest common mobile
- [ ] iPhone 14 (390px) - standard mobile
- [ ] iPad Mini (768px) - tablet portrait
- [ ] iPad (1024px) - tablet landscape / small laptop
- [ ] Desktop (1280px+)

### User Flows to Test

1. **Cart Review** - Items display correctly, can see totals
2. **Billing Selection** - Can select/add address, form fields usable
3. **Order Confirmation** - All details visible, can place order
4. **Empty Cart** - Empty state displays properly
5. **Loading States** - Skeletons render correctly

---

## Estimated Effort

| Phase                         | Effort       |
| ----------------------------- | ------------ |
| Phase 1: Core Layout          | ~2 hours     |
| Phase 2: Mobile Enhancements  | ~3 hours     |
| Phase 3: Component Reordering | ~2 hours     |
| Testing & Polish              | ~1 hour      |
| **Total**                     | **~8 hours** |

---

## Notes

- The progress bar (`progress-bar.tsx`) already has some responsive styles - may just need minor tweaks
- Consider adding swipe gestures for mobile step navigation (future enhancement)
- The billing address modal should already work on mobile (uses Dialog component)
