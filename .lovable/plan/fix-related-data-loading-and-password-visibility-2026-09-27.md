# Fix related data loading and password visibility

## Scope
- Update Campaigns and Transfers to fetch linked patient, hospital, cause, service, and campaign details separately, matching the reliable Applications approach.
- Keep Donations on separate lookups, but add missing lookup error handling so failures surface correctly instead of returning incomplete data.
- Add accessible show/hide password icons inside the password fields on sign-in, account creation, and password reset.
- Preserve the current screens, workflows, permissions, and database structure.

## Technical details
- Replace database relationship-embedding queries with base-row queries plus batched ID lookups and in-memory mapping.
- Apply the same relation attachment to list results and post-mutation single-record reads.
- Use the existing icon and button components, with clear labels for screen readers.
- Verify compilation, authenticated loading of Campaigns/Transfers/Donations, and password toggle behavior in the browser.
