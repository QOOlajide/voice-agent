"""Tests for the stuck-phrase matcher (decisions 7, 13, 14)."""

from pathlib import Path

import pytest

from talk_engine.config import load_config
from talk_engine.matcher import StuckMatcher, is_hesitation, resolve_term

CONFIG_PATH = Path(__file__).parent.parent / "config" / "engine.config.json"
MATCHER = StuckMatcher(load_config(CONFIG_PATH))
# _patterns is private; the start-up tests read it on purpose.
PATTERNS = MATCHER._patterns  # pyright: ignore[reportPrivateUsage]

# Target words for the resolution tests: a small stand-in for a seed's list.
TARGETS = ("طبعة", "البيت", "البيت الجديد", "كتاب")


# --- start-up: patterns compiled once, in order ------------------------------


def test_every_config_pattern_is_compiled() -> None:
    assert len(PATTERNS) == 18


def test_order_is_config_order_with_arabic_before_english() -> None:
    order = [(phrase.id, language) for phrase, language, _, _ in PATTERNS]
    assert order[:3] == [
        ("understood_but_not", "ar"),
        ("understood_but_not", "en"),
        ("what_do_you_mean", "ar"),
    ]
    assert order[-1] == ("didnt_understand", "en")


def test_each_pattern_is_kept_as_written_and_compiled_as_whole_words() -> None:
    _, _, pattern, compiled = next(e for e in PATTERNS if e[2] == "لم افهم")
    assert pattern == "لم افهم"  # as written in the config, for the event log
    assert compiled.pattern == r"\b(?:لم افهم)\b"


def test_patterns_cannot_be_changed_after_start_up() -> None:
    assert isinstance(PATTERNS, tuple)


# --- match(): is the learner saying they are stuck? --------------------------


@pytest.mark.parametrize(
    ("said", "phrase_id", "missed_term"),
    [
        # each stuck phrase, as a learner might say it (raw, before cleaning)
        ("لم أفهم", "didnt_understand", None),
        ("أعد من فضلك", "repeat_please", None),
        ("ما معنى طبعة؟", "what_does_x_mean", "طبعة"),
        ("ما معنى الكلمة؟", "what_does_x_mean", None),
        ("ما معنى", "what_does_x_mean", None),
        ("ماذا تعني بذلك؟", "what_do_you_mean", None),
        ("هل تقصد الطبعة الثانية؟", "do_you_mean", "الطبعة الثانية"),
        # specific before general: contains "لم افهم" but is a targeted rescue
        ("فهمت الدرس، لكن لم أفهم طبعة", "understood_but_not", "طبعة"),
        # fillers around the phrase do not block it (decision 14)
        ("امم… لم أفهم", "didnt_understand", None),
        ("يعني ما فهمت شي", "didnt_understand", None),
        # vowel marks and hamza in the input are cleaned before matching
        ("لَمْ أَفْهَمْ", "didnt_understand", None),
        # English (decision 6)
        ("I don't understand", "didnt_understand", None),
        ("what does tabah mean?", "what_does_x_mean", "tabah"),
        ("What does that mean?", "what_do_you_mean", None),  # "that" is not a term
        ("say that again please", "repeat_please", None),
    ],
)
def test_stuck_phrases_are_recognized(
    said: str, phrase_id: str, missed_term: str | None
) -> None:
    found = MATCHER.match(said)
    assert found is not None
    assert found.phrase_id == phrase_id
    assert found.missed_term == missed_term


@pytest.mark.parametrize(
    "said",
    [
        "أريد هذا الكتاب",  # a normal answer
        "ساعده من فضلك",  # "اعد" only inside another word (whole words, decision 14)
        "فهمت",  # "I understood": the positive, not the negative
        "",  # empty transcript
        "…",  # punctuation only
    ],
)
def test_normal_or_empty_input_is_not_stuck(said: str) -> None:
    assert MATCHER.match(said) is None


def test_result_carries_what_the_ladder_needs() -> None:
    found = MATCHER.match("ما معنى طبعة")
    assert found is not None
    assert found.action == "rescue_term"
    assert found.entry_rung == 3
    assert found.language == "ar"


def test_english_match_is_labelled_english() -> None:
    found = MATCHER.match("I didn't understand")
    assert found is not None
    assert found.language == "en"


@pytest.mark.parametrize(
    ("said", "pattern"),
    [
        # same phrase (didnt_understand), two different config lines (finding C)
        ("لم افهم", "لم افهم"),
        ("ما فهمت", "ما فهمت"),
        # "please" first is still caught by the one repeat line: search finds
        # "كرر" anywhere, so a separate "من فضلك (اعد|كرر)" line was dead
        ("من فضلك كرر", "(اعد|كرر)( من فضلك)?"),
    ],
)
def test_result_names_the_pattern_that_matched(said: str, pattern: str) -> None:
    found = MATCHER.match(said)
    assert found is not None
    assert found.pattern == pattern


@pytest.mark.parametrize(
    ("said", "missed_term"),
    [
        # the term is looked up in the seed's word list later, so no punctuation
        # may stick to it, whatever the script
        ("ما معنى طبعة؟", "طبعة"),  # Arabic question mark
        ("ما معنى «طبعة»؟", "طبعة"),  # Arabic quotation marks
        ("ما معنى طبعة، يا أستاذ", "طبعة يا استاذ"),  # Arabic comma; words kept raw
        ("ما معنى طبعة!", "طبعة"),
        ("what does 'tabah' mean?", "tabah"),  # English quotes
        ("what does “tabah” mean", "tabah"),  # curly quotes
        ("هل تقصد الطبعة الثانية؟", "الطبعة الثانية"),  # term runs to the end
    ],
)
def test_missed_term_never_contains_punctuation(said: str, missed_term: str) -> None:
    found = MATCHER.match(said)
    assert found is not None
    assert found.missed_term == missed_term


@pytest.mark.parametrize(
    ("said", "missed_term"),
    [
        # the matcher captures everything after the trigger, raw; resolution
        # (next slice) finds the target words inside it (decision 14, E5)
        ("ما معنى البيت الجديد", "البيت الجديد"),  # two words, not just "البيت"
        ("ما معنى يعني طبعة", "يعني طبعة"),  # filler before the term is kept
        ("ما معنى طبعة امم", "طبعة امم"),  # filler after the term is kept
        ("what does al bayt al jadid mean", "al bayt al jadid"),  # up to "mean"
    ],
)
def test_term_is_everything_after_the_trigger(said: str, missed_term: str) -> None:
    found = MATCHER.match(said)
    assert found is not None
    assert found.missed_term == missed_term


def test_same_input_gives_same_result() -> None:  # determinism (engine spec)
    assert MATCHER.match("ما معنى طبعة") == MATCHER.match("ما معنى طبعة")


# --- resolve_term(): which target word did they name? (exact only) ----------


@pytest.mark.parametrize(
    ("term", "resolved"),
    [
        ("طبعة", "طبعة"),  # the word alone
        ("يعني طبعة", "طبعة"),  # filler before is ignored
        ("طبعة امم", "طبعة"),  # filler after is ignored
        ("طبعة يا استاذ", "طبعة"),  # words after are ignored
        ("البيت الجديد", "البيت الجديد"),  # longest wins over "البيت"
        ("يعني البيت الجديد امم", "البيت الجديد"),  # multi-word inside fillers
        ("البيت", "البيت"),  # the shorter one when only it is there
        ("الطبعة", None),  # different word: "ال" + طبعة is not طبعة (exact only)
        ("الكتابة", None),  # "كتاب" is inside it, but not as a whole word
        ("قلم", None),  # not a target word → "which word?"
        ("", None),  # nothing named
    ],
)
def test_term_resolves_to_the_longest_target_inside_it(
    term: str, resolved: str | None
) -> None:
    assert resolve_term(term, TARGETS) == resolved


def test_resolution_compares_cleaned_forms_but_returns_the_seed_spelling() -> None:
    # the seed may be written with vowel marks; the learner's text never is
    assert resolve_term("يعني طبعة", ("طَبْعَة",)) == "طَبْعَة"


def test_resolution_with_no_target_words_finds_nothing() -> None:
    assert resolve_term("طبعة", ()) is None


def test_equal_length_targets_resolve_to_the_first_listed() -> None:  # determinism
    # "باب" and "قلم": one word, three letters each; "قلم" is listed first
    assert resolve_term("باب قلم", ("قلم", "باب")) == "قلم"


def test_resolution_works_on_a_real_match() -> None:  # matcher + resolution
    found = MATCHER.match("امم، ما معنى البيت الجديد يا أستاذ؟")
    assert found is not None and found.missed_term is not None
    assert resolve_term(found.missed_term, TARGETS) == "البيت الجديد"


# --- is_hesitation(): did they say nothing? (empty input only, for now) -----


@pytest.mark.parametrize("said", ["", "   ", "…", "؟", "\n"])
def test_saying_nothing_is_hesitation(said: str) -> None:
    assert is_hesitation(said)


@pytest.mark.parametrize("said", ["لم افهم", "a", "امم"])
def test_saying_something_is_not_hesitation(said: str) -> None:
    # "امم" (a filler alone) is not covered yet; it comes with timing later
    assert not is_hesitation(said)
