package handler

import (
	"encoding/json"
	"testing"
)

func TestOptionalNullableDistinguishesMissingNullAndValue(t *testing.T) {
	var request struct {
		Target OptionalNullable[float64] `json:"target"`
	}
	if err := json.Unmarshal([]byte(`{}`), &request); err != nil {
		t.Fatal(err)
	}
	if request.Target.Set {
		t.Fatal("missing field was marked as present")
	}

	if err := json.Unmarshal([]byte(`{"target":null}`), &request); err != nil {
		t.Fatal(err)
	}
	if !request.Target.Set || request.Target.Value != nil {
		t.Fatalf("null field = %#v, want present with nil value", request.Target)
	}

	if err := json.Unmarshal([]byte(`{"target":12.5}`), &request); err != nil {
		t.Fatal(err)
	}
	if !request.Target.Set || request.Target.Value == nil || *request.Target.Value != 12.5 {
		t.Fatalf("numeric field = %#v, want present value 12.5", request.Target)
	}
}
