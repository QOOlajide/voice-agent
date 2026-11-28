# Patterns to reuse

## pydantic models: `model_config` and `ConfigDict`

- **`model_config`** is the special class attribute pydantic looks for; it
  holds the settings for the whole model.
- **`ConfigDict(...)`** is the typed container you put those settings in.
  So every model starts with `model_config = ConfigDict(...)`.

| Setting | Use it when… | Protects against | Used in |
|---|---|---|---|
| `frozen=True` | the object is **shared**, or kept as history | changes behind your back; a broken replay | `StuckPhrase`, `EngineConfig`, `StuckMatch`, `LadderState`, the ladder events |
| `extra="forbid"` | the input has a **fixed set of fields** | typos silently ignored (`step_dwon`) | the config models, `LadderState`, the ladder events |
| `strict=True` | **only your own code** creates it | bugs hidden by conversion (`True` becoming `1`) | `LadderState`, the ladder events |
| *(strict left off)* | the data comes from **outside** (files, APIs) and a tidy conversion is welcome | rejecting reasonable input | the config file models |
| `Field(ge=, le=, min_length=)` | **one field** has limits | values out of range, empty text | `step_down`, the counters, `term` |
| `@model_validator(mode="after")` | a rule involves **several fields** together | impossible combinations | stuck-phrase rules, "no term outside a rescue" |

### Rule of thumb for a new model

1. Is it shared, or kept as history? → `frozen=True`.
2. Does it have a fixed shape? → `extra="forbid"`.
3. Who creates it: our code, or the outside world? → `strict=True` for ours.
4. A limit on one field → `Field(...)`; a rule across fields → a validator
   that raises `ValueError` (never `assert`: `python -O` removes it).
5. Making a changed copy: `model_validate({**old.model_dump(), ...})`, not
   `model_copy(update=...)`, which skips validation.
