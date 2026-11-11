package core

var UtilityRegistrar func(u *Utility)

var NewBaseFeatureFunc func() Feature

var NewDebugFeatureFunc func() Feature

var NewElementcardFeatureFunc func() Feature

var NewIdempotencyFeatureFunc func() Feature

var NewMetricsFeatureFunc func() Feature

var NewPagingFeatureFunc func() Feature

var NewRatelimitFeatureFunc func() Feature

var NewRetryFeatureFunc func() Feature

var NewSecretsFeatureFunc func() Feature

var NewTestFeatureFunc func() Feature

var NewTimeoutFeatureFunc func() Feature

var NewElementEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntityBase

var NewGroupEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntityBase

var NewIsotopeEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntityBase

var NewSeriesEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntityBase

