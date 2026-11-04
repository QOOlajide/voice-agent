"""Clean learner text before matching (engine spec: Normalization; decision 8).

Character lists follow CAMeL Tools (MIT licence, NYU Abu Dhabi):
`camel_tools/utils/charsets.py` (AR_DIAC_CHARSET) and
`camel_tools/utils/normalize.py` (normalize_alef_ar, normalize_alef_maksura_ar).
"""

import re
import unicodedata

# Step 2: vowel marks (tanwīn U+064B–U+064D, harakat U+064E–U+0652,
# dagger alef U+0670) plus tatwīl U+0640, which CAMeL's list does not include.
_MARKS = re.compile("[\u064b-\u0652\u0670\u0640]")

# Step 3: one mapping for every letter swap.
_LETTER_MAP = str.maketrans(
    {
        "\u0623": "\u0627",  # أ → ا
        "\u0625": "\u0627",  # إ → ا
        "\u0622": "\u0627",  # آ → ا
        "\u0671": "\u0627",  # ٱ → ا
        "\u0649": "\u064a",  # ى → ي
    }
)

# Step 4: anything that is not a letter, digit or space counts as punctuation.
_PUNCTUATION = re.compile(r"[^\w\s]")


def normalize(text: str) -> str:
    """Return `text` in the one clean form used for matching.

    Removes vowel marks and tatwīl, unifies alef forms and ى, turns punctuation
    into spaces, lowercases English, and collapses runs of spaces.
    """
    text = unicodedata.normalize("NFKC", text)  # 0. one standard form for look-alikes
    text = _MARKS.sub("", text)  # 2. remove vowel marks + tatwīl
    text = text.translate(_LETTER_MAP)  # 3. letter mapping
    text = _PUNCTUATION.sub(" ", text)  # 4. punctuation → space
    text = text.lower()  # 5. lowercase (English)
    return " ".join(text.split())  # 6. collapse spaces (and trim the ends)
