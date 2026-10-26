package pkg

import (
	"testing"

	v1 "k8s.io/api/core/v1"
)

func TestIsSchedulable(t *testing.T) {
	worker := &v1.Node{}
	controlPlane := &v1.Node{Spec: v1.NodeSpec{Taints: []v1.Taint{{Key: "node-role.kubernetes.io/control-plane", Effect: v1.TaintEffectNoSchedule}}}}
	cordoned := &v1.Node{Spec: v1.NodeSpec{Unschedulable: true}}
	preferNoSchedule := &v1.Node{Spec: v1.NodeSpec{Taints: []v1.Taint{{Key: "x", Effect: v1.TaintEffectPreferNoSchedule}}}}
	for name, tc := range map[string]struct {
		node *v1.Node
		want bool
	}{"worker": {worker, true}, "control plane": {controlPlane, false}, "cordoned": {cordoned, false}, "soft taint": {preferNoSchedule, true}} {
		if got := isSchedulable(tc.node); got != tc.want {
			t.Errorf("%v: isSchedulable = %v, want %v", name, got, tc.want)
		}
	}
}
