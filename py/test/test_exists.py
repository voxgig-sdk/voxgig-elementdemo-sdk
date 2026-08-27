# Elementdemo SDK exists test

import pytest
from elementdemo_sdk import ElementdemoSDK


class TestExists:

    def test_should_create_test_sdk(self):
        testsdk = ElementdemoSDK.test(None, None)
        assert testsdk is not None
