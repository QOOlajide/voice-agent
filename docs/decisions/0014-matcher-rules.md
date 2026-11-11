# 14. Matcher rules: search for whole-word phrases, first match in config order wins

Date: 2026-11-11
Status: Accepted. Start-up half built; `match()` still under review.

## Context

The matcher turns what the learner said into a row of the engine spec's
"Stuck phrases → entry rung" table, so the ladder knows what help to give.
Learners rarely say a stuck phrase alone: they add fillers ("امم", "يعني")
or more words around it.

## Decision

1. **Search anywhere** in the sentence (`re.search`), not a whole-sentence
   match. Fillers around a phrase do not block it; they stay in the raw
   transcript as data.
2. **Whole words only.** The matcher wraps every pattern in `\b(?:…)\b`
   (`\b` = word boundary), so "اعد" does not match inside "ساعده". Pattern
   authors do not write `\b` themselves.
3. **The matcher normalizes its input**, so callers cannot forget to.
4. **First match wins, in config order, Arabic before English.** Order is
   priority (specific before general), not likelihood: sorting by "most
   likely" would let `didnt_understand` steal "فهمت … لكن لم افهم X".
5. **The result names the pattern that matched** (`pattern` field), so the
   event log can count which config lines fire and find dead ones.
6. **The compiled patterns are stored in a tuple**, not a list: one matcher
   is shared by every conversation, and a tuple cannot be changed while the
   program runs. A mistaken `.clear()` crashes loudly instead of silently
   switching off stuck detection. Rejected: a defensive copy (protects the
   data but hides the bug, and only works if every access remembers to copy).
7. **Removed the dead pattern `من فضلك (اعد|كرر)`** from `repeat_please`.
   Under search, `(اعد|كرر)( من فضلك)?` always matches first, and both lines
   lead to the same spec row (rung 2). Found by the test for decision 5.

### Coding decisions (line-by-line review of `matcher.py`)

| Code | Chosen | Rejected | Why |
|---|---|---|---|
| `class StuckMatcher` | A class that compiles patterns once at start-up | A function calling `re.search(pattern, text)` each turn | Compiling is visible and done once. (Python's `re` also keeps a hidden cache of recent patterns, 512 on 3.12, so a function would not truly recompile; we choose not to rely on it.) |
| `found` list → `self._patterns` tuple | Build in a list, then freeze into a tuple | Keep the list; a set; a dict | A list allows `.append()` while building; a tuple keeps order and cannot change; a set has no order (breaks first-match-wins); a dict adds nothing, since we never look up by name |
| `for phrase in config.stuck_phrases` | as written | `for name, value in config` | Looping over the model yields `(field name, value)` pairs, including `version`; it needs extra steps and gives `value` the type `Any`, so pyright can no longer check it |
| `by_language` | Type aliases `Patterns`, `LanguagePatterns`; exactly two pairs `tuple[LanguagePatterns, LanguagePatterns]` | One nested label `tuple[tuple[Language, tuple[str, ...]], ...]` | One idea per line is easier to read; the type says "two languages" because there are two, and a new language changes it on purpose |
| each entry | 4-item tuple per entry | `NamedTuple` | Fewer lines; `NamedTuple` reads better (`entry.compiled`), still proposed |

Open: `StuckMatch` as pydantic model (recommended: consistent with config,
`model_dump_json()` for the event log) or frozen dataclass (measured 0.24 µs
faster per object, which is negligible).

## Consequences

- Accepted false positive: "لا افهم لماذا…" ("I don't understand why…")
  matches as stuck.
- Found by probing, not yet decided:
  - E1: "أعدّ العشاء" (prepare) matches as repeat; أعدّ and أعِد look the
    same without vowel marks.
  - E2: attached pronouns are missed ("لم أفهمك", "كررها").
  - E3: dialect "ما فهمتش" is missed.
  - E4: "ما معنى هذا" / "what does it mean" return the term "هذا" / "it"
    instead of `what_do_you_mean`.
  - E5: `\S+` captures one word, so "الطبعة الثانية" becomes "الطبعة".
- Hesitation (spec: "uhh", "hmm", "…", empty transcript → rung 2) is a
  separate check, not built yet; the stuck matcher returns None for it.
