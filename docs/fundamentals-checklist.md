Use this doc after major product or code decisions. Ask: **which fundamentals did we touch, what did we gain, what did we give up?**

---

## Software engineering fundamentals

### Systems & platforms

- Operating Systems
- Databases
- Networking
- Security
- APIs
- Cloud Computing
- DevOps

### Design & structure

- System Design
- Software Architecture
- Object-Oriented Programming (OOP)
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- YAGNI (You Aren't Gonna Need It)
- Separation of Concerns
- Abstraction
- Encapsulation
- Composition Over Inheritance

### Design patterns

- Singleton
- Factory Method
- Abstract Factory
- Builder
- Prototype
- Adapter
- Decorator
- Facade
- Proxy
- Composite
- Bridge
- Strategy
- Observer
- Command
- State
- Template Method
- Iterator
- Chain of Responsibility
- Mediator
- Memento
- Visitor
- Interpreter

### Quality, scale & correctness

- Testing & Quality Assurance
- Time & Space Complexity
- Reliability & Fault Tolerance
- Observability
- Data Structures & Algorithms (DSA)

---

## Machine learning fundamentals

Parallel checklist for ML-specific tradeoffs (data, models, evaluation, ops).

### Problem framing & data

- Problem Formulation (prediction target, unit of analysis, success metric)
- Supervised / Unsupervised / Reinforcement framing
- Data Collection & Labeling
- Train / Validation / Test Splits
- Leakage & Temporal Integrity (time-aware splits, no future info)
- Missingness & Data Quality
- Feature Engineering & Representation
- Imbalance & Sampling
- Feature Stores & Reproducible Datasets

### Modeling

- Bias–Variance Tradeoff
- Underfitting vs Overfitting
- Regularization
- Model Family Choice (linear, trees, boosting, neural nets, etc.)
- Hyperparameter Optimization (HPO)
- Ensembles & Model Selection
- Calibration & Uncertainty
- Interpretability & Feature Importance

### Evaluation & experimentation

- Offline Metrics (RMSE, AUC, precision/recall, etc.)
- Online / Business Metrics
- Cross-Validation Strategy
- Baselines & Ablations (e.g. firm-only vs firm+macro)
- Statistical Significance & Variance of Estimates
- Error Analysis

### Training systems & cost

- Compute Budget (wall-clock, $$, GPU/CPU)
- Batch vs Online Learning
- Distributed Training (when needed)
- Checkpointing & Resumability

### MLOps & production

- Experiment Tracking
- Model Registry & Versioning
- Training / Serving Skew
- Inference Latency & Throughput
- Monitoring, Drift & Retraining Triggers
- Human-in-the-Loop & Guardrails
- Privacy, Fairness & Compliance

### ML-oriented design principles

- Validate Before You Optimize (data quality before bake-off)
- Prefer Simple Baselines First
- Measure Lift, Not Just Absolute Score
- Separate Data Pipeline from Model Code
- Reproducibility (seeds, versions, artifact paths)
- Fail Loudly on Bad Inputs (missing panel, bad schema)

### Common ML “patterns” (recurring designs)

- Train/Serve Pipeline
- Feature Transform Fit-on-Train-Only
- Champion / Challenger (bake-off)
- Shadow Mode / Canary Deploy
- Offline Replay for Debugging
- Tool-Calling / Agent Orchestration over Fixed DAGs (when the planner is an LLM)

---

## How to use after a major change

1. Name the user-visible behavior that changed.
2. Pick 3–7 fundamentals from the lists above that actually applied (not every item).
3. For each: **decision → benefit → cost / risk → what would change the decision.**

### Example (button label + AppTest stub)

| Fundamental | Decision | Benefit | Cost / risk |
|-------------|----------|---------|-------------|
| Testing & QA | AppTest + env stub | Fast, no OpenRouter in CI | Does not prove real LLM/tools |
| KISS / YAGNI | Label in `session_state`; flip in `finally` | Clear product rule | Extra `st.rerun` pass |
| Separation of Concerns | Stub via env in `run_case_study_agent` | Test seam without brittle mocks | Env flag is a testing API in prod code |
| Reliability | `pop` pending flag (one-shot) | Avoids re-running agent every rerun | Mis-set flag = missed or double run |
| ML: Validate / Compute Budget | Stub sleep instead of bake-off in unit test | Cheap feedback loop | Real compute path untested here |
