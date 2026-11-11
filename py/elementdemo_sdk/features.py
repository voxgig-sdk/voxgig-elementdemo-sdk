# Elementdemo SDK feature factory

from elementdemo_sdk.feature.base_feature import ElementdemoBaseFeature
from elementdemo_sdk.feature.debug_feature import ElementdemoDebugFeature
from elementdemo_sdk.feature.elementcard_feature import ElementdemoElementcardFeature
from elementdemo_sdk.feature.idempotency_feature import ElementdemoIdempotencyFeature
from elementdemo_sdk.feature.metrics_feature import ElementdemoMetricsFeature
from elementdemo_sdk.feature.paging_feature import ElementdemoPagingFeature
from elementdemo_sdk.feature.ratelimit_feature import ElementdemoRatelimitFeature
from elementdemo_sdk.feature.retry_feature import ElementdemoRetryFeature
from elementdemo_sdk.feature.secrets_feature import ElementdemoSecretsFeature
from elementdemo_sdk.feature.test_feature import ElementdemoTestFeature
from elementdemo_sdk.feature.timeout_feature import ElementdemoTimeoutFeature


_FEATURES = {
    "base": lambda: ElementdemoBaseFeature(),
    "debug": lambda: ElementdemoDebugFeature(),
    "elementcard": lambda: ElementdemoElementcardFeature(),
    "idempotency": lambda: ElementdemoIdempotencyFeature(),
    "metrics": lambda: ElementdemoMetricsFeature(),
    "paging": lambda: ElementdemoPagingFeature(),
    "ratelimit": lambda: ElementdemoRatelimitFeature(),
    "retry": lambda: ElementdemoRetryFeature(),
    "secrets": lambda: ElementdemoSecretsFeature(),
    "test": lambda: ElementdemoTestFeature(),
    "timeout": lambda: ElementdemoTimeoutFeature(),
}


def _make_feature(name):
    factory = _FEATURES.get(name)
    if factory is not None:
        return factory()
    return _FEATURES["base"]()


# True when this SDK was generated with the named feature class - the
# constructor's tolerance for extend-carried features reads this (an
# active name with no generated class must not become a BaseFeature
# stray when an extend instance carries it).
def _has_feature(name):
    return name in _FEATURES
