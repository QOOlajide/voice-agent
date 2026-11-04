"""Tests for normalize (engine spec: Normalization; decisions 8 and 11)."""

import pytest

from talk_engine.normalize import normalize


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        # 1. vowel marks removed
        ("أَعِدْ", "اعد"),
        # 2. tanwīn removed
        ("كتابٌ", "كتاب"),
        # 3. tatwīl removed
        ("كتـــاب", "كتاب"),
        # 4. each alef form unified (one case per form)
        ("أعد", "اعد"),
        ("إلى", "الي"),
        ("آسف", "اسف"),
        ("ٱلكتاب", "الكتاب"),
        # 5. ى → ي
        ("معنى", "معني"),
        # 6. ة is NOT changed (decision 8)
        ("طبعة", "طبعة"),
        # 7. punctuation anywhere → space
        ("فهمت،لكن", "فهمت لكن"),
        # 8. English lowercased (the apostrophe becomes a space)
        ("I DON'T", "i don t"),
        # 9. spaces collapsed and trimmed
        (" " * 2 + "اعد" + " " * 3 + "من" + " ", "اعد من"),
        # 13. hamza stored as a separate mark
        ("\u0627\u0654عد", "اعد"),
        # 14. lam-alef ligature stored as one character
        ("\ufefb افهم", "لا افهم"),
    ],
)
def test_normalize_cases(raw: str, expected: str) -> None:
    assert normalize(raw) == expected


def test_empty_text_stays_empty() -> None:  # 10.
    assert normalize("") == ""


@pytest.mark.parametrize("junk", ["…", "؟؟ ،", "..."])
def test_punctuation_only_becomes_empty(junk: str) -> None:  # 16. crash prevention
    assert normalize(junk) == ""


@pytest.mark.parametrize("raw", ["أَعِدْ  من فضلك؟", "I DON'T", "ٱلكتاب", "\ufefb"])
def test_running_twice_changes_nothing(raw: str) -> None:  # 11.
    once = normalize(raw)
    assert normalize(once) == once


def test_full_example() -> None:  # 12. all steps together
    assert normalize("أَعِدْ  من فضلك؟") == "اعد من فضلك"
