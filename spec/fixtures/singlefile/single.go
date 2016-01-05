package single

import "path/filepath"

const Filename = "single.go"

func Ext(path string) string {
	return filepath.Ext(Filename)
}
