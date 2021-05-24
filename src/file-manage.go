package main

import (
	"os/exec"
	"runtime"
)

func openOsFileManager(dirPath string) {
	commands := map[string]string{
		"windows": "start", //cmd.exe /c
		"darwin":  "open",
		"linux":   "xdg-open",
	}
	osType := runtime.GOOS
	cmd := exec.Command(commands[osType], dirPath)
	cmd.Run()
}
