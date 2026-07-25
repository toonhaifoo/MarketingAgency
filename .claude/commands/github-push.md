---
description: Security-scan, push to GitHub, sync README/About/Pages, and publish the site via GitHub Actions
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

Run the full GitHub publish workflow for this repo, in the exact order below. If any step fails, or the security
scan finds something suspicious, **stop and report to the user instead of pushing** — no exceptions, even for
small changes.

Determine `OWNER/REPO` up front from `git remote get-url origin` (currently `toonhaifoo/MarketingAgency`) and the
project Pages URL, which for a project page is `https://<owner>.github.io/<repo>/` (i.e.
`https://toonhaifoo.github.io/MarketingAgency/`).

## 1. Security scan — do this FIRST, before staging or pushing anything

Run `git status` and `git diff` (tracked changes) and list untracked files. For every new/modified file, check for:

- Private key / cert blocks: `-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`
- Cloud credentials: AWS (`AKIA[0-9A-Z]{16}`), GCP service-account JSON (`"type": "service_account"`), Azure conn strings
- Generic secrets: `api[_-]?key`, `secret`, `token`, `password`, `passwd` assigned to a literal value (not a placeholder like `YOUR_KEY_HERE`)
- Provider-specific token prefixes: `ghp_`, `gho_`, `github_pat_`, `sk-`, `xox[baprs]-`
- `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, credential/config files that shouldn't be tracked
- Anything already listed in `.gitignore` that's about to be force-added

If anything matches, **do not stage or push it**. Report the file/line to the user and ask whether to remove it,
add it to `.gitignore`, or override. Only continue past this step once the working tree is clean of secrets.

## 2. Review what will ship

Run `git status` and `git diff --stat` to see what changed. Use this to write an accurate commit message and to
know whether README/About actually need updating (don't touch them if nothing relevant changed).

## 3. Create/update README.md

Make sure `README.md` accurately reflects the current state of the site: what it is, the file structure, key
features, how to run it locally, and how it deploys (GitHub Pages via Actions). Update it in place if it's stale
relative to the current code; leave it alone if it's already accurate.

## 4. Ensure the GitHub Pages workflow exists

Check for `.github/workflows/*.yml` that deploys to Pages. If none exists, create
`.github/workflows/deploy.yml` using `actions/checkout` → `actions/configure-pages` →
`actions/upload-pages-artifact` (path `.`) → `actions/deploy-pages`, triggered on push to `main` (plus
`workflow_dispatch`), with `permissions: contents: read, pages: write, id-token: write`. If it already exists,
leave it as-is unless it's broken.

## 5. Commit and push

Stage the relevant files (never `git add -A`/`.` blindly — add by name), commit with a concise message describing
the *why*, and push to `origin` on the current branch (`main`). Follow the repo's standard commit trailer
(`Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`).

## 6. Enable Pages + sync the repo's About section

Prefer `gh` if it's installed and authenticated (`gh auth status`). Otherwise fall back to the GitHub REST API via
`curl` using a `$GITHUB_TOKEN` env var if one is set. If neither is available, skip straight to the manual
fallback note below instead of guessing.

With `gh`:
```
gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow 2>$null   # ignore error if Pages already enabled
gh repo edit OWNER/REPO --description "<one-line description>" --homepage "https://OWNER.github.io/REPO/"
gh repo edit OWNER/REPO --add-topic <relevant-topics>
```

With `curl` + `GITHUB_TOKEN`:
```
curl -s -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/pages -d '{"build_type":"workflow"}'

curl -s -X PATCH -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO \
  -d '{"description":"<one-line description>","homepage":"https://OWNER.github.io/REPO/"}'

curl -s -X PUT -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/topics -d '{"names":["<relevant-topics>"]}'
```

If neither `gh` nor `GITHUB_TOKEN` is available, don't fabricate a call — tell the user to set the description,
topics, and homepage URL manually at `https://github.com/OWNER/REPO` (gear icon next to "About"), and give them
the exact values to paste in, including the Pages URL from step 6's homepage field.

## 7. Confirm the Pages link is live in About

The homepage field set above *is* the About section's link. After pushing, note that the Actions run needs to
finish (Actions tab → "Deploy to GitHub Pages") before `https://OWNER.github.io/REPO/` actually resolves — mention
this to the user rather than treating a fresh 404 as a failure.

## Report back

Summarize concisely: what was committed/pushed, whether README changed, whether the About section/topics/homepage
were updated (or need manual action because `gh`/token wasn't available), and the final Pages URL.
