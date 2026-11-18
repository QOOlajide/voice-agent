# 14. Matcher rules: search for whole-word phrases, first match in config order wins

Date: 2026-11-11
Status: Accepted

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

8. **The term is everything after the trigger, raw** (E5, option B). The
   term patterns capture `(?P<missed_term>.+)` instead of one word (`\S+`), so
   multi-word terms ("البيت الجديد") are kept whole, and fillers around the
   term are kept too. Rejected: stopping at a list of known fillers (a
   lookahead such as `(?=\s+(?:يا استاذ|يعني)|$)`): it breaks on every filler
   not on the list, misses fillers before the term, and regex cannot tell
   vocabulary from filler.
9. **Resolution finds the target inside the term** (`resolve_term`): exact
   matching only for now. A target counts when it appears in the term as
   whole words, after normalizing both; the longest wins (most words, then
   most letters; ties go to the first listed); the seed's spelling is
   returned. None means Khālid asks "which word?". Later: fuzzy matching
   (`difflib`, decision 7), the "last few words" fallback, attached pronouns
   and the article (see Consequences).
10. **`said_nothing()`, a fact, not a judgement.** Text that is empty once
    cleaned (spaces, "…") returns True. It was first named `is_hesitation`,
    with the spec's "empty transcript → rung 2". Renamed because silence does
    not mean confusion: the learner may be thinking, there may be background
    noise, or the transcriber may have missed them. The spec row changed: said
    nothing is not stuck by itself; the ladder decides, combining it with
    silence timing (decision 11), tone (idea 2c) and transcriber status, in
    one place outside this function (those signals come from the voice
    layer). Rejected: deleting the function (the check would move into the
    ladder and be copied wherever needed).
    The same holds for fillers: "uhh" or "امم" is often followed by speech,
    so the spec's "hesitation: uhh, hmm → rung 2" was changed too. A filler
    followed by speech is no signal (the speech is matched as usual, item 1);
    a filler alone is treated like said nothing: the ladder decides.
11. **Missed speech → ask to repeat, only with evidence** (open, voice part).
    Two kinds of transcriber failure: down or unavailable (spec: "Switch to
    the configured fallback provider for the rest of the session"), and did
    not hear properly. For the second, Khālid asks the learner to repeat
    ("عفواً، ممكن تعيد؟") only when there is evidence speech happened: the
    voice detector heard speech but the transcript is empty, or the
    transcriber's confidence is low (spec decision 11: "confidence check").
    Silence with no speech detected is the learner being quiet, not a miss;
    otherwise Khālid would ask to repeat every time the learner pauses.

### Coding decisions (line-by-line review of `matcher.py`)

| Code | Chosen | Rejected | Why |
|---|---|---|---|
| `class StuckMatcher` | A class that compiles patterns once at start-up | A function calling `re.search(pattern, text)` each turn | Compiling is visible and done once. (Python's `re` also keeps a hidden cache of recent patterns, 512 on 3.12, so a function would not truly recompile; we choose not to rely on it.) |
| `found` list → `self._patterns` tuple | Build in a list, then freeze into a tuple | Keep the list; a set; a dict | A list allows `.append()` while building; a tuple keeps order and cannot change; a set has no order (breaks first-match-wins); a dict adds nothing, since we never look up by name |
| `for phrase in config.stuck_phrases` | as written | `for name, value in config` | Looping over the model yields `(field name, value)` pairs, including `version`; it needs extra steps and gives `value` the type `Any`, so pyright can no longer check it |
| `by_language` | Type aliases `Patterns`, `LanguagePatterns`; exactly two pairs `tuple[LanguagePatterns, LanguagePatterns]` | One nested label `tuple[tuple[Language, tuple[str, ...]], ...]` | One idea per line is easier to read; the type says "two languages" because there are two, and a new language changes it on purpose |
| each entry | 4-item tuple per entry | `NamedTuple` | Fewer lines; `NamedTuple` reads better (`entry.compiled`), still proposed |
| `entries` (build-time list) | `entries` | `found` | `found` also names the regex match in `match()`; one name, one meaning |
| `resolve_term` whole-word check | pad with spaces: `f" {needle} " in f" {term} "` | a regex per target | normalized text has single spaces only, so padding is exact and simple |

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
  - E5: decided, see item 8.
  - E6: the article. Exact resolution treats "الطبعة" and "طبعة" as different
    words, so a learner saying "ما معنى الطبعة" with target "طبعة" gets
    "which word?". To decide: strip "ال" before comparing, or list both forms
    in the seed. Owner's direction (2026-11-18): accommodate it, because the
    transcriber is likely to add or drop "ال" by mistake, so a correct word
    must not fail over the article. Revisit with evidence from the first
    real transcripts (voice part).
- Evidence for `said_nothing` test rows: an empty transcript is documented
  for Deepgram (silence, noise); punctuation-only is plausible; "   ", "…"
  and a line break are assumptions. Task for the voice step: run real
  Deepgram transcripts (silence, noise, a cough) through the engine and
  keep or drop the unseen rows with evidence.
- Hesitation (spec: "uhh", "hmm", "…", empty transcript → rung 2) is a
  separate check, not built yet; the stuck matcher returns None for it.
