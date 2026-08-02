# Deployment

This app uses Server Components, ISR and route handlers, so it needs a Node runtime — a
pure static export would lose the dynamic content, the contact form and the sitemap.

Firebase offers two ways to run it. Both are configured in this repo; pick one.

| | **Hosting + web frameworks** | **App Hosting** |
| --- | --- | --- |
| Config file | `firebase.json` | `apphosting.yaml` |
| Runtime | Cloud Functions behind the Hosting CDN | Managed Cloud Run |
| Credentials | Service account or ADC | ADC injected automatically |
| Deploy trigger | `firebase deploy` | Git push, or `firebase deploy` |
| Best for | Existing Hosting projects, custom domains already set up | New projects, CI/CD from GitHub |

---

## Option A — Firebase Hosting (web frameworks)

```bash
npm install -g firebase-tools
firebase login
firebase experiments:enable webframeworks
firebase use --add                 # pick your project, give it an alias
```

Set the environment variables the build needs. The `NEXT_PUBLIC_*` values are baked in at
build time, so they must be present locally when you run the deploy:

```bash
cp .env.example .env.local
# fill it in, then:
npm run deploy                     # = npm run build && firebase deploy
```

Server-side secrets (`RECAPTCHA_SECRET_KEY`, the `FIREBASE_*` admin values) are read at
runtime by the generated Cloud Function. Set them with:

```bash
firebase functions:secrets:set RECAPTCHA_SECRET_KEY
```

The function that Hosting generates runs as the default service account, which already has
Firestore and Storage access — you generally do **not** need to ship a service-account key
to production.

---

## Option B — Firebase App Hosting

```bash
firebase login
firebase apphosting:backends:create --project <your-project>
```

Connect the GitHub repository when prompted. Then edit `apphosting.yaml` and fill in the
`NEXT_PUBLIC_*` values (they are public identifiers, safe to commit).

Create the secret:

```bash
firebase apphosting:secrets:set RECAPTCHA_SECRET_KEY
firebase apphosting:secrets:grantaccess RECAPTCHA_SECRET_KEY --backend <backend-id>
```

Every push to the tracked branch now builds and deploys. App Hosting provides Application
Default Credentials, so `src/lib/firebase/admin.ts` resolves automatically with no
service-account key at all.

---

## Rules and indexes

Rules are **not** deployed by a hosting-only deploy. Ship them explicitly:

```bash
npm run deploy:rules   # firestore:rules, firestore:indexes, storage
```

Do this **before** the first real deploy — otherwise the admin panel will fail every write
with a permission error, and `media_library` reads will be denied.

---

## Pre-launch checklist

- [ ] `npm run typecheck` and `npm run lint` are clean
- [ ] `npm run build` succeeds
- [ ] `npm run deploy:rules` has been run against the production project
- [ ] `npm run seed` has been run, or content has been entered manually
- [ ] `npm run create-admin` has created at least one `superadmin`
- [ ] `NEXT_PUBLIC_SITE_URL` is the real production origin, with no trailing slash
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true` — **only** on the production domain
- [ ] `RECAPTCHA_SECRET_KEY` is set (the contact form is otherwise unprotected)
- [ ] Logo and favicon uploaded under Website settings
- [ ] The Google Maps embed URL is set and the preview renders
- [ ] Every `example.com` placeholder in the seeded content has been replaced
- [ ] A test contact submission arrives in **Admin → Contact queries**
- [ ] `/sitemap.xml` and `/robots.txt` return what you expect on the live domain
- [ ] Submit the sitemap in Google Search Console

---

## Custom domain

Firebase console → Hosting → Add custom domain. After DNS propagates, update
`NEXT_PUBLIC_SITE_URL` to the custom domain and redeploy — canonical URLs, Open Graph tags
and the sitemap all derive from that single variable.

---

## Rollback

```bash
firebase hosting:rollback              # Option A
firebase apphosting:rollouts:list      # Option B — then roll back from the console
```

Rules roll back separately by redeploying the previous `firestore.rules` from Git history.
