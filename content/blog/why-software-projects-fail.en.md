---
# ENTWURF: Alle Stellen mit "TODO (Stefan)" vor der Veröffentlichung ersetzen oder löschen.
title: Why do software projects *fail*?
teaser: Most software projects don't fail because of bad code. They fail long before the first commit — and the research says so too.
excerpt: Most software projects don't fail because of bad code.
category: Projects
date: 2026-10-25
tags: [Project management, Estimation, Delivery]
---

Ask developers why a project failed and you will hear about technical debt, the wrong framework or a legacy system nobody understood. Ask managers and you will hear about missed deadlines and scope creep. Both are describing symptoms. In my experience, the cause usually sits somewhere less visible: in what was decided, assumed and left unsaid before anybody wrote a line of code.

> **TODO (Stefan):** Opening story — a project you worked on that went sideways. One or two sentences are enough: what was planned, what actually happened, when you first noticed.

## What the numbers say — and what they don't {toc="The numbers"}

The most quoted source is the Standish Group's CHAOS report. Its 2020 edition rates about 31% of the projects in its database as successful, 50% as "challenged" (late, over budget or with fewer features) and 19% as failed. Those figures travel well on conference slides, but they deserve some care: Standish does not publish its raw data, and Eveleens and Verhoef showed in _IEEE Software_ that its definition of success — hitting the original estimate — makes a project that was estimated badly look like a failure, even if it delivered exactly what the business needed.

Research with more transparent methods paints a picture that is less dramatic on average and more dangerous at the edges:

- **McKinsey and the University of Oxford** looked at more than 5,400 IT projects. Large projects with budgets above $15 million ran, on average, 45% over budget and 7% over time, and delivered 56% less value than predicted. Every additional year of planned duration increased the cost overrun by 15%.
- **Bent Flyvbjerg and Alexander Budzier** analysed 1,471 IT projects. The average cost overrun was a modest-sounding 27%. But one in six projects was a "black swan" with a cost overrun of around 200% and a schedule overrun of almost 70%.

That second finding is the one I find most useful. The problem is not that software projects are always a little late. It is that a surprisingly large share of them go catastrophically wrong — and averages hide exactly those cases.

## 1. Nobody really agreed on the problem {toc="The problem"}

The most expensive bugs I know are not in the code. They are in the requirements, or in the gap between what the business needs and what the team understood.

A well-documented example is Lidl. In 2018 the retailer stopped the introduction of a new SAP-based merchandise management system after roughly seven years and, according to press reports, around €500 million spent. Reports cite one core conflict: Lidl's processes were built around purchase prices, the standard software around retail prices. Instead of changing the process or choosing different software, the system was customised — with growing cost and declining performance. Lidl's own explanation was that the original goals "were not possible at an acceptable expense".

That is not a technology failure. It is a decision that was never really made: do we adapt to the tool, or does the tool adapt to us?

> **TODO (Stefan):** An example from your own work where the real requirement only became clear late — and what it cost.

## 2. Estimates are wishes with numbers {toc="Estimates"}

Psychologists Daniel Kahneman and Amos Tversky gave this a name in 1979: the _planning fallacy_. We estimate from the inside, based on the specific plan in front of us, and systematically underestimate everything that might go wrong. Software adds its own twist, because we are almost always building something that has not been built in exactly this form before.

Flyvbjerg's remedy is _reference class forecasting_: instead of asking "how long will our plan take?", ask "how long did comparable projects actually take?" and start from there. It is less satisfying than a detailed Gantt chart, and considerably more honest.

The other classic belongs here too. Fred Brooks wrote it down in 1975 in _The Mythical Man-Month_: "Adding manpower to a late software project makes it later." New people need onboarding, and every additional person adds communication paths. Fifty years later, the reflex to throw people at a late project is still alive.

## 3. Big batches, late feedback {toc="Big batches"}

The McKinsey figure — 15% more overrun per additional year of duration — matches my experience. The longer a project runs without real users touching real software, the more assumptions pile up untested. When feedback finally arrives, it arrives all at once and it is expensive.

The research behind _Accelerate_ and the DORA reports points the same way: teams that ship in small batches, deploy frequently and can recover quickly perform better, on speed _and_ stability. Small increments don't just reduce technical risk. They make it possible to discover early that you are building the wrong thing.

This is also why I spend time on CI/CD pipelines and staging environments even for small projects like this website. A deployment that takes minutes instead of a week changes how often you are willing to ask "is this actually right?".

> **TODO (Stefan):** Optional — a moment where short feedback cycles saved you, or where their absence hurt.

## 4. The organisation is in the code {toc="Organisation"}

In 1968 Melvin Conway observed that systems tend to mirror the communication structures of the organisations that build them. If three departments barely talk to each other, you will get three subsystems with awkward interfaces between them — no matter what the architecture diagram says.

Many project problems are therefore not solvable within the project. Unclear ownership, competing goals between departments, a sponsor who is never available: no sprint planning fixes that. The McKinsey study comes to a similar conclusion — about half of the cost overruns were attributed to strategy, stakeholder management and unclear content, not to engineering execution.

## 5. Nobody is allowed to say "stop" {toc="Saying stop"}

Every failed project I have heard about had a moment when someone knew. A developer who saw that the data model would not hold. A tester who noticed that the core workflow did not work. A status report that stayed green on the outside while it was red on the inside.

Projects rarely fail suddenly. They fail slowly, and then everyone acts surprised. What makes the difference is whether bad news can travel upwards quickly — and whether stopping or re-scoping a project is seen as a decision rather than a defeat. Money already spent is gone either way; the only question that matters is what the next euro buys.

> **TODO (Stefan):** Have you ever been the one who had to bring bad news? How was it received?

## What I take from it {toc="Takeaways"}

None of this is new. Brooks, Conway and the planning fallacy are decades old. That is almost the most interesting part: we keep failing for the same reasons, even though we know them. What helps me in practice:

- **Name the problem before the solution.** If the team cannot describe in two sentences what will be better for whom, it is too early to pick a framework.
- **Estimate from history, not from the plan.** And communicate ranges, not dates.
- **Deliver something real early.** Small increments, automated deployments, real users as soon as possible.
- **Make ownership explicit.** Who decides, who is affected, who can say no.
- **Make bad news cheap.** Status should describe reality, not hopes.

> **TODO (Stefan):** Closing thought in your own voice — what would you tell your younger self at the start of their first big project?

## Sources

- Standish Group: [CHAOS 2020: Beyond Infinity](https://www.standishgroup.com/) (report, paid). Figures as widely quoted from the report.
- J. Laurenz Eveleens, Chris Verhoef: [The rise and fall of the Chaos report figures](https://ieeexplore.ieee.org/document/5232804), _IEEE Software_ 27(1), 2010.
- Michael Bloch, Sven Blumberg, Jürgen Laartz: [Delivering large-scale IT projects on time, on budget, and on value](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/delivering-large-scale-it-projects-on-time-on-budget-and-on-value), McKinsey & Company with the University of Oxford, 2012.
- Bent Flyvbjerg, Alexander Budzier: [Why Your IT Project May Be Riskier Than You Think](https://arxiv.org/abs/1304.0265), _Harvard Business Review_, September 2011.
- Consultancy.uk: [Lidl cancels SAP introduction having sunk €500 million into it](https://www.consultancy.uk/news/18243/lidl-cancels-sap-introduction-having-sunk-500-million-into-it), 2018.
- Daniel Kahneman, Amos Tversky: _Intuitive Prediction: Biases and Corrective Procedures_, 1979 (origin of the planning fallacy).
- Frederick P. Brooks Jr.: _The Mythical Man-Month_, Addison-Wesley, 1975.
- Melvin E. Conway: [How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html), _Datamation_, 1968.
- Nicole Forsgren, Jez Humble, Gene Kim: _Accelerate_, IT Revolution, 2018; and the annual [DORA reports](https://dora.dev/research/).
