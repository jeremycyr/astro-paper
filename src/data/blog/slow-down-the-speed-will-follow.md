---

title: "Slow Down! The Speed Will Follow"
description: "The AI tooling that we're rushing to get into the hands of developers risks bypassing the development of fundamentals that are more important than ever."
pubDatetime: 2025-07-29T12:00:00.000Z
modDatetime: null
author: Jeremy Cyr
featured: true
draft: false
tags:
  - software-development
  - ai-tooling
  - mentorship
  - learning
  - engineering-culture
canonicalURL: ""

---
I always wanted to play the piano, though I never liked the idea of lessons. Why spend months repeating ultra-simple pieces when I could just sit down and, by ear, learn something fun and impressive?

For a while, that’s exactly what I did—I'd listen to a piece, work it out note by note, and play it through until it sounded right. It worked well enough. I could play things that sounded advanced. But I wasn’t actually getting better.

Every time I tried to learn something more complex, I hit a wall. No matter how many times I practiced, I couldn’t get it right. My hands wouldn’t cooperate.

I was missing the foundational skills: the muscle memory, the posture, the theory. Scales and arpeggios. Rhythms and dynamics. Transitions and phrasing. All the things piano lessons were designed to teach—refined over centuries with purpose and structure.

Piano teachers will roll their eyes when you try to skip the basics—and with good reason. The basics work. Go rogue, and you'll hit a wall that often requires unlearning bad habits before making real forward progress.

Modern AI development tooling brings this risk front and center. The tools that we're rushing to get into the hands of our developers make it trivially easy in many circumstances to skip the fundamentals and go straight to the output.  But there are costs to jumping ahead without the base layer of understanding firmly locked down.   

## The Irresistable Call of AI Tooling

There's no doubt that the AI tools available today are doing things we couldn't have imagined a few years ago.  Scaffolding projects, answering questions, developing against complex patterns, writing tests, debugging.  In the hands of someone experienced these tools can increase the velocity of development many times over.  But as we build up the next generation of experienced engineers with access to these tools, how are they learning those ever important fundamentals if we've delegated away the execution?

The pipeline that once slowly shaped problem-solvers through repetition and refinement now risks producing operators of tools—not architects of systems.

## What We're Losing

Instead of learning through the grind of debugging and iteration, junior developers can now create impressive looking output instantly—often without fully grasping any of the implementation details.

They can ship code that works superficially, but can they explain why it works? Can they reason through edge cases, scalability, or failure modes? When things break, do they know how to trace the fault? 

Unchecked, these tools can be massive technical debt generators, layering oft misguided or unnecessary complexity with inconsistent and difficult to maintain patterns, security holes, and disjointed repetition.

You start to see the symptoms:

* Projects stall when the tooling can no longer adequately reason about the complexity, and the developer is unable to unwind it or guide it. Large parts of functionality start to regress with new features.
* Code reviews where contributors can’t explain what their code actually does, or may not have even seen or considered the code prior to the review.
* Projects that seem to make massive quick progress, but disintegrate when the rubber hits the road on non-trivial requirements.
* Systems that are either dangerously naive or bloated with abstractions and complexity not grounded to a real requirement or mitigation. 

Some of these may pass silently, charged to the Technical Debt Credit Card for later payment, while the bigger and louder issues will derail and disrupt projects outright.

## Intentional Friction 

While a seasoned engineer may have the background and knowledge base to avoid these pitfalls, early-career engineers most likely do not, and unguided or unchecked, AI tooling represents a big invitation to avoid their consideration altogether.  

Learning these fundamental principals becomes much more difficult the higher the level of abstraction. We need to both setup a development structure that encourages the building of these base layer skills, and identify and correct the risky practices before they become embedded or fail.

Twinkle-twinkle before _La Campanella_. Before pushing toward the high-powered tools, encourage early-career developers to build things the hard way. Create an environment where slow intentionality is re-enforced at the early career levels. Help them wrestle with error messages, trace bugs by hand, write code from scratch. Then, phase in AI deliberately while educating about the risks and rewards:

* Start with basic autocomplete and Q&A tools.
* Advance to cut-and-paste snippets that require understanding and adaptation.
* Move to integrated assistants that offer suggestions—but still require human steering.
* Graduate to agentic systems only once foundational judgment is already in place.

All along, have conversations about justification. Ask: Why this approach? What trade-offs did you consider? What breaks if your assumptions are wrong?  The feedback loop is especially important, as much of this tooling can create output that may successfully produce the desired outcome superficially, with significant hidden costs both to the codebase and the developer's level of understanding.  

As leaders, we need to be the piano teachers. Push for structure. Encourage fundamentals. And above all, create an environment with a progression of intentional learning with level-appropriate friction and speed. 

## Foundations First, Fluency Follows

"Slow down! The speed will come," my piano teacher would often say when I rushed ahead of what my skill—or my practice—could support.

Like music, software has structure. And just like a pianist can't fake their way through a complex passage without foundational technique, a developer can't reason well about systems they never learned to construct. They can't explain why something works, how to fix it when it breaks, or when not to build it at all.

As teams, we can’t just hand over the sheet music and hope for the best. We have to create an environment where foundational learning is expected and encouraged—and supported with slow and intentional friction. That means guiding appropriate tool use, giving space for struggle, while guiding and course-correcting.

If we want to grow engineers who can design, adapt, and lead—not just copy, paste, and prompt—we need to give them room to learn the scales. To make mistakes. To understand the why beneath the what.