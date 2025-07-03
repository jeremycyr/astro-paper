---
author: Jeremy Cyr
pubDatetime: 2025-07-02T10:15:00Z
title: "Simple Rate Limiting with AWS Primitives: Step Functions and SQS for Priority-Based API Throttling"
slug: simple-rate-limiting-step-functions-sqs-priority-and-task-tokens.md
featured: true
draft: false
tags:
  - aws
  - step-functions
  - sqs
  - task-tokens
  - rate-limiting
  - priority
description: "This article shares how we solved the classic enterprise integration problem of connecting fast, modern systems to slow, rate-limited legacy APIs. Instead of building complex custom solutions, we discovered an effective simple pattern using AWS primitives: Step Functions, priority queues, and Lambda concurrency controls that turns rate limiting into a simple queueing problem—eliminating failures while cutting costs."
---

## Matching Modern Event Rates with Performance Limited Legacy Systems

It's a common scenario in enterprise integrations: you have a modern system capable of bursting quickly to create a significant flurry of events. Inevitably, those events are bound for legacy enterprise systems that, while keeping the entire business afloat, don't handle events or API calls at high rates very well.

If you're lucky, you'll get a flurry of 429 responses, throwing your sending process into an expensive game of "do some math, take a break, and try again later." The more likely scenario is that your target system completely falls over under significant load, responding with 500 errors (if you're lucky), or worse: `ETIMEDOUT` errors where your request spins until finally giving up without ever hearing back from the overwhelmed API. Did the API eventually finish the work? ¯\_(ツ)_/¯

## There Are Lots of Patterns to Deal with This

Some target systems offer asynchronous flows with their own queue management, absolving the sending process of responsibility once the 200 response crosses the threshold. But most likely, you're stuck engineering something yourself.

This might be a long-running queue polling process with its own concurrency tracking. These are fine in theory, but the devil is in the details. Are you handling every failure mode without leaving orphaned concurrency slots? What happens when the process recycles? Is your retry logic bulletproof? On top of it all, you're paying for continuous always-on compute to handle this orchestration.

In some scenarios, you can accept the 429 responses, but again, that compute isn't free. If you put a Step Function into retry, you're paying for each state transition on retry. Accumulate enough of those, and you've just DDoS'd your own system.

## A Better Approach: Task Tokens + Priority Queues

As with most things AWS, the more you can handle with **AWS primitives**, the simpler and better off your build will be. If you find yourself building distributed locks, take a sip of coffee and ask if you're missing a native solution to the problem.

For this particular challenge, we've been using a pattern that combines a few native primitives in a way that solves for concurrency, priority, and async state preservation—all in a pretty simple way.

### Enter: The Almighty Task Token

If you haven't used the task token, it's a callback pattern that works with Step Functions. It allows your step function to pause execution while giving the delegated process the responsibility to wake it up when complete. In short: when your delegated process finishes, it sends the task token back to the step function, saying: "Hey, wake up, I'm done, here are some results for you."

What does this mean in practice? You can have a complex workflow halt to wait for some work to complete. While it does so, it's not consuming compute, and can theoretically wait as long as **one year** for the worker to do its thing—all while preserving the execution state up to the delegation point.

## That's Great, but How Does That Help Me Rate Limit Requests to My AS/400?

The key here is that when you reach an async operation in your Step Function, you drop a message to a queue. Then serving that queue is a single worker function. That worker function can use AWS's built-in provisioned concurrency configuration to limit the maximum number of executions.

So you're not handling how many concurrent executions happen, and you're not handling process recycle and distributed locks. Those are all problems AWS has solved in the creation of these primitives. You're just using them smartly to handle your rate limiting scenario.

## Neat—But What If I Have Batch Jobs Clogging Up the Queue, Stopping My Orders?

More primitive concepts to the rescue. Instead of one SQS queue, let's use a few: BATCH, NORMAL, and HIGH.

## But Aren't We Back in the Complex Orchestration Business?

More primitives! SQS queues have a visibility timeout—let's use it. This is the time after which, if the message is not deleted after being picked up, it's returned to the queue so it can be picked up again. We add a bit of logic to our simple Lambda worker:

> **Worker:** Hey self, I've got this NORMAL priority message here. I'd like to process it. But I wouldn't want to use all that concurrency if there was something more important to do. Hey high priority queue, you got anything cooking?
>
> **High Priority Queue:** Yeah, I got an order here. I'm not sure if you know, but those are **kind of a big deal.**
>
> **Worker:** Oh, yes, my bad. I'm going to go ahead and just stop now to free up this concurrency slot, and when the visibility timeout expires, this NORMAL work will try again.
>
> **Worker:** Lambda OUT!
> `END RequestId: 12345678-1234-1234-1234-123456789012`

But what about max receive count? Well, at a certain point, if a BATCH or NORMAL message has been trying to get through, and we hit a number shy of our max receive count configured on the queue (before the message goes to DLQ), we'll go ahead and process it. We like to reward tenacity.

## How Do I Monitor the Health of This?

Another beauty of this approach: all the components have useful telemetry already. You can set up a dashboard and alerting around Queue Depth, Maximum Queue Age by priority, Step Function execution time, etc.

## Why This Pattern Works

### Strategic Simplicity

When first solving a problem in distributed computing, it's easy to attach new solutions to each requirement. There's a saying: every developer has at some point built their own content management system. This is because we as developers like to work through problems to understand them, and building is a good way to do that. But it's important to remember—these are not new problems, and we're not the first to approach them. Standing on the shoulders of giants can save us a lot of heartburn. The more you can use the native primitive tools in the vicinity of their intended purpose, the easier things generally are going to go. So once you've identified it, put it into your book of proven patterns.

Let's look at the strategic simplicity we've used in this problem:

**Async State:** We could be doing complicated orchestration on our retries to redo transformations or enrichments, or save results in a database. But Step Functions solve our orchestration and state handling simply. Have some async work to be done? Send it off and take a nap.

**Task Tokens + Queues:** The Task Token/Queue combo is powerful. It lets the orchestrator delegate responsibility to the worker without having to micromanage that execution.

**Queue Worker:** The queue worker's logic is dead simple: do a priority check, end execution or do the work.

**Simple Priority Mechanism:** We use the visibility timeout mechanism to automatically requeue ignored work. That way, we're not running a higher priority execution and worrying about whether another worker has picked it up in the meantime. We use the existing mechanism.

If it's not clear by now, the overall theme here is **using what's available and proven**—road-tested solutions to solve problems that in their individual pieces have been well-solved. Take the time to understand how each of the primitives work in detail. Understand the docs in depth. It will be worth it.

## The Results

Since implementing this pattern, we've eliminated rate limit violations while reducing infrastructure costs. The system handles priority gracefully—critical updates process immediately while batch operations wait patiently in line. Most importantly, debugging became straightforward since each Step Function execution has a clear audit trail.

## The Power of AWS Primitives

This pattern turns what's typically a complex coordination problem into the execution of simple, well-proven AWS primitive patterns.

By making API calls asynchronous and routing them through priority queues, you gain precise control over both concurrency and priority without building custom scheduling logic. The Lambda concurrency limit becomes your rate limiter, SQS visibility timeout becomes your retry mechanism, and Step Function task tokens become your coordination mechanism.

## Broader Applications

While we used this pattern most commonly for ERP integration, it applies to any scenario where you need to coordinate multiple processes accessing rate-limited resources. Many enterprise systems have similar constraints when paired with modern event-driven architectures. This pattern provides a blueprint for elegantly bridging that gap without the complexity of traditional approaches.

The combination of priority queues, concurrency controls, and task tokens creates sophisticated distributed system behavior that's both powerful and maintainable—exactly what you need when connecting modern cloud architectures to enterprise systems that still think concurrency is a dirty word.