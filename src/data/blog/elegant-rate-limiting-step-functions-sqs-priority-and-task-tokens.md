---
author: Jeremy Cyr
pubDatetime: 2025-07-02T10:15:00Z
title: "Elegant Rate Limiting: Using AWS Step Functions and SQS for Priority-Based API Throttling"
slug: elegant-rate-limiting-step-functions-sqs-priority-and-task-tokens.md
featured: true
draft: false
tags:
  - aws
  - step-functions
  - sqs
  - task-tokens
  - rate-limiting
  - priority
description: "This article shares how we solved the classic enterprise integration problem of connecting fast, modern systems to slow, rate-limited legacy APIs like NetSuite. Instead of building complex custom solutions, we discovered an elegant pattern combining AWS Step Functions, priority queues, and Lambda concurrency controls that turns rate limiting into a simple queueing problem—eliminating failures while cutting costs."
---

## Matching cloud-native event speeds with heavily throttled legacy systems

Modern event-driven systems can generate thousands of events per second. Your microservices architecture is humming along, processing orders, inventory updates, and customer interactions at cloud scale. But then you need to sync this data with your enterprise systems—NetSuite, Salesforce, SAP, or any number of legacy platforms that power critical business operations.

The problem? These enterprise systems weren't built for the scale and velocity of modern cloud applications. They have strict rate limits, often measured in requests per minute rather than per second. When your cloud-native system tries to push hundreds of concurrent updates to NetSuite, you hit those rate limits hard. API calls start failing, your retry logic kicks in, and suddenly you're in a cascading failure scenario where multiple processes are competing for the same limited API capacity.

This is the classic "fast lane meets slow lane" problem in enterprise architecture. You need to maintain the speed and scalability of your modern systems while respecting the constraints of your enterprise platforms.

## Traditional Approaches Fall Short

The typical solutions to this problem each come with significant drawbacks:

**Always-On Queue Processors** require persistent infrastructure and still need you to build complex rate limiting logic. 

**Built-In Retry Logic** leads to thundering herd problems where everyone's exponential backoff creates a coordination nightmare. 

**Centralized Rate Limiting Services** introduce single points of failure and require significant development effort. 

**Accept Failure Rates** works for some use cases but isn't acceptable when you need guaranteed delivery to critical enterprise systems.

None of these approaches elegantly solve the core problem: how do you coordinate multiple independent workflows to respect shared rate limits without building a complex orchestration layer?

## A Better Approach: Task Tokens + Priority Queues

We recently implemented a pattern that elegantly solves this problem by turning AWS Lambda's concurrency controls into a distributed rate limiter. The core insight is counterintuitive: instead of making API calls directly from your Step Functions, you make them asynchronously through a priority queue system.

Here's how it works:

### The Architecture

1. **Step Function Orchestration**: Each workflow runs as a Step Function that processes events, transforms data, and needs to make API calls to NetSuite.

2. **Async API Calls**: When the Step Function reaches an API call, instead of making it directly, it pauses using a Task Token and drops the payload into an SQS queue.

3. **Priority Queues**: We use three SQS queues with different priorities: HIGH, MEDIUM, and BATCH. The payload includes everything needed to make the API call plus the task token.

4. **Single Worker**: A single Lambda function processes all three queues. AWS Lambda's concurrency limit controls exactly how many API calls can happen simultaneously.

5. **Priority Processing**: The worker checks higher priority queues first. If there's work waiting in a higher priority queue, it returns without processing lower priority items.

6. **Automatic Retry**: Lower priority items that don't get processed return to the queue after the visibility timeout expires. After a set number of deferrals, we process them regardless of priority.

7. **Resume Step Function**: When the API call completes, the worker uses the task token to resume the Step Function with the results.

## Why This Pattern Works

### Perfect Rate Limiting Through Concurrency Controls
AWS Lambda's concurrency limit becomes your rate limiter. Set it to match your API limits (e.g., 10 concurrent executions), and you'll never exceed your rate limits. No custom throttling logic required.  If you need a more complex rate limiting design you can create it, but flat concurrency works great using lambda's built-in provisioned concurrency. 

### Priority Without Complexity
Higher priority work preempts lower priority work through simple queue checking. The visibility timeout mechanism handles the retry logic automatically—lower priority items just keep coming back until they get processed or higher priority work clears out.

### Built-In State Management
The Step Function holds all execution state while the API call happens asynchronously. When it resumes, it has the original input, transformed data, and full execution context. No need to store state in databases or pass complex payloads through multiple hops.

### No Always-On Infrastructure
The Step Functions sleep while waiting for API calls. The Lambda worker only runs when there are messages to process. You pay only for actual execution time.

### Automatic Retry Logic
SQS visibility timeout provides automatic retry without additional code. Failed messages naturally return to the queue for reprocessing. It's like having a built-in retry mechanism that doesn't require you to write retry logic.

## The Results

Since implementing this pattern, we've eliminated rate limit violations while reducing infrastructure costs. The system handles priority gracefully—critical updates process immediately while batch operations wait patiently in line. Most importantly, debugging became straightforward since each Step Function execution has a clear audit trail.

## The Power of AWS Primatives

This pattern turns what's typically a complex coordination problem into the execution of simple, well proven AWS primative patterns.

By making API calls asynchronous and routing them through priority queues, you gain precise control over both concurrency and priority without building custom scheduling logic. The Lambda concurrency limit becomes your rate limiter, SQS visibility timeout becomes your retry mechanism, and Step Function task tokens become your coordination mechanism.

## Broader Applications

While we used this pattern for NetSuite integration, it applies to any scenario where you need to coordinate multiple processes accessing rate-limited resources. Many enterprise systems have similar constraints when paired with modern event-driven architectures. This pattern provides a blueprint for elegantly bridging that gap without the complexity of traditional approaches.

The combination of priority queues, concurrency controls, and task tokens creates sophisticated distributed system behavior that's both powerful and maintainable—exactly what you need when connecting modern cloud architectures to enterprise systems that still think concurrency is a dirty word.

---
