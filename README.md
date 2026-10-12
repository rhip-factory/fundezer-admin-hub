# FundEzer Admin Portal

Build a complete, realistic, frontend-only Admin Portal for FundEzer based on the existing FundEzer product requirements.

IMPORTANT: THIS IS A PROTOTYPE.

Do NOT implement a backend, database, API, authentication service, payment integration, or real-time functionality. Use realistic local mock data/state so every screen and workflow is interactive and demonstrable.

I have limited generation credits, so make this implementation comprehensive in ONE pass. Reuse components, layouts, tables, modals, forms, badges, cards, and interaction patterns throughout the portal instead of creating unnecessary separate components.

BRAND:

I will upload the official FundEzer logo with this prompt. Extract the primary brand color(s) from the uploaded logo and use them as the foundation of the Admin Portal design system.

Do NOT guess a new brand color.

Create a professional healthcare/fintech administrative interface using:

- The extracted FundEzer brand color

- Neutral backgrounds

- High readability

- Clean sans-serif typography

- Consistent spacing

- Subtle borders

- Restrained shadows

- Accessible contrast

- Clear status colors only where appropriate

The portal should feel like a real operational product, NOT a generic AI dashboard.

==================================================

1. ADMIN PORTAL STRUCTURE

==================================================

Create a desktop-first responsive Admin Portal with a persistent LEFT SIDEBAR.

Sidebar:

FundEzer logo

Dashboard

Patients

Hospitals

Causes

Hospital Transfers

Campaigns

Donations

Audit Log

At the bottom:

Admin profile

Settings

Logout

Use icons consistently.

The active navigation item should have a clear selected state using the FundEzer brand color.

On smaller screens, make the sidebar responsive/collapsible.

Do NOT create unnecessary navigation items that are not required by the specification.

==================================================

2. DASHBOARD

==================================================

Create a realistic Admin Dashboard.

Header:

"Good morning, Admin"

"Here's what's happening across FundEzer."

Top KPI cards:

Active Patients

Active Campaigns

Active Hospitals

Total Donations

Active Causes

Recurring Donors

Pending Transfers

Campaigns Under Review

Use realistic Nigerian Naira values and realistic sample numbers.

Below the KPIs create:

A. Donation Overview

A simple interactive chart showing donation activity over time.

B. Campaign Overview

Show:

- Active

- Completed

- Under Review

- Suspended

C. Recent Donations

Table:

Donor

Campaign/Cause

Amount

Date

Status

D. Pending Actions

Examples:

- Transfer request awaiting review

- Campaign awaiting approval

- Hospital verification pending

- Cause requiring review

E. Recent Activity

Show realistic administrative activity.

All dashboard data should come from a single centralized mock-data layer so the same records can appear consistently throughout the portal.

==================================================

3. PATIENTS

==================================================

Create a Patients management page.

Header:

Patients

Search patients.

Filters:

- Status

- Hospital

- Treatment Stage

- Campaign Status

Table columns:

Patient

Patient ID

Hospital

Treatment

Campaign

Funding Progress

Treatment Status

Last Updated

Actions

Use realistic sample patients.

Statuses should include examples such as:

- Active

- Treatment in Progress

- Completed

- Awaiting Treatment

- Transferred

Clicking a patient opens a detailed patient view using a reusable detail drawer or detail page.

Patient detail should show:

Patient overview

Campaign

Current hospital

Treatment journey

Funding progress

Donation summary

Treatment updates

Hospital history

Transfer history

IMPORTANT:

Do not expose unnecessary sensitive/private patient information in the prototype. Use safe mock identities and patient references.

==================================================

4. HOSPITALS

==================================================

Create a Hospitals management page.

Table:

Hospital

Hospital ID

Location

Verification Status

Active Patients

Campaigns

Capabilities

Status

Actions

Filters:

- Verified

- Pending

- Suspended

- Active/Inactive

Hospital detail view should show:

Hospital information

Verification status

Active campaigns

Patients

Treatment capabilities

Equipment/facilities

Transfer activity

Include a "Capabilities" section.

Capabilities should include examples such as:

CT Scan

MRI

Surgery

Dialysis

Radiotherapy

Chemotherapy

Physiotherapy

ICU

Cardiology

Paediatrics

Each capability can have:

Available

Temporarily Unavailable

Not Available

Also show relevant equipment/facilities.

Use mock data only.

==================================================

5. CAUSES

==================================================

Create Cause Management.

This is important.

Admin should be able to interact with:

Create Cause

Edit Cause

Activate Cause

Deactivate Cause

Cause examples:

Cancer Care

Diabetes Care

Kidney Disease

Maternal & Child Health

Emergency Care

Surgery

Cardiovascular Care

Cause list should show:

Cause

Status

Total Donations

Funding Pool

Patients Supported

Active Campaigns

Last Updated

Actions

Create/Edit Cause should open a polished modal or drawer.

Fields:

Cause Name

Description

Image

Status

Allow image selection using a simple prototype-friendly interaction.

Do NOT implement file storage/backend.

Cause detail should show:

Cause description

Funding target

Amount raised

Funding progress

Patients supported

Active campaigns

Donation history

IMPORTANT:

Do not allow destructive deletion of causes. Use Activate/Deactivate instead.

==================================================

6. HOSPITAL TRANSFERS

==================================================

This is one of the CORE Admin workflows.

Create a complete Hospital Transfers management page.

Show transfer requests in a table.

Columns:

Transfer ID

Patient

Current Hospital

Required Service

Recommended Hospital

Urgency

Date

Status

Actions

Statuses:

Submitted

Under Review

Receiving Hospital Pending

Accepted

Patient Notified

Transfer Scheduled

Treatment Commenced

Completed

Also support:

Rejected

Cancelled

Filters:

Status

Urgency

Current Hospital

Receiving Hospital

Date

Urgency levels:

Routine

Urgent

Critical

==================================================

7. TRANSFER REVIEW WORKFLOW

==================================================

Clicking a transfer should open a detailed Transfer Review view/drawer.

Show:

Transfer Request ID

Patient

Campaign

Current Hospital

Treatment Phase

Required Service

Reason

Urgency

Funding Progress

Treatment Plan

Then show:

"Recommended Receiving Hospitals"

Display matching hospitals based on the required service using mock capability data.

Example:

Hospital A

Radiotherapy

Available

Recommended

Hospital B

Radiotherapy

Available

Hospital C

Radiotherapy

Not Available

The recommendation should be simulated from the mock data.

Admin actions:

Approve Transfer

Reject Transfer

Request More Information

Select Alternative Hospital

If approving:

Open confirmation modal:

"Approve Patient Transfer"

Allow Admin to select receiving hospital.

Then update the mock transfer status to:

"Receiving Hospital Pending"

The receiving hospital should then be able to appear as awaiting acceptance in the prototype.

IMPORTANT:

AI/automation must NEVER independently approve or execute a patient transfer.

Admin makes the final decision.

==================================================

8. RECEIVING HOSPITAL ACCEPTANCE

==================================================

Create the prototype state for a receiving hospital response.

Once Admin approves a transfer, show:

Receiving Hospital Pending

The Admin can view:

Awaiting Acceptance

If accepted:

Transfer status becomes:

Accepted

If declined:

Transfer status becomes:

Rejected

If accepted, allow Admin to move the transfer through:

Accepted

→ Patient Notified

→ Transfer Scheduled

→ Treatment Commenced

→ Completed

Use buttons/actions to demonstrate these state transitions.

No backend required.

==================================================

9. CAMPAIGNS

==================================================

Create Campaign Management.

Table:

Campaign

Patient

Hospital

Cause

Target

Raised

Progress

Status

Created

Actions

Statuses:

Draft

Under Review

Active

Completed

Suspended

Campaign detail should show:

Patient

Hospital

Cause

Funding target

Amount raised

Funding progress

Donations

Treatment stage

Treatment updates

Transfer history

Admin should be able to demonstrate appropriate status changes using mock state.

Do NOT rebuild the donor campaign experience here. This is an administrative management view.

==================================================

10. DONATIONS

==================================================

Create Donations Management.

Show:

Donation ID

Donor

Type

Campaign/Cause

Amount

Date

Payment Status

Donation Status

Support donation types:

Patient Donation

Cause Donation

Recurring Donation

Filters:

Donation Type

Status

Campaign

Cause

Date

Donation detail should show:

Donation ID

Donor

Amount

Donation type

Campaign/Cause

Date

Status

Keep patient donations and cause donations visually distinguishable.

IMPORTANT:

A Cause Donation contributes to a cause funding pool.

A Patient Donation supports a specific patient campaign.

Do not visually imply that a cause donation was directly donated to an individual patient.

==================================================

11. AUDIT LOG

==================================================

Create an Audit Log page.

Show:

Timestamp

Admin/User

Role

Action

Record

Description

Examples:

Cause Created

Cause Updated

Cause Deactivated

Transfer Submitted

Transfer Approved

Transfer Rejected

Hospital Verified

Campaign Status Changed

Donation Reviewed

Patient Transfer Accepted

Audit records should look immutable/read-only.

Add filters:

User

Action

Record Type

Date

Use realistic timestamps.

==================================================

12. GLOBAL INTERACTION SYSTEM

==================================================

This must be a FUNCTIONAL PROTOTYPE.

No backend.

Use local mock state.

Interactions should actually work:

- Navigation works

- Search works

- Filters work

- Tabs work

- Modals open/close

- Create Cause works in prototype state

- Edit Cause works

- Activate/Deactivate works

- Transfer review works

- Approve/Reject works

- Hospital selection works

- Transfer statuses update

- Campaign statuses can update where appropriate

- Dashboard numbers update when relevant

- Tables update after actions

- Toast confirmations appear after successful actions

- Cancel actions work

- Detail drawers/pages work

Use centralized mock data/state so changes are reflected across relevant screens during the session.

For example:

If a transfer is approved:

Dashboard Pending Transfers should decrease.

Transfer status should change.

Audit Log should receive a new mock event.

If a cause is deactivated:

Cause status should change in the Cause list and Cause detail.

If a transfer is accepted:

The transfer should show Accepted wherever it appears.

This makes the prototype feel real without implementing a backend.

==================================================

13. DESIGN SYSTEM

==================================================

Create a lightweight reusable design system based on the uploaded FundEzer logo.

Use:

- FundEzer brand primary color from logo

- Neutral surface/background colors

- Consistent typography scale

- 8px-based spacing system where appropriate

- Consistent border radius

- Consistent table styling

- Consistent buttons

- Consistent form fields

- Consistent badges

- Consistent modals/drawers

- Consistent cards

- Consistent status indicators

Status colors should communicate meaning:

Success

Warning

Error

Neutral

Information

Do not overuse color.

The UI should feel trustworthy and operational.

==================================================

14. UX DETAILS

==================================================

Include:

Loading states where appropriate

Empty states

Search empty state

No results state

Confirmation modals for important actions

Success toast messages

Error/validation states

Hover states

Keyboard-accessible controls

For destructive/high-impact actions such as deactivating a cause, rejecting a transfer, or suspending a campaign, require a confirmation step.

==================================================

15. RESPONSIVENESS

==================================================

Desktop:

Optimized for 1440px screens.

Tablet:

Responsive layout.

Mobile:

Usable and readable, but prioritize the desktop Admin experience because this is an operational dashboard.

Tables should become horizontally scrollable or transform appropriately on smaller screens.

==================================================

16. PROTOTYPE DATA

==================================================

Create enough realistic mock data to make the portal feel populated.

Use Nigerian context:

Currency: ₦ / NGN

Hospitals based in Nigeria

Realistic campaign amounts

Realistic dates

Realistic treatment services

Do NOT use lorem ipsum.

Use realistic names and descriptions, but do not use real patient-sensitive information.

==================================================

17. IMPORTANT SCOPE CONTROL

==================================================

DO NOT:

- Build a backend

- Build a database

- Add Supabase

- Add authentication infrastructure

- Integrate payment gateways

- Add real APIs

- Add real email/SMS

- Build unnecessary settings pages

- Build unnecessary analytics

- Build features not listed in this prompt

- Redesign the public FundEzer website

- Create excessive animations

Use mock/local state only.

The goal is a polished, highly realistic, fully clickable stakeholder prototype.

==================================================

FINAL REQUIREMENT

==================================================

Before finishing, test the complete prototype flow:

Dashboard

→ Patients

→ Hospitals

→ Causes

→ Create/Edit/Deactivate Cause

→ Hospital Transfers

→ Open Transfer

→ Review Transfer

→ Select Receiving Hospital

→ Approve

→ Receiving Hospital Pending

→ Accept

→ Patient Notified

→ Transfer Scheduled

→ Treatment Commenced

→ Completed

→ Audit Log

Also test:

Campaigns

→ Campaign Detail

Donations

→ Donation Detail

Patients

→ Patient Detail

Hospitals

→ Hospital Detail

Everything should feel like ONE coherent FundEzer Admin product.

Prioritize completeness, consistency, realistic mock data, and working interactions over unnecessary visual complexity.

Do not modify unrelated functionality.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fundezer-admin-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b03762d5-ab39-407b-99d6-47173f411b4f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
