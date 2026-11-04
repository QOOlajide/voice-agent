# 9. Hosting: frontend on AWS Amplify, Pipecat bot on EC2

Date: 2026-11-03 (decided in an earlier chat on Saturday; recorded here)
Status: Accepted. Supersedes the open hosting question in the product spec
(decision 27: "Pipecat Cloud vs self-hosted").

## Context

Every Talk conversation is a long-running, real-time session: the bot is a
Python process that must stay alive for a whole conversation, listening,
calling STT, the LLM and TTS, and speaking back turn after turn.

| Option | Long voice sessions | Who operates it | Main drawback |
|---|---|---|---|
| Vercel Functions | No: connections close at the function's maximum duration | Vercel | A scene could be cut off mid-lesson; Pipecat also advises WebRTC, not WebSocket, for browser voice |
| Pipecat Cloud | Yes | Pipecat (Daily) | A black box outside AWS, from a smaller vendor |
| EC2 | Yes, no duration cap | Me | I handle TLS, ports, restarts and deploys |

## Decision

**Frontend: AWS Amplify.** For a frontend, Amplify and Vercel are comparable:
both deploy from git, serve over a global CDN and handle HTTPS. Amplify keeps
frontend and backend in one AWS account: one set of IAM permissions, one bill,
one place for logs and monitoring, one fewer vendor. The app is already
deployed on Amplify, so switching would cost a migration for no gain.

**Backend: the Pipecat bot on EC2**, over Pipecat Cloud, for:
1. **Ownership and understanding:** I set up networking, TLS and deploys myself,
   so nothing in the stack is a black box.
2. **Observability I control:** Prometheus and Grafana next to the bot, tracking
   what matters for Talk: per-stage latency (STT, LLM, TTS) and rescue-ladder
   usage.
3. **One ecosystem:** frontend and backend share one AWS account, IAM model and
   bill.
4. **Portability and longevity:** the bot runs in a Docker container on a
   standard Linux VM, so it can move to any cloud; Pipecat is open source, so
   the bot code is the same wherever it runs.

**Kept simple within the choice:** one instance (no autoscaling group); one
backend app (a single Pipecat server, no microservices); the default VPC and a
stock Ubuntu AMI; Docker Compose, not Kubernetes.

## Consequences

- Vercel has a smoother developer experience for Next.js; if the frontend were
  the whole product, it would deserve serious consideration.
- **Operations are mine:** TLS, open ports, process restarts, patching.
  Mitigation: Caddy for automatic HTTPS, Docker restart policies, tagged images
  so a rollback means running the previous tag.
- **Single point of failure:** if the instance goes down, Talk is down.
  Mitigation: a health-check endpoint watched by a Grafana alert.
- **Revisit when:** concurrent sessions outgrow one instance, or running the
  server starts slowing down shipping. Then Pipecat Cloud becomes the better
  choice.
- **Open:** Daily or SmallWebRTC as the transport. Daily keeps the instance to
  ports 80 and 443; SmallWebRTC needs UDP ports and possibly a TURN server.

## Interview answer

"Every Talk conversation is a long-running real-time session, so the voice bot
needed a long-lived server; function-based hosts like Vercel cut connections at
a maximum duration. That left Pipecat Cloud or EC2. Pipecat Cloud would have
been faster to deploy, but I chose EC2 for ownership: I understand every layer,
I control the observability, and the bot runs in a container I can move to any
cloud. Since the backend was in AWS, I kept the frontend on Amplify too, which
is as capable as Vercel for hosting and keeps everything in one account. Then I
kept the setup deliberately simple: one instance, one backend app, Docker
Compose. If Talk outgrows one instance, I'd revisit Pipecat Cloud."
