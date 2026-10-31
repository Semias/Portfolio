---
title: Modelling roles without *painting yourself in*
teaser: Why RBAC is rarely the problem — and data ownership almost always is. Notes from building an identity platform shared by several applications.
excerpt: Why RBAC is rarely the problem — and data ownership almost always is.
category: Identity
date: 2026-09-12
tags: [RBAC, Multi-Tenant, TypeScript]
---

Every identity platform starts with the same question: which roles exist? It sounds harmless. It almost always leads to a model nobody wants to touch a year later.

## Roles are the surface

Roles like “admin”, “editor” or “viewer” describe what someone may do. They say nothing about _on what_. That is where the special cases begin: an editor may only edit their region, an admin only their tenant.

Pour those cases into new roles and you soon get names like `editor_region_north_readonly`. The model explodes although the actual logic barely changed.

## Model ownership first {toc="Ownership first"}

It gets more stable once you first decide who owns data — tenant, site, team — and only then define roles as bundles of capabilities within that ownership.

```ts
// Role = capabilities, scope = ownership
type Grant = {
  subject: UserId;
  role:    "editor" | "admin";
  scope:   { tenant: TenantId; site?: SiteId };
};

function can(u: User, action: Action, res: Resource) {
  return u.grants.some(g =>
    owns(g.scope, res) && ROLES[g.role].includes(action));
}
```

> The role answers the what. Ownership answers the on-what. Mix them and you pay later.

## What operations showed {toc="In operation"}

- The number of roles stayed small — new requirements were almost always new scopes.
- Audits got easier because every permission has a clear owner.
- Revocation works through the scope — remove a site, remove every right there.

## Takeaway

RBAC is a good tool as long as it doesn't have to do the data model's job. Settle ownership first, then roles — and the system stays understandable with the fifth application.
