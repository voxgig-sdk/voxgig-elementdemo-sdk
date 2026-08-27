# Elementdemo SDK utility: make_context

from projectname_sdk.core.context import ElementdemoContext


def make_context_util(ctxmap, basectx):
    return ElementdemoContext(ctxmap, basectx)
