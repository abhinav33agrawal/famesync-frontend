# FameSync QA Testing Checklist

**Version:** 1.0  
**Date:** December 24, 2024  
**Total Test Cases:** 232  

---

## Testing Notes

### Required Test Accounts
- **Brand Account (Free Plan):** Create via signup with brand role
- **Brand Account (Pro Plan):** Upgrade via Stripe test payment
- **Influencer Account (Free Plan):** Create via signup with influencer role
- **Influencer Account (Pro Plan):** Upgrade via Stripe test payment

### Stripe Test Cards
- **Successful Payment:** 4242 4242 4242 4242
- **Declined Card:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

### Testing Environments
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Android Chrome
- Screen sizes: 320px, 768px, 1024px, 1440px

---

## Section 1: Authentication (23 Test Cases)

### 1.1 Sign Up Flow

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 1.1.1 | Navigate to signup page | Click "Get Started" or navigate to /auth | Auth page loads with signup form | ☐ | |
| 1.1.2 | Toggle between Login/Signup | Click "Sign Up" tab | Form switches to signup mode | ☐ | |
| 1.1.3 | Select Brand role | Click "Brand" role option | Brand role is selected, visual indicator shown | ☐ | |
| 1.1.4 | Select Influencer role | Click "Influencer" role option | Influencer role is selected, visual indicator shown | ☐ | |
| 1.1.5 | Submit with empty fields | Click submit with no data | Validation errors shown for all required fields | ☐ | |
| 1.1.6 | Submit with invalid email | Enter "invalid-email" | Email validation error shown | ☐ | |
| 1.1.7 | Submit with short password | Enter password less than 8 chars | Password length error shown | ☐ | |
| 1.1.8 | Submit with mismatched passwords | Enter different passwords | Password mismatch error shown | ☐ | |
| 1.1.9 | Successful Brand signup | Fill valid data, select Brand | Account created, redirected to brand setup | ☐ | |
| 1.1.10 | Successful Influencer signup | Fill valid data, select Influencer | Account created, redirected to influencer setup | ☐ | |
| 1.1.11 | Duplicate email signup | Try to register with existing email | Error message about existing account | ☐ | |

### 1.2 Email Verification

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 1.2.1 | Verification email received | Register new account | Email received within 2 minutes | ☐ | |
| 1.2.2 | Click verification link | Click link in email | Redirected to /verify-email page | ☐ | |
| 1.2.3 | Successful verification | Valid token in URL | Success message, account verified | ☐ | |
| 1.2.4 | Invalid verification token | Navigate with invalid token | Error message displayed | ☐ | |
| 1.2.5 | Expired verification token | Use old/expired token | Appropriate error message | ☐ | |

### 1.3 Login Flow

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 1.3.1 | Login with valid credentials | Enter correct email/password | Successful login, redirected to dashboard | ☐ | |
| 1.3.2 | Login with wrong password | Enter incorrect password | Error message shown | ☐ | |
| 1.3.3 | Login with non-existent email | Enter unregistered email | Error message shown | ☐ | |
| 1.3.4 | Login with unverified email | Login before verifying | Appropriate message/handling | ☐ | |

### 1.4 Forgot Password

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 1.4.1 | Navigate to forgot password | Click "Forgot password?" link | Forgot password page loads | ☐ | |
| 1.4.2 | Submit valid email | Enter registered email | Success message, email sent | ☐ | |
| 1.4.3 | Reset password | Click link in email, enter new password | Password updated successfully | ☐ | |

### 1.5 Logout

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 1.5.1 | Logout from dashboard | Click logout button | Session ended, redirected to home | ☐ | |

---

## Section 2: Influencer Role (52 Test Cases)

### 2.1 Profile Setup (First-time)

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.1.1 | Setup page loads | Login as new influencer | Setup form displayed | ☐ | |
| 2.1.2 | All fields visible | Check form | Name, bio, category, social links visible | ☐ | |
| 2.1.3 | Submit empty form | Click submit without data | Validation errors shown | ☐ | |
| 2.1.4 | Invalid social URLs | Enter invalid Instagram/TikTok URLs | URL validation errors | ☐ | |
| 2.1.5 | Valid Instagram URL | Enter valid Instagram profile URL | URL accepted | ☐ | |
| 2.1.6 | Valid TikTok URL | Enter valid TikTok profile URL | URL accepted | ☐ | |
| 2.1.7 | Valid YouTube URL | Enter valid YouTube channel URL | URL accepted | ☐ | |
| 2.1.8 | Select category | Choose from dropdown | Category selected | ☐ | |
| 2.1.9 | Enter follower counts | Enter follower numbers | Numbers accepted and saved | ☐ | |
| 2.1.10 | Successful setup | Fill all required fields | Profile created, redirected to dashboard | ☐ | |

### 2.2 Influencer Dashboard

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.2.1 | Dashboard loads | Navigate to /influencer/dashboard | Dashboard renders correctly | ☐ | |
| 2.2.2 | Stats displayed | Check stats cards | Total applications, pending, accepted shown | ☐ | |
| 2.2.3 | Recent applications | Check applications section | Recent applications listed | ☐ | |
| 2.2.4 | Subscription status | Check subscription card | Current plan displayed | ☐ | |
| 2.2.5 | Credit balance shown | Check credits display | Available credits shown | ☐ | |
| 2.2.6 | Quick actions work | Click navigation cards | Correct pages load | ☐ | |
| 2.2.7 | Empty state | New account with no data | Appropriate empty states shown | ☐ | |
| 2.2.8 | Loading state | Refresh page | Loading skeleton shown | ☐ | |

### 2.3 Browse Campaigns

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.3.1 | Campaigns page loads | Navigate to /influencer/campaigns | Campaign list displayed | ☐ | |
| 2.3.2 | Campaign cards render | Check campaign list | Cards show title, brand, budget, deadline | ☐ | |
| 2.3.3 | Filter by category | Select category filter | Only matching campaigns shown | ☐ | |
| 2.3.4 | Filter by budget range | Set min/max budget | Filtered results displayed | ☐ | |
| 2.3.5 | Search campaigns | Enter search term | Matching campaigns shown | ☐ | |
| 2.3.6 | Clear filters | Click clear/reset | All campaigns shown | ☐ | |
| 2.3.7 | Pagination works | Navigate pages | Different campaigns load | ☐ | |
| 2.3.8 | Empty state | No campaigns match filter | Empty state message shown | ☐ | |
| 2.3.9 | Premium campaigns badge | Check premium campaigns | Premium badge displayed | ☐ | |
| 2.3.10 | Loading state | Refresh page | Loading skeleton shown | ☐ | |

### 2.4 Campaign Detail (Influencer View)

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.4.1 | Detail page loads | Click on campaign | Full campaign details shown | ☐ | |
| 2.4.2 | All info displayed | Check page content | Description, requirements, deliverables visible | ☐ | |
| 2.4.3 | Apply button visible | Check CTA | Apply button shown for eligible campaigns | ☐ | |
| 2.4.4 | Apply with credits | Click apply (has credits) | Application submitted, credit deducted | ☐ | |
| 2.4.5 | Apply without credits | Click apply (no credits) | Upgrade prompt or error shown | ☐ | |
| 2.4.6 | Already applied | View applied campaign | "Already Applied" indicator shown | ☐ | |
| 2.4.7 | Expired campaign | View expired campaign | Cannot apply, expired status shown | ☐ | |
| 2.4.8 | Premium campaign (free user) | View premium campaign | Locked/upgrade prompt shown | ☐ | |
| 2.4.9 | Premium campaign (pro user) | View premium campaign | Full access, can apply | ☐ | |
| 2.4.10 | Back navigation | Click back button | Returns to campaigns list | ☐ | |

### 2.5 My Applications

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.5.1 | Applications page loads | Navigate to /influencer/applications | Applications list shown | ☐ | |
| 2.5.2 | All applications listed | Check list | All submitted applications visible | ☐ | |
| 2.5.3 | Status indicators | Check application cards | Pending/Accepted/Rejected status shown | ☐ | |
| 2.5.4 | Filter by status | Select status filter | Filtered results shown | ☐ | |
| 2.5.5 | View application details | Click on application | Application details displayed | ☐ | |
| 2.5.6 | Accepted application | Check accepted app | Deliverables section accessible | ☐ | |
| 2.5.7 | Submit deliverable | Upload deliverable for accepted app | Deliverable submitted | ☐ | |
| 2.5.8 | View deliverable status | Check submitted deliverable | Status (pending/approved/revision) shown | ☐ | |
| 2.5.9 | Empty state | No applications | Appropriate empty state message | ☐ | |
| 2.5.10 | Decline reason shown | Check rejected application | Decline reason displayed | ☐ | |

### 2.6 Influencer Profile

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 2.6.1 | Profile page loads | Navigate to /influencer/profile | Profile information displayed | ☐ | |
| 2.6.2 | Edit profile | Click edit button | Edit form opens | ☐ | |
| 2.6.3 | Update name | Change name, save | Name updated successfully | ☐ | |
| 2.6.4 | Update bio | Change bio, save | Bio updated successfully | ☐ | |
| 2.6.5 | Update social links | Change social URLs, save | Links updated | ☐ | |
| 2.6.6 | Update category | Change category, save | Category updated | ☐ | |
| 2.6.7 | Update follower counts | Change numbers, save | Counts updated | ☐ | |
| 2.6.8 | Toggle availability | Switch availability toggle | Status updated | ☐ | |
| 2.6.9 | Invalid URL validation | Enter invalid social URL | Validation error shown | ☐ | |
| 2.6.10 | Cancel edit | Click cancel during edit | Changes discarded | ☐ | |

---

## Section 3: Brand Role (62 Test Cases)

### 3.1 Profile Setup (First-time)

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.1.1 | Setup page loads | Login as new brand | Setup form displayed | ☐ | |
| 3.1.2 | All fields visible | Check form | Company name, description, website, industry visible | ☐ | |
| 3.1.3 | Submit empty form | Click submit without data | Validation errors shown | ☐ | |
| 3.1.4 | Invalid website URL | Enter invalid URL | URL validation error | ☐ | |
| 3.1.5 | Valid website URL | Enter valid website | URL accepted | ☐ | |
| 3.1.6 | Select industry | Choose from dropdown | Industry selected | ☐ | |
| 3.1.7 | Upload logo | Upload company logo | Logo uploaded and displayed | ☐ | |
| 3.1.8 | Successful setup | Fill all required fields | Profile created, redirected to dashboard | ☐ | |

### 3.2 Brand Dashboard

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.2.1 | Dashboard loads | Navigate to /brand/dashboard | Dashboard renders correctly | ☐ | |
| 3.2.2 | Stats displayed | Check stats cards | Active campaigns, applications, matches shown | ☐ | |
| 3.2.3 | Recent campaigns | Check campaigns section | Recent campaigns listed | ☐ | |
| 3.2.4 | Subscription status | Check subscription card | Current plan displayed | ☐ | |
| 3.2.5 | Credit balance shown | Check credits display | Available credits shown | ☐ | |
| 3.2.6 | Quick actions work | Click navigation cards | Correct pages load | ☐ | |
| 3.2.7 | Empty state | New account with no data | Appropriate empty states shown | ☐ | |
| 3.2.8 | Loading state | Refresh page | Loading skeleton shown | ☐ | |
| 3.2.9 | Recent applications | Check applications list | Recent applications displayed | ☐ | |
| 3.2.10 | Credit warning | Low credits | Warning displayed | ☐ | |

### 3.3 Create Campaign

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.3.1 | Create page loads | Navigate to /brand/create-campaign | Creation form displayed | ☐ | |
| 3.3.2 | All fields visible | Check form | Title, description, budget, deadline, requirements visible | ☐ | |
| 3.3.3 | Submit empty form | Click submit without data | Validation errors shown | ☐ | |
| 3.3.4 | Invalid budget | Enter negative or zero budget | Validation error | ☐ | |
| 3.3.5 | Past deadline | Select past date | Validation error | ☐ | |
| 3.3.6 | Add deliverables | Add deliverable items | Deliverables added to list | ☐ | |
| 3.3.7 | Remove deliverable | Remove deliverable item | Item removed from list | ☐ | |
| 3.3.8 | Select category | Choose campaign category | Category selected | ☐ | |
| 3.3.9 | Toggle premium | Mark as premium campaign | Premium badge shown | ☐ | |
| 3.3.10 | Successful creation | Fill all fields, submit | Campaign created, redirected | ☐ | |
| 3.3.11 | Credit deducted | Create campaign | Campaign credit deducted | ☐ | |
| 3.3.12 | No credits error | Try create with no credits | Error/upgrade prompt shown | ☐ | |

### 3.4 My Campaigns

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.4.1 | Campaigns page loads | Navigate to /brand/campaigns | Campaign list displayed | ☐ | |
| 3.4.2 | All campaigns listed | Check list | All brand's campaigns visible | ☐ | |
| 3.4.3 | Status indicators | Check campaign cards | Active/Closed status shown | ☐ | |
| 3.4.4 | Filter by status | Select status filter | Filtered results shown | ☐ | |
| 3.4.5 | Application count | Check campaign cards | Number of applications shown | ☐ | |
| 3.4.6 | View campaign | Click on campaign | Campaign detail page loads | ☐ | |
| 3.4.7 | Empty state | No campaigns created | Empty state with CTA | ☐ | |
| 3.4.8 | Loading state | Refresh page | Loading skeleton shown | ☐ | |

### 3.5 Campaign Detail (Brand View)

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.5.1 | Detail page loads | Click on campaign | Full campaign details shown | ☐ | |
| 3.5.2 | Campaign info displayed | Check page | All campaign information visible | ☐ | |
| 3.5.3 | Applications tab | Click applications tab | List of applications shown | ☐ | |
| 3.5.4 | View applicant profile | Click on applicant | Influencer profile modal opens | ☐ | |
| 3.5.5 | Accept application | Click accept button | Application accepted, notification sent | ☐ | |
| 3.5.6 | Reject application | Click reject button | Decline reason dialog opens | ☐ | |
| 3.5.7 | Submit decline reason | Select reason, submit | Application rejected with reason | ☐ | |
| 3.5.8 | Match celebration | Accept application | Celebration modal shown | ☐ | |
| 3.5.9 | Deliverables tab | Click deliverables tab | Submitted deliverables shown | ☐ | |
| 3.5.10 | Approve deliverable | Click approve | Deliverable marked approved | ☐ | |
| 3.5.11 | Request revision | Click request revision | Revision requested, influencer notified | ☐ | |
| 3.5.12 | Close campaign | Click close campaign | Campaign status updated | ☐ | |
| 3.5.13 | Edit campaign | Click edit | Edit form opens | ☐ | |
| 3.5.14 | Update campaign | Make changes, save | Campaign updated | ☐ | |
| 3.5.15 | Delete campaign | Click delete (if allowed) | Campaign deleted | ☐ | |
| 3.5.16 | Filter applications | Filter by status | Filtered results shown | ☐ | |
| 3.5.17 | Empty applications | No applications yet | Empty state message | ☐ | |
| 3.5.18 | Admin closed status | View admin-closed campaign | Appropriate status shown | ☐ | |

### 3.6 Brand Profile

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 3.6.1 | Profile page loads | Navigate to /brand/profile | Profile information displayed | ☐ | |
| 3.6.2 | Edit profile | Click edit button | Edit form opens | ☐ | |
| 3.6.3 | Update company name | Change name, save | Name updated successfully | ☐ | |
| 3.6.4 | Update description | Change description, save | Description updated | ☐ | |
| 3.6.5 | Update website | Change website URL, save | Website updated | ☐ | |
| 3.6.6 | Update industry | Change industry, save | Industry updated | ☐ | |
| 3.6.7 | Update logo | Upload new logo, save | Logo updated | ☐ | |
| 3.6.8 | Update social links | Add/change social URLs | Links updated | ☐ | |
| 3.6.9 | Invalid URL validation | Enter invalid URL | Validation error shown | ☐ | |
| 3.6.10 | Cancel edit | Click cancel during edit | Changes discarded | ☐ | |

---

## Section 4: Subscription & Credits (25 Test Cases)

### 4.1 Subscription Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 4.1.1 | Page loads | Navigate to /subscription | Subscription plans displayed | ☐ | |
| 4.1.2 | Current plan shown | Check current plan | Active plan highlighted | ☐ | |
| 4.1.3 | Plan features listed | Check plan cards | All features listed per plan | ☐ | |
| 4.1.4 | Upgrade button works | Click upgrade (free user) | Stripe checkout opens | ☐ | |
| 4.1.5 | Successful payment | Complete Stripe payment | Plan upgraded, redirected | ☐ | |
| 4.1.6 | Failed payment | Use declined card | Error message shown | ☐ | |
| 4.1.7 | Cancel subscription | Click cancel (pro user) | Confirmation dialog shown | ☐ | |
| 4.1.8 | Confirm cancellation | Confirm cancel | Subscription cancelled | ☐ | |
| 4.1.9 | Manage billing | Click manage billing | Stripe portal opens | ☐ | |
| 4.1.10 | Plan comparison | Compare plans | Differences clearly shown | ☐ | |

### 4.2 Credit System

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 4.2.1 | Credits displayed | Check header/dashboard | Current credits visible | ☐ | |
| 4.2.2 | Credit deduction (campaign) | Create campaign | Credits decreased | ☐ | |
| 4.2.3 | Credit deduction (application) | Apply to campaign | Credits decreased | ☐ | |
| 4.2.4 | Zero credits block | Try action with 0 credits | Blocked, upgrade prompt | ☐ | |
| 4.2.5 | Credit warning | Low credits | Warning notification | ☐ | |
| 4.2.6 | Pro plan credits | Upgrade to pro | More credits available | ☐ | |
| 4.2.7 | Credit refresh | Monthly reset | Credits restored | ☐ | |
| 4.2.8 | Free plan limits | Check free plan | Correct credit limit | ☐ | |
| 4.2.9 | Pro plan limits | Check pro plan | Correct credit limit | ☐ | |
| 4.2.10 | Credit history | Check subscription page | Credit usage shown | ☐ | |
| 4.2.11 | Premium campaign access | Free vs Pro access | Correct restrictions | ☐ | |
| 4.2.12 | Application limit check | Free plan application limit | Limit enforced correctly | ☐ | |
| 4.2.13 | Campaign limit check | Free plan campaign limit | Limit enforced correctly | ☐ | |
| 4.2.14 | Upgrade prompt shown | Hit limit | Upgrade prompt displayed | ☐ | |
| 4.2.15 | Credit indicator color | Low/medium/high credits | Appropriate color indicator | ☐ | |

---

## Section 5: Settings (12 Test Cases)

### 5.1 Settings Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 5.1.1 | Page loads | Navigate to /settings | Settings page displayed | ☐ | |
| 5.1.2 | Account info shown | Check account section | Email, role displayed | ☐ | |
| 5.1.3 | Change password | Enter current and new password | Password updated | ☐ | |
| 5.1.4 | Wrong current password | Enter incorrect current password | Error message shown | ☐ | |
| 5.1.5 | Password mismatch | Enter mismatched new passwords | Validation error | ☐ | |
| 5.1.6 | Email notifications toggle | Toggle email preferences | Preferences saved | ☐ | |
| 5.1.7 | Theme toggle | Switch dark/light mode | Theme changes | ☐ | |
| 5.1.8 | Delete account | Click delete account | Confirmation dialog | ☐ | |
| 5.1.9 | Confirm deletion | Confirm delete | Account deleted, logged out | ☐ | |
| 5.1.10 | Cancel deletion | Cancel delete | Dialog closes, no change | ☐ | |
| 5.1.11 | Notification settings | Adjust notification preferences | Settings saved | ☐ | |
| 5.1.12 | Privacy settings | Adjust privacy options | Settings saved | ☐ | |

---

## Section 6: Notifications (16 Test Cases)

### 6.1 In-App Notifications

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 6.1.1 | Bell icon visible | Check navbar | Notification bell displayed | ☐ | |
| 6.1.2 | Unread count | Receive notifications | Badge shows count | ☐ | |
| 6.1.3 | Dropdown opens | Click bell icon | Notifications list shown | ☐ | |
| 6.1.4 | Notifications listed | Check dropdown | All notifications visible | ☐ | |
| 6.1.5 | Mark as read | Click notification | Marked as read | ☐ | |
| 6.1.6 | Mark all read | Click "Mark all read" | All notifications read | ☐ | |
| 6.1.7 | Empty state | No notifications | Empty message shown | ☐ | |
| 6.1.8 | New notification | Trigger action | Notification appears | ☐ | |
| 6.1.9 | Click notification | Click on notification | Navigate to relevant page | ☐ | |
| 6.1.10 | Real-time updates | Wait for notification | Appears without refresh | ☐ | |

### 6.2 Email Notifications

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 6.2.1 | Application received | Influencer applies | Brand receives email | ☐ | |
| 6.2.2 | Application accepted | Brand accepts | Influencer receives email | ☐ | |
| 6.2.3 | Application rejected | Brand rejects | Influencer receives email with reason | ☐ | |
| 6.2.4 | Payment failed | Payment fails | User receives email | ☐ | |
| 6.2.5 | Subscription upgraded | Upgrade plan | Confirmation email sent | ☐ | |
| 6.2.6 | Subscription cancelled | Cancel plan | Confirmation email sent | ☐ | |

---

## Section 7: Public Pages (17 Test Cases)

### 7.1 Home Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 7.1.1 | Page loads | Navigate to / | Home page displayed | ☐ | |
| 7.1.2 | Hero section | Check hero | Headline, CTA visible | ☐ | |
| 7.1.3 | Features section | Scroll to features | All features displayed | ☐ | |
| 7.1.4 | CTA buttons work | Click "Get Started" | Navigates to auth | ☐ | |
| 7.1.5 | Responsive design | Check mobile view | Properly responsive | ☐ | |

### 7.2 Pricing Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 7.2.1 | Page loads | Navigate to /pricing | Pricing page displayed | ☐ | |
| 7.2.2 | Plans displayed | Check plans | All plans with features | ☐ | |
| 7.2.3 | CTA buttons | Click plan CTA | Navigates correctly | ☐ | |

### 7.3 About Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 7.3.1 | Page loads | Navigate to /about | About page displayed | ☐ | |
| 7.3.2 | Content visible | Check page | All content rendered | ☐ | |

### 7.4 Contact Page

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 7.4.1 | Page loads | Navigate to /contact | Contact page displayed | ☐ | |
| 7.4.2 | Form visible | Check form | All fields present | ☐ | |
| 7.4.3 | Submit form | Fill and submit | Success message | ☐ | |
| 7.4.4 | Validation | Submit empty | Errors shown | ☐ | |

### 7.5 Legal Pages

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 7.5.1 | Terms page | Navigate to /terms | Terms displayed | ☐ | |
| 7.5.2 | Privacy page | Navigate to /privacy | Privacy policy displayed | ☐ | |

---

## Section 8: Access Control & Security (10 Test Cases)

### 8.1 Route Protection

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 8.1.1 | Unauthenticated access | Visit /dashboard without login | Redirected to auth | ☐ | |
| 8.1.2 | Brand accessing influencer routes | Brand visits /influencer/dashboard | Redirected or error | ☐ | |
| 8.1.3 | Influencer accessing brand routes | Influencer visits /brand/dashboard | Redirected or error | ☐ | |
| 8.1.4 | Authenticated accessing auth | Logged in user visits /auth | Redirected to dashboard | ☐ | |
| 8.1.5 | Deep link protection | Direct URL to protected route | Appropriate handling | ☐ | |

### 8.2 API Security

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 8.2.1 | Expired token | Use expired JWT | Logged out, redirected | ☐ | |
| 8.2.2 | Invalid token | Use invalid JWT | Error, redirected | ☐ | |
| 8.2.3 | Cross-user access | Try accessing other user's data | Access denied | ☐ | |
| 8.2.4 | CORS headers | Check API responses | Proper CORS headers | ☐ | |
| 8.2.5 | Rate limiting | Make many requests | Rate limit enforced | ☐ | |

---

## Section 9: Responsiveness & UX (10 Test Cases)

### 9.1 Mobile Responsiveness

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 9.1.1 | Mobile navigation | Check on mobile | Hamburger menu works | ☐ | |
| 9.1.2 | Mobile forms | Check forms | Properly sized inputs | ☐ | |
| 9.1.3 | Mobile tables | Check data tables | Horizontally scrollable | ☐ | |
| 9.1.4 | Touch targets | Check buttons | Min 44px touch targets | ☐ | |

### 9.2 Loading States

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 9.2.1 | Page loading | Navigate to pages | Loading skeleton shown | ☐ | |
| 9.2.2 | Button loading | Submit forms | Loading spinner on button | ☐ | |
| 9.2.3 | Data loading | Fetch data | Loading indicators | ☐ | |

### 9.3 Error States

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 9.3.1 | 404 page | Visit invalid URL | 404 page displayed | ☐ | |
| 9.3.2 | Network error | Disconnect network | Error message shown | ☐ | |
| 9.3.3 | API error | Trigger API error | User-friendly error | ☐ | |

---

## Section 10: Toast Notifications & Feedback (5 Test Cases)

### 10.1 User Feedback

| # | Test Case | Steps | Expected Result | Status | Notes |
|---|-----------|-------|-----------------|--------|-------|
| 10.1.1 | Success toast | Complete action | Green success toast | ☐ | |
| 10.1.2 | Error toast | Trigger error | Red error toast | ☐ | |
| 10.1.3 | Info toast | Trigger info action | Info toast shown | ☐ | |
| 10.1.4 | Toast dismissal | Wait or click X | Toast dismisses | ☐ | |
| 10.1.5 | Multiple toasts | Trigger multiple | Stack properly | ☐ | |

---

## Summary

| Section | Test Cases | Passed | Failed | Skipped |
|---------|------------|--------|--------|---------|
| 1. Authentication | 23 | | | |
| 2. Influencer Role | 52 | | | |
| 3. Brand Role | 62 | | | |
| 4. Subscription & Credits | 25 | | | |
| 5. Settings | 12 | | | |
| 6. Notifications | 16 | | | |
| 7. Public Pages | 17 | | | |
| 8. Access Control & Security | 10 | | | |
| 9. Responsiveness & UX | 10 | | | |
| 10. Toast Notifications | 5 | | | |
| **TOTAL** | **232** | | | |

---

## Sign-off

**QA Tester Name:** ________________________________

**Test Date:** ________________________________

**Environment:** ________________________________

**Browser/Device:** ________________________________

**Overall Status:** ☐ Pass  ☐ Fail  ☐ Conditional Pass

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

*Document generated for FameSync QA Testing*
