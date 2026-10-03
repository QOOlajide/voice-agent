# 3. Python tooling: uv, Ruff, type checking with pyright

Date: 2026-10-03
Status: Accepted

## Context

The engine (`engine/`, see record 2) is Python. `CLAUDE.md` requires it to be
deterministic given the same inputs. Library versions are an input: for example,
a new CAMeL Tools release could reduce a word to a different base form and
change level-check results with no change to engine code.

CAMeL Tools depends on `torch` and `transformers`, so installs are large and CI
installs them on every push.

All data types are pydantic v2 models, so the type checker must understand them.

## Decision

1. **uv** manages dependencies and the Python version.
   - `uv.lock` is committed: it records the exact resolved version of every
     dependency, so every machine installs the same versions and upgrades are
     deliberate commits.
     (https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile)
   - Python is pinned to 3.12 (`.python-version`), so laptop and CI run the
     same interpreter.
   - uv installs fast, which matters for the large torch-based dependency tree.
2. **Ruff** for both linting and formatting, replacing Flake8, Black and isort.
   One tool means one config section in `pyproject.toml`, one version to pin and
   no conflicts between tools. (https://docs.astral.sh/ruff/)
   Which lint rule groups to enable is decided when the config is written.
3. **Type checking is required.** It catches errors such as using an optional
   value that may be `None` (e.g. `LearnerTurn.word_timestamps`) before the code
   runs, on every line, not only the cases a test was written for. This enforces
   part of `CLAUDE.md`'s rule that bad or empty input never crashes the engine.
   Tests and type checking complement each other.
   (https://mypy.readthedocs.io/en/stable/getting_started.html#dynamic-vs-static-typing)
4. **pyright** is the type checker, not mypy.
   - It is the engine behind VS Code's Python type checking (Pylance), so the
     editor shows exactly what CI enforces.
   - It understands pydantic models natively through the standard
     `dataclass_transform` (PEP 681), with no plugin.
   - It is fast.

## Consequences

- pyright has no plugin system
  (https://github.com/microsoft/pyright/blob/main/docs/mypy-comparison.md, "Plugins").
  Acceptable while no dependency needs a type-checker plugin; revisit if one does.
- We give up the pydantic mypy plugin's stricter checks on model construction
  (https://docs.pydantic.dev/latest/integrations/mypy/).
- pyright needs Node.js to run; this repo already uses Node for the web app.
