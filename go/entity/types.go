// Typed models for the Elementdemo SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
// params (op.<name>.points[].args.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.
package entity

import (
	"encoding/json"

	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/core"
)

// Element is the typed data model for the element entity.
type Element struct {
	Block string `json:"block"`
	Charge *int `json:"charge,omitempty"`
	Discovered *int `json:"discovered,omitempty"`
	Group *int `json:"group,omitempty"`
	Id string `json:"id"`
	Ion *string `json:"ion,omitempty"`
	Mass float64 `json:"mass"`
	Name string `json:"name"`
	Number int `json:"number"`
	Ok *bool `json:"ok,omitempty"`
	Period int `json:"period"`
	Phase *string `json:"phase,omitempty"`
	SeriesId string `json:"series_id"`
	Symbol string `json:"symbol"`
}

// ElementLoadMatch is the typed request payload for Element.LoadTyped.
type ElementLoadMatch struct {
	Id string `json:"id"`
}

// ElementListMatch is the typed request payload for Element.ListTyped.
type ElementListMatch struct {
	Block *string `json:"block,omitempty"`
	Charge *int `json:"charge,omitempty"`
	Discovered *int `json:"discovered,omitempty"`
	Group *int `json:"group,omitempty"`
	Id *string `json:"id,omitempty"`
	Ion *string `json:"ion,omitempty"`
	Mass *float64 `json:"mass,omitempty"`
	Name *string `json:"name,omitempty"`
	Number *int `json:"number,omitempty"`
	Ok *bool `json:"ok,omitempty"`
	Period *int `json:"period,omitempty"`
	Phase *string `json:"phase,omitempty"`
	SeriesId *string `json:"series_id,omitempty"`
	Symbol *string `json:"symbol,omitempty"`
}

// ElementCreateData is the typed request payload for Element.CreateTyped.
type ElementCreateData struct {
	Block string `json:"block"`
	Charge *int `json:"charge,omitempty"`
	Discovered *int `json:"discovered,omitempty"`
	Group *int `json:"group,omitempty"`
	Id string `json:"id"`
	Ion *string `json:"ion,omitempty"`
	Mass float64 `json:"mass"`
	Name string `json:"name"`
	Number int `json:"number"`
	Ok *bool `json:"ok,omitempty"`
	Period int `json:"period"`
	Phase *string `json:"phase,omitempty"`
	SeriesId string `json:"series_id"`
	Symbol string `json:"symbol"`
}

// ElementUpdateData is the typed request payload for Element.UpdateTyped.
type ElementUpdateData struct {
	Id string `json:"id"`
	Block *string `json:"block,omitempty"`
	Charge *int `json:"charge,omitempty"`
	Discovered *int `json:"discovered,omitempty"`
	Group *int `json:"group,omitempty"`
	Ion *string `json:"ion,omitempty"`
	Mass *float64 `json:"mass,omitempty"`
	Name *string `json:"name,omitempty"`
	Number *int `json:"number,omitempty"`
	Ok *bool `json:"ok,omitempty"`
	Period *int `json:"period,omitempty"`
	Phase *string `json:"phase,omitempty"`
	SeriesId *string `json:"series_id,omitempty"`
	Symbol *string `json:"symbol,omitempty"`
}

// ElementRemoveMatch is the typed request payload for Element.RemoveTyped.
type ElementRemoveMatch struct {
	Id string `json:"id"`
}

// Group is the typed data model for the group entity.
type Group struct {
	Cas string `json:"cas"`
	Id string `json:"id"`
	Name *string `json:"name,omitempty"`
	Number int `json:"number"`
}

// GroupLoadMatch is the typed request payload for Group.LoadTyped.
type GroupLoadMatch struct {
	Id string `json:"id"`
}

// GroupListMatch is the typed request payload for Group.ListTyped.
type GroupListMatch struct {
	Cas *string `json:"cas,omitempty"`
	Id *string `json:"id,omitempty"`
	Name *string `json:"name,omitempty"`
	Number *int `json:"number,omitempty"`
}

// Isotope is the typed data model for the isotope entity.
type Isotope struct {
	Abundance *float64 `json:"abundance,omitempty"`
	ElementId string `json:"element_id"`
	Halflife *string `json:"halflife,omitempty"`
	Id string `json:"id"`
	Mass float64 `json:"mass"`
	MassNumber int `json:"mass_number"`
	Mode *string `json:"mode,omitempty"`
	Name string `json:"name"`
	Ok *bool `json:"ok,omitempty"`
	Product *string `json:"product,omitempty"`
	Stable bool `json:"stable"`
	Steps *int `json:"steps,omitempty"`
}

// IsotopeLoadMatch is the typed request payload for Isotope.LoadTyped.
type IsotopeLoadMatch struct {
	ElementId string `json:"element_id"`
	Id string `json:"id"`
}

// IsotopeListMatch is the typed request payload for Isotope.ListTyped.
type IsotopeListMatch struct {
	ElementId string `json:"element_id"`
}

// IsotopeCreateData is the typed request payload for Isotope.CreateTyped.
type IsotopeCreateData struct {
	ElementId string `json:"element_id"`
	Abundance *float64 `json:"abundance,omitempty"`
	Halflife *string `json:"halflife,omitempty"`
	Id string `json:"id"`
	Mass float64 `json:"mass"`
	MassNumber int `json:"mass_number"`
	Mode *string `json:"mode,omitempty"`
	Name string `json:"name"`
	Ok *bool `json:"ok,omitempty"`
	Product *string `json:"product,omitempty"`
	Stable bool `json:"stable"`
	Steps *int `json:"steps,omitempty"`
}

// IsotopeUpdateData is the typed request payload for Isotope.UpdateTyped.
type IsotopeUpdateData struct {
	ElementId string `json:"element_id"`
	Id string `json:"id"`
	Abundance *float64 `json:"abundance,omitempty"`
	Halflife *string `json:"halflife,omitempty"`
	Mass *float64 `json:"mass,omitempty"`
	MassNumber *int `json:"mass_number,omitempty"`
	Mode *string `json:"mode,omitempty"`
	Name *string `json:"name,omitempty"`
	Ok *bool `json:"ok,omitempty"`
	Product *string `json:"product,omitempty"`
	Stable *bool `json:"stable,omitempty"`
	Steps *int `json:"steps,omitempty"`
}

// IsotopeRemoveMatch is the typed request payload for Isotope.RemoveTyped.
type IsotopeRemoveMatch struct {
	ElementId string `json:"element_id"`
	Id string `json:"id"`
}

// Series is the typed data model for the series entity.
type Series struct {
	Color string `json:"color"`
	Description string `json:"description"`
	Id string `json:"id"`
	Name string `json:"name"`
}

// SeriesLoadMatch is the typed request payload for Series.LoadTyped.
type SeriesLoadMatch struct {
	Id string `json:"id"`
}

// SeriesListMatch is the typed request payload for Series.ListTyped.
type SeriesListMatch struct {
	Color *string `json:"color,omitempty"`
	Description *string `json:"description,omitempty"`
	Id *string `json:"id,omitempty"`
	Name *string `json:"name,omitempty"`
}

// asMap turns a typed request/data struct into the map[string]any the
// runtime op pipeline consumes, honouring the json tags above.
func asMap(v any) map[string]any {
	out := map[string]any{}
	b, err := json.Marshal(v)
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out)
	return out
}

// entityData unwraps an entity to its data map.
//
// Operations resolve to the ENTITY, not the raw data (see AGENTS.md), and an
// entity's fields are UNEXPORTED — marshalling one directly yields `{}`, so
// every typed accessor would silently hand back a zero-valued struct. The
// typed boundary therefore takes the data hop first.
func entityData(v any) any {
	if ent, ok := v.(core.Entity); ok {
		return ent.Data()
	}
	return v
}

// typedFrom decodes a runtime value (an entity, or the map[string]any the op
// pipeline produced) into a typed model T via a JSON round-trip. On any error
// it returns the zero value of T; the op's own (value, error) tuple carries
// the real error.
func typedFrom[T any](v any) T {
	var out T
	v = entityData(v)
	if v == nil {
		return out
	}
	b, err := json.Marshal(v)
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out)
	return out
}

// typedSliceFrom decodes a runtime list value into a typed slice []T via a
// JSON round-trip, for list ops. `list` resolves to a slice of ENTITY
// instances, so each element takes the data hop.
func typedSliceFrom[T any](v any) []T {
	var out []T
	if v == nil {
		return out
	}
	if list, ok := v.([]any); ok {
		unwrapped := make([]any, 0, len(list))
		for _, item := range list {
			unwrapped = append(unwrapped, entityData(item))
		}
		v = unwrapped
	}
	b, err := json.Marshal(v)
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out)
	return out
}
