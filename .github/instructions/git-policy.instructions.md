---
applyTo: "**"
name: git-policy
package: scf-master-codecrafter
version: 1.0.0
spark: true
---

# Git Policy

- Fuori da Agent-Git, Copilot non esegue `git push`, `git merge`, `git commit`, `git rebase`.
- Sono sempre consentiti i comandi read-only: `git status`, `git diff`, `git log`, `git show`, `git branch`.
- I commit proposti devono seguire Conventional Commits.
- Ogni push richiede conferma esplicita `PUSH`.
- Ogni merge richiede conferma esplicita `MERGE`.