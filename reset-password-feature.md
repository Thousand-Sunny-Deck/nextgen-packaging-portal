# Implementation Plan: Forgot Password & Deprecate Registration

## Overview

1. **Forgot Password Feature**: Allow users to reset their password via email
2. **Deprecate Registration**: Remove public self-registration capability

---

## Part 1: Forgot Password Feature

### Approach Options

**Option A: Use Better Auth's Built-in Password Reset (Recommended)**

- Better Auth has built-in `forgetPassword` and `resetPassword` APIs
- Requires enabling email sending in auth config
- Minimal code, leverages existing battle-tested logic
- Handles token generation, expiration, and validation automatically

**Option B: Custom Implementation**

- Create our own password reset tokens table
- Build custom token generation/validation
- More control but more code to maintain
- Risk of security issues with custom crypto

**Recommendation**: Option A - Use Better Auth's built-in support

### Implementation Steps

#### Step 1: Update Better Auth Config

**File**: `src/lib/config/auth.ts`

Add email sending configuration to Better Auth:

```typescript
emailAndPassword: {
  enabled: true,
  autoSignIn: false,
  sendResetPassword: async ({ user, url, token }, request) => {
    // Send password reset email via Resend
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: "NextGen Packaging <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset your password",
      react: PasswordResetEmail({ resetUrl: url, userName: user.name }),
    });
  },
  resetPasswordTokenExpiresIn: 3600, // 1 hour
},
```

**Note**: Don't await the email send to prevent timing attacks (Better Auth recommendation).

#### Step 2: Create Password Reset Email Template

**File**: `src/lib/resend/password-reset-template.tsx`

Follow existing template pattern from `template.tsx`:

- React Email components
- Same styling as order email
- Contains reset link button
- Company branding

#### Step 3: Create Forgot Password Page

**File**: `src/app/auth/forgot-password/page.tsx`

Design: Match login page layout (split screen with image)

- Email input only
- Submit button
- Link back to login
- Success state showing "Check your email"

#### Step 4: Create Reset Password Page

**File**: `src/app/auth/reset-password/page.tsx`

Design: Match login page layout

- Token from URL query param
- New password input
- Confirm password input
- Submit button
- Error handling for invalid/expired tokens

#### Step 5: Create Server Actions

**File**: `src/actions/auth/password-reset-action.ts`

Two actions using Better Auth's client API:

```typescript
// Request password reset - sends email
export async function requestPasswordReset(email: string) {
	const { data, error } = await authClient.requestPasswordReset({
		email,
		redirectTo: `${env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
	});
	return { data, error };
}

// Reset password with token from email link
export async function resetPassword(token: string, newPassword: string) {
	const { data, error } = await authClient.resetPassword({
		newPassword,
		token,
	});
	return { data, error };
}
```

#### Step 6: Create Zod Schemas

**File**: `src/lib/schemas/auth.ts`

Add schemas:

- `ForgotPasswordSchema` (email only)
- `ResetPasswordSchema` (password + confirmPassword)

#### Step 7: Update Login Page

**File**: `src/app/auth/login/page.tsx`

Add "Forgot password?" link below password field

---

## Part 2: Deprecate Registration

### Approach Options

**Option A: Remove Route Entirely**

- Delete `src/app/auth/register/` folder
- Update login page to remove "Register" link
- Any direct navigation to `/auth/register` returns 404

**Option B: Redirect to Login**

- Keep route but redirect to `/auth/login`
- Show toast message "Registration is disabled"

**Option C: Show Deprecation Message**

- Keep the page but show "Registration is closed" message
- Provide contact info for access requests

**Recommendation**: Option A - Clean removal (simplest, prevents confusion)

### Implementation Steps

#### Step 1: Delete Register Page

- Remove `src/app/auth/register/page.tsx`

#### Step 2: Update Login Page

**File**: `src/app/auth/login/page.tsx`

Remove the "Don't have an account? Register" link section

#### Step 3: Remove Unused Server Action

**File**: `src/actions/auth/sign-in-action.ts`

Remove or comment out `SignUpUser` function (keep for admin seeding via scripts)

Actually - keep `SignUpUser` since it's used by the seed scripts. Just remove from UI.

---

## Files to Create

1. `src/app/auth/forgot-password/page.tsx`
2. `src/app/auth/reset-password/page.tsx`
3. `src/lib/resend/password-reset-template.tsx`
4. `src/actions/auth/password-reset-action.ts`

## Files to Modify

1. `src/lib/config/auth.ts` - Add email sending config
2. `src/lib/schemas/auth.ts` - Add new schemas
3. `src/app/auth/login/page.tsx` - Add forgot password link, remove register link

## Files to Delete

1. `src/app/auth/register/page.tsx`

---

## Verification Steps

1. **Forgot Password Flow**:
   - Navigate to `/auth/login`
   - Click "Forgot password?" link
   - Enter email and submit
   - Check email inbox for reset link
   - Click link, enter new password
   - Verify login works with new password

2. **Registration Deprecation**:
   - Verify `/auth/register` returns 404
   - Verify login page has no register link
   - Verify seed scripts still work

3. **Error Cases**:
   - Invalid email on forgot password
   - Expired/invalid reset token
   - Password mismatch on reset form
