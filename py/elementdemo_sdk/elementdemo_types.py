# Typed models for the Elementdemo SDK.
#
# GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
# params (op.<name>.points[].args.params[]). Field/param types come from the
# canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
# @voxgig/apidef VALID_CANON). Do not edit by hand.
#
# These are TypedDicts, not dataclasses: the SDK ops return/accept plain dicts
# at runtime, and a TypedDict IS a dict shape, so the types match the runtime.
# Optional (req:false) keys are modelled as TypedDict key-optionality
# (total=False), split into a required base + total=False subclass when a type
# has both required and optional keys.

from __future__ import annotations

from typing import TypedDict, Any


class ElementRequired(TypedDict):
    block: str
    id: str
    mass: float
    name: str
    number: int
    period: int
    series_id: str
    symbol: str


class Element(ElementRequired, total=False):
    charge: int
    discovered: int
    group: int
    ion: str
    ok: bool
    phase: str


class ElementLoadMatch(TypedDict):
    id: str


class ElementListMatch(TypedDict, total=False):
    block: str
    charge: int
    discovered: int
    group: int
    id: str
    ion: str
    mass: float
    name: str
    number: int
    ok: bool
    period: int
    phase: str
    series_id: str
    symbol: str


class ElementCreateDataRequired(TypedDict):
    block: str
    id: str
    mass: float
    name: str
    number: int
    period: int
    series_id: str
    symbol: str


class ElementCreateData(ElementCreateDataRequired, total=False):
    charge: int
    discovered: int
    group: int
    ion: str
    ok: bool
    phase: str


class ElementUpdateDataRequired(TypedDict):
    id: str


class ElementUpdateData(ElementUpdateDataRequired, total=False):
    block: str
    charge: int
    discovered: int
    group: int
    ion: str
    mass: float
    name: str
    number: int
    ok: bool
    period: int
    phase: str
    series_id: str
    symbol: str


class ElementRemoveMatch(TypedDict):
    id: str


class GroupRequired(TypedDict):
    cas: str
    id: str
    number: int


class Group(GroupRequired, total=False):
    name: str


class GroupLoadMatch(TypedDict):
    id: str


class GroupListMatch(TypedDict, total=False):
    cas: str
    id: str
    name: str
    number: int


class IsotopeRequired(TypedDict):
    element_id: str
    id: str
    mass: float
    mass_number: int
    name: str
    stable: bool


class Isotope(IsotopeRequired, total=False):
    abundance: float
    halflife: str
    mode: str
    ok: bool
    product: str
    steps: int


class IsotopeLoadMatch(TypedDict):
    element_id: str
    id: str


class IsotopeListMatch(TypedDict):
    element_id: str


class IsotopeCreateDataRequired(TypedDict):
    element_id: str
    id: str
    mass: float
    mass_number: int
    name: str
    stable: bool


class IsotopeCreateData(IsotopeCreateDataRequired, total=False):
    abundance: float
    halflife: str
    mode: str
    ok: bool
    product: str
    steps: int


class IsotopeUpdateDataRequired(TypedDict):
    element_id: str
    id: str


class IsotopeUpdateData(IsotopeUpdateDataRequired, total=False):
    abundance: float
    halflife: str
    mass: float
    mass_number: int
    mode: str
    name: str
    ok: bool
    product: str
    stable: bool
    steps: int


class IsotopeRemoveMatch(TypedDict):
    element_id: str
    id: str


class Series(TypedDict):
    color: str
    description: str
    id: str
    name: str


class SeriesLoadMatch(TypedDict):
    id: str


class SeriesListMatch(TypedDict, total=False):
    color: str
    description: str
    id: str
    name: str
