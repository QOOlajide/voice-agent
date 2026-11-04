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
   - The engine is a uv **library** (`uv init --lib`, `src/` layout), not an
     application: the CLI, the tests and later the voice server all import it
     (`from talk_engine import ...`), and uv installs it into the environment
     so that import works the same everywhere.
     (https://docs.astral.sh/uv/concepts/projects/init/)
   - Rejected alternative: a `sys.path.insert(0, "../engine/src")` line in each
     file that imports the engine. It (1) resolves relative to the folder the
     command is run from, so running from another folder breaks the import;
     (2) is invisible to pyright and editors, which analyse code without running
     it, so strict mode reports the import as unresolved; (3) must be repeated in
     the tests, the CLI and the voice server. The installed package is declared
     once and works everywhere.
   - How the editable install works (verified in `.venv`): uv writes
     `talk_engine.pth`, a one-line pointer to `engine/src` that Python reads at
     startup, so code edits apply without reinstalling; and
     `talk_engine-0.1.0.dist-info/`, the installation record that
     `importlib.metadata.version()` reads.
     (https://docs.pytest.org/en/stable/explanation/goodpractices.html,
     https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/)
2. **Ruff** for both linting and formatting, replacing Flake8, Black and isort.
   One tool means one config section in `pyproject.toml`, one version to pin and
   no conflicts between tools. (https://docs.astral.sh/ruff/)
   Lint rules (decided 2026-10-03): Ruff's defaults (`E4`, `E7`, `E9`, `F`) plus
   - `B` (flake8-bugbear): known mistake patterns that run but behave wrongly,
     e.g. a mutable default argument (B006) that would share one event log
     across scenes;
   - `I` (isort): import order, auto-fixed, so it costs nothing.
   (https://docs.astral.sh/ruff/rules/)
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
   - Strictness (decided 2026-10-11): `strict` everywhere, relaxed only in the
     CAMeL Tools adapter module. `standard` only checks values that carry a type
     label; `strict` requires every function input and output to be labelled, so
     nothing unlabelled slips past (e.g. one word passed where `list[str]` was
     promised). Cheap to adopt while the engine is new, and it catches mistakes in
     AI-written code that a reviewer might miss. CAMeL Tools has no type hints, so
     strict's `reportUnknown*` and `reportMissingTypeStubs` errors are confined to
     the one module that imports it.
     (https://github.com/microsoft/pyright/blob/main/docs/configuration.md#diagnostic-settings-defaults)

## Consequences

- pyright has no plugin system
  (https://github.com/microsoft/pyright/blob/main/docs/mypy-comparison.md, "Plugins").
  Acceptable while no dependency needs a type-checker plugin; revisit if one does.
- We give up the pydantic mypy plugin's stricter checks on model construction
  (https://docs.pydantic.dev/latest/integrations/mypy/).
- pyright needs Node.js to run; this repo already uses Node for the web app.
