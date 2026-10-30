"""Smoke test: the engine is installed as a package and importable."""

from importlib.metadata import version

import talk_engine


def test_engine_is_importable_as_installed_package() -> None:
    assert talk_engine.__doc__ is not None
    assert version("talk-engine") == "0.1.0"
