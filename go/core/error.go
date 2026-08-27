package core

type ElementdemoError struct {
	IsElementdemoError bool
	Sdk              string
	Code             string
	Msg              string
	Ctx              *Context
	Result           any
	Spec             any
}

func NewElementdemoError(code string, msg string, ctx *Context) *ElementdemoError {
	return &ElementdemoError{
		IsElementdemoError: true,
		Sdk:              "Elementdemo",
		Code:             code,
		Msg:              msg,
		Ctx:              ctx,
	}
}

func (e *ElementdemoError) Error() string {
	return e.Msg
}
