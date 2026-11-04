# talk-engine

The conversation engine for Talk: pure Python logic, text in and decisions out.
See the decision records in `../docs/decisions/` for why it is built this way.

## Checks

Run from this folder (`engine/`). uv installs Python 3.12 and the pinned
dependencies from `uv.lock` on first run.

```bash
uv run ruff check .          # lint
uv run ruff format --check . # formatting
uv run pyright               # type checking (strict)
uv run pytest                # tests
```
