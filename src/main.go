package main

import (
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/webview/webview"
)

func main() {
	execFile, _ := os.Executable()
	appDir, _ := filepath.EvalSymlinks(filepath.Dir(execFile))

	tmpDir, _ := filepath.EvalSymlinks(os.TempDir())
	if strings.Contains(appDir, tmpDir) {
		_, appFile, _, _ := runtime.Caller(0)
		appDir = path.Dir(appFile)
	}

	url, api := startServer(appDir)

	debug := true
	w := webview.New(debug)
	defer w.Destroy()

	w.SetTitle("frpg app")
	w.SetSize(460, 620, webview.HintNone)
	w.Navigate(url)

	//Injection of global variables for js
	initJS := "const api=\"" + api + "\""
	w.Init(initJS)
	w.Run()
}
