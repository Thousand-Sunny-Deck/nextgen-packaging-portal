/**
 * Run: npx tsx src/lib/pricing/service-fee.test.ts
 *
 * The fee is a money path with two inputs, so pin both: the flag gates it, and
 * the threshold exempts large orders.
 */
import assert from "node:assert/strict";
import {
	SERVICE_FEE_AMOUNT,
	SERVICE_FEE_THRESHOLD,
	calculateServiceFee,
} from "./service-fee";

// Unflagged customers never pay, at any size.
assert.equal(calculateServiceFee(false, 0), 0);
assert.equal(calculateServiceFee(false, 10), 0);
assert.equal(calculateServiceFee(false, 1000), 0);

// Flagged customers pay only below the threshold.
assert.equal(calculateServiceFee(true, 0), SERVICE_FEE_AMOUNT);
assert.equal(calculateServiceFee(true, 149.99), SERVICE_FEE_AMOUNT);

// Boundary: exactly at the threshold is exempt.
assert.equal(
	calculateServiceFee(true, SERVICE_FEE_THRESHOLD),
	0,
	"$150 exempt",
);
assert.equal(calculateServiceFee(true, 150.01), 0);
assert.equal(calculateServiceFee(true, 1000), 0);

// The threshold is the pre-GST subtotal of the goods, excluding the fee. An
// order of 145 stays chargeable even though 145 + fee + GST clears 150.
assert.equal(
	calculateServiceFee(true, 145),
	SERVICE_FEE_AMOUNT,
	"pre-GST base",
);

// The incident: real orders that were wrongly charged now come out exempt.
for (const subTotal of [269, 167, 246, 221.08, 250.2]) {
	assert.equal(
		calculateServiceFee(true, subTotal),
		0,
		`invoice at ${subTotal}`,
	);
}

console.log("service-fee: all assertions passed");
