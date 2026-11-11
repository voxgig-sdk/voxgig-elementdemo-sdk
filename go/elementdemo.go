package voxgigelementdemosdk

import (
	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/core"
	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/entity"
	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/feature"
	_ "github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/utility"
)

// Type aliases preserve external API.
type ElementdemoSDK = core.ElementdemoSDK
type Context = core.Context
type Utility = core.Utility
type Feature = core.Feature
type Entity = core.Entity
type ElementdemoEntityBase = core.ElementdemoEntityBase

// Deprecated: use ElementdemoEntityBase.
type ElementdemoEntity = core.ElementdemoEntityBase

type StreamItem = core.StreamItem
type FetcherFunc = core.FetcherFunc
type Spec = core.Spec
type Result = core.Result
type Response = core.Response
type Operation = core.Operation
type Control = core.Control
type ElementdemoError = core.ElementdemoError

// BaseFeature from feature package.
type BaseFeature = feature.BaseFeature

func init() {
	core.NewBaseFeatureFunc = func() core.Feature {
		return feature.NewBaseFeature()
	}
	core.NewDebugFeatureFunc = func() core.Feature {
		return feature.NewDebugFeature()
	}
	core.NewElementcardFeatureFunc = func() core.Feature {
		return feature.NewElementcardFeature()
	}
	core.NewIdempotencyFeatureFunc = func() core.Feature {
		return feature.NewIdempotencyFeature()
	}
	core.NewMetricsFeatureFunc = func() core.Feature {
		return feature.NewMetricsFeature()
	}
	core.NewPagingFeatureFunc = func() core.Feature {
		return feature.NewPagingFeature()
	}
	core.NewRatelimitFeatureFunc = func() core.Feature {
		return feature.NewRatelimitFeature()
	}
	core.NewRetryFeatureFunc = func() core.Feature {
		return feature.NewRetryFeature()
	}
	core.NewSecretsFeatureFunc = func() core.Feature {
		return feature.NewSecretsFeature()
	}
	core.NewTestFeatureFunc = func() core.Feature {
		return feature.NewTestFeature()
	}
	core.NewTimeoutFeatureFunc = func() core.Feature {
		return feature.NewTimeoutFeature()
	}
	core.NewElementEntityFunc = func(client *core.ElementdemoSDK, entopts map[string]any) core.ElementdemoEntityBase {
		return entity.NewElementEntity(client, entopts)
	}
	core.NewGroupEntityFunc = func(client *core.ElementdemoSDK, entopts map[string]any) core.ElementdemoEntityBase {
		return entity.NewGroupEntity(client, entopts)
	}
	core.NewIsotopeEntityFunc = func(client *core.ElementdemoSDK, entopts map[string]any) core.ElementdemoEntityBase {
		return entity.NewIsotopeEntity(client, entopts)
	}
	core.NewSeriesEntityFunc = func(client *core.ElementdemoSDK, entopts map[string]any) core.ElementdemoEntityBase {
		return entity.NewSeriesEntity(client, entopts)
	}
}

// Constructor re-exports.
var NewElementdemoSDK = core.NewElementdemoSDK
var TestSDK = core.TestSDK
var NewContext = core.NewContext
var NewSpec = core.NewSpec
var NewResult = core.NewResult
var NewResponse = core.NewResponse
var NewOperation = core.NewOperation
var MakeConfig = core.MakeConfig
var SharedConfig = core.SharedConfig

// No-arg convenience constructors. Go has no default-argument syntax,
// so these aliases let callers write `sdk.New()` / `sdk.Test()`
// instead of `sdk.NewElementdemoSDK(nil)` / `sdk.TestSDK(nil, nil)`
// for the common no-options case.
func New() *ElementdemoSDK  { return NewElementdemoSDK(nil) }
func Test() *ElementdemoSDK { return TestSDK(nil, nil) }
var NewBaseFeature = feature.NewBaseFeature
var NewDebugFeature = feature.NewDebugFeature
var NewElementcardFeature = feature.NewElementcardFeature
var NewIdempotencyFeature = feature.NewIdempotencyFeature
var NewMetricsFeature = feature.NewMetricsFeature
var NewPagingFeature = feature.NewPagingFeature
var NewRatelimitFeature = feature.NewRatelimitFeature
var NewRetryFeature = feature.NewRetryFeature
var NewSecretsFeature = feature.NewSecretsFeature
var NewTestFeature = feature.NewTestFeature
var NewTimeoutFeature = feature.NewTimeoutFeature
