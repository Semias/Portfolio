---
title: Rollen modellieren, ohne sich zu *verbauen*
teaser: Warum RBAC selten das Problem ist — und Datenbesitz fast immer. Notizen aus dem Aufbau einer Identity-Plattform für mehrere Anwendungen.
excerpt: Warum RBAC selten das Problem ist — und Datenbesitz fast immer.
category: Identity
date: 2026-09-12
tags: [RBAC, Multi-Tenant, TypeScript]
---

Am Anfang jeder Identity-Plattform steht dieselbe Frage: Welche Rollen gibt es? Die Frage wirkt harmlos. Sie führt aber fast immer zu einem Modell, das nach einem Jahr niemand mehr ändern will.

## Rollen sind die Oberfläche

Rollen wie „Admin“, „Editor“ oder „Viewer“ beschreiben, was jemand tun darf. Sie sagen aber nichts darüber, _worauf_. Genau dort beginnen die Sonderfälle: Ein Editor darf nur seine Region bearbeiten, ein Admin nur seinen Mandanten.

Wer diese Fälle in neue Rollen gießt, bekommt schnell Namen wie `editor_region_nord_readonly`. Das Modell explodiert, obwohl sich an der eigentlichen Logik wenig geändert hat.

## Besitz zuerst modellieren {toc="Besitz zuerst"}

Stabiler wird es, wenn man zuerst festlegt, wem Daten gehören — Mandant, Standort, Team — und Rollen erst danach als Bündel von Fähigkeiten innerhalb dieses Besitzes definiert.

```ts
// Rolle = Fähigkeiten, Scope = Besitz
type Grant = {
  subject: UserId;
  role: 'editor' | 'admin';
  scope: { tenant: TenantId; site?: SiteId };
};

function can(u: User, action: Action, res: Resource) {
  return u.grants.some((g) => owns(g.scope, res) && ROLES[g.role].includes(action));
}
```

> Die Rolle beantwortet das Was. Der Besitz beantwortet das Worauf. Wer beides vermischt, zahlt später.

## Was sich im Betrieb zeigt {toc="Im Betrieb"}

- Die Zahl der Rollen blieb klein — neue Anforderungen waren fast immer neue Scopes.
- Audits wurden einfacher, weil jede Berechtigung einen klaren Besitzer hat.
- Entzug funktioniert über den Scope — ein Standort weg, alle Rechte dort weg.

## Fazit

RBAC ist ein gutes Werkzeug, solange es nicht die Arbeit des Datenmodells übernehmen muss. Erst den Besitz klären, dann die Rollen — dann bleibt das System auch mit der fünften Anwendung verständlich.
