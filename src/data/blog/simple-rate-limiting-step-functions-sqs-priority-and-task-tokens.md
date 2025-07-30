---
author: Jeremy Cyr
pubDatetime: 2025-07-02T10:15:00Z
title: "Simple Concurrency Limiting with AWS Primitives: Step Functions and SQS for Priority-Based API Throttling"
slug: simple-concurrency-limiting-step-functions-sqs-priority-and-task-tokens.md
featured: true
draft: false
tags:
  - aws
  - step-functions
  - sqs
  - task-tokens
  - rate-limiting
  - priority
description: "How we solved the classic enterprise integration problem of connecting fast, modern systems to slow, rate-limited legacy APIs using AWS primitives: Step Functions, priority queues, and Lambda concurrency controls that turns rate limiting into a simple queueing problem."
---

![Article Header](/assets/blog1/article-header.png)

## The Problem: Modern Speed Meets Legacy Limits

It's a common enterprise scenario: your modern system creates event bursts that overwhelm legacy APIs. If you're lucky, you'll get 429 responses, throwing your sending process into an expensive game of "do some math, take a break, and try again later." More likely, your target system falls over completely—500 errors or `ETIMEDOUT` failures where you never know if the work completed. Did the API eventually finish? ¯\_(ツ)_/¯

Some systems will give you an async queue in the target system that you can use.  Usually however, you're left to develop a mechanism to control the flow and handle backoff and retry. Queue patterns are useful of course, but you still need some flow control mechanism, which usually ends up being a polling worker that is burning a bunch of always-on compute. How do we orchestrate multiple calls? How are we preserving state between them? How are we handling failure modes? 

## The Solution: AWS Primitives Working Together

As with most things AWS, the more you can handle with **AWS primitives**, the simpler and better off your build will be. If you find yourself building distributed locks, take a sip of coffee and ask if you're missing a native solution.

We've been using a pattern that combines Step Functions, SQS, and Lambda concurrency controls to solve for rate limiting, priority, and async state preservation—all in a relatively simple and elegant way.

### The Core Pattern

![Task Token](/assets/blog1/task-token.png)

**Step 1: Task Tokens for Async Control**  
Task tokens let Step Functions pause execution while delegating work. When your worker finishes, it sends the token back saying "I'm done, here are the results." This means complex workflows can halt without consuming compute and wait up to **one year** while preserving execution state.

![Provisioned Concurrency](/assets/blog1/concurrency.png)

**Step 2: Queue + Lambda Concurrency = Rate Limiting**  
When your Step Function reaches an async operation, it drops a message to a queue. A single worker function serves that queue with AWS's built-in provisioned concurrency limiting maximum executions. You're not handling concurrency counting, process recycling, or distributed locks—AWS solved those problems. You're just using the existing mechanisms together smartly.

![Priorities](/assets/blog1/priorities.png)

**Step 3: Priority Queues**  
Instead of one SQS queue, we use multiple: BATCH, NORMAL, and HIGH. This is where things get interesting.

## Smart Priority Orchestration

SQS visibility timeout handles the orchestration for us. Our Lambda worker logic is simple:

> **Worker:** I've got this NORMAL priority message. But let me check—hey HIGH priority queue, got anything?
>
> **High Priority Queue:** Yeah, I got an order here. Those are **kind of a big deal.**
>
> **Worker:** My bad. I'll exit now to free up this concurrency slot. When visibility timeout expires, this NORMAL work will try again.

![Visibility Timeout](/assets/blog1/vis-timeout.png)

For messages hitting max receive count, we process them anyway, so we don't end up with blocked queues causing DLQ'd messages.

## Why This Pattern Works

**Strategic Simplicity:** Instead of building custom solutions, we use proven AWS primitives:

- **Step Functions** handle async state and orchestration  
- **Task Tokens + Queues** let orchestrators delegate without micromanaging  
- **Lambda Concurrency** becomes your rate limiter  
- **SQS Visibility Timeout** becomes your retry mechanism  
- **Priority Queues** handle urgency without complex scheduling logic

The theme is **using what's available and proven**—road-tested solutions for well-solved problems. Take the time to understand how each primitive works in detail. It will be worth it.

## Monitoring and Results

All components have built-in telemetry: Queue Depth, Maximum Queue Age by priority, Step Function execution time, etc. Since implementing this pattern, we've eliminated rate limit violations while reducing infrastructure costs. The system handles priority gracefully—critical updates process immediately while batch operations wait in line. Most importantly, it's easy to understand and debug.

## Broader Applications

This pattern works beyond ERP integration—anywhere you need coordinated access to rate-limited resources. The combination of priority queues, concurrency controls, and task tokens creates an elegant distributed system behavior that's both powerful and maintainable.