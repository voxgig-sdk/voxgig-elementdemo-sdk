package core

var UtilityRegistrar func(u *Utility)

var NewBaseFeatureFunc func() Feature

var NewElementcardFeatureFunc func() Feature

var NewRetryFeatureFunc func() Feature

var NewTestFeatureFunc func() Feature

var NewTimeoutFeatureFunc func() Feature

var NewElementEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntity

var NewGroupEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntity

var NewIsotopeEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntity

var NewSeriesEntityFunc func(client *ElementdemoSDK, entopts map[string]any) ElementdemoEntity

