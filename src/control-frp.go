package main

import (
	"fmt"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
	"syscall"
)

var frpcPath string
var frpsPath string

type ConfInfo struct {
	Id      int    `json:"id"`      //conf index num
	Name    string `json:"name"`    //conf name
	Running bool   `json:"running"` //true/false
	Pid     int    `json:"pid"`
	Path    string //conf path
	// channel chan int //channel for rtunning frp
}

//conf map
var frpConfList map[string]*ConfInfo

//list frp ini files
func listfrpConfs(frpConfDir string) {
	fileListInfo, _ := os.ReadDir(frpConfDir)
	frpConfList = make(map[string]*ConfInfo, len(fileListInfo))
	for index, fileInfo := range fileListInfo {
		fileName := fileInfo.Name()
		if path.Ext(fileName) != ".ini" {
			continue
		}
		frpConfList[strconv.Itoa(index)] = &ConfInfo{
			Id:      index,
			Name:    strings.Replace(fileName, ".ini", "", 1),
			Running: false,
			Pid:     0,
			Path:    frpConfDir + "/" + fileName,
		}
	}
}

func frpRun(confId string) {
	frpConfFile := frpConfList[confId].Path

	cmd := exec.Command(frpcPath, "-c", frpConfFile)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: false}
	cmd.Start()

	frpConfList[confId].Running = true
	frpConfList[confId].Pid = cmd.Process.Pid
	fmt.Println("[frp info]", "pid:", cmd.Process.Pid, " conf:", frpConfFile)
}

//stop frp
func frpStop(confId string) {
	process, _ := os.FindProcess(frpConfList[confId].Pid)
	process.Kill()
	frpConfList[confId].Running = false
	process.Wait()
}

//stop all
func stopfrpAll() {
	for k, v := range frpConfList {
		if v.Running {
			frpStop(k)
		}
	}
}

func checkfrp(frpFile string) string {
	filePath, err := exec.LookPath(frpFile)
	if err != nil {
		filePath = "frp/" + frpFile //内置path
	}
	return filePath
}

func init() {
	frpcPath = checkfrp("frpc")
	frpsPath = checkfrp("frps")
}
