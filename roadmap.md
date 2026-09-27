# Roadmap

- [x] Replace fragile Campaign and Transfer relationship loading with separate backend lookups.
- [x] Validate Donation relationship lookup failures and limit lookups to referenced records.
- [x] Add password visibility controls to sign-in, sign-up, and password reset.
- [x] Verify password visibility in the live sign-in form and confirm a clean build.
- [ ] Verify authenticated Campaigns, Transfers, and Donations screens (blocked: external Supabase sessions cannot be injected into browser tests).