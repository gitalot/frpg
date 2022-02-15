package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/webview/webview"
)

var debug = true

//todo
func readAppConfig(confFile string) string {
	if confFile == "" {
		confFile = "./config.ini"
	}
	content, _ := ioutil.ReadFile(confFile)

	fmt.Println(content)
	return ""
}

func getWorkdir() string {
	execFile, _ := os.Executable()
	appDir, _ := filepath.EvalSymlinks(filepath.Dir(execFile))

	tmpDir, _ := filepath.EvalSymlinks(os.TempDir())
	if strings.Contains(appDir, tmpDir) {
		_, appFile, _, _ := runtime.Caller(0)
		appDir = path.Dir(appFile)
	}
	return appDir
}

func main() {
	appDir := getWorkdir()

	w := webview.New(debug)
	defer w.Destroy()

	w.SetTitle("frpg app")
	w.SetSize(460, 620, webview.HintNone)
	w.Navigate("file://" + appDir + "/frontend/index.html")

	frpConfDir := appDir + "/frp/confs"

	w.Bind("bind_getConfList", func() {
		listfrpConfs(frpConfDir)

		jsFn := "generateConfList"
		confList, _ := json.Marshal(frpConfList)
		jsParam := string(confList)
		jscode := fmt.Sprintf("%s('%s')", jsFn, jsParam)
		w.Eval(jscode)
	})

	w.Bind("bind_frpCtrl", func(confId string, action string) {
		fmt.Println("[frp control]   id: ", confId, "  action: ", action)
		if action == "run" {
			frpRun(confId)
		} else if action == "stop" {
			frpStop(confId)
		} else if action == "stopAll" {
			stopfrpAll()
			//todo 是否传回状态
		}

		// jsFn := "generateConfList"
		// confList, _ := json.Marshal(frpConfList)
		// jsParam := string(confList)
		// jscode := fmt.Sprintf("%s('%s')", jsFn, jsParam)
		// w.Eval(jscode)
	})

	w.Bind("bind_openConfDir", func() {
		commands := map[string]string{
			"windows": "start", //cmd.exe /c
			"darwin":  "open",
			"linux":   "xdg-open",
		}
		cmd := exec.Command(commands[runtime.GOOS], frpConfDir)
		cmd.Run()
	})

	//get js output
	w.Bind("jslog", func(info string) {
		fmt.Println(info)
	})

	w.Run()
}
