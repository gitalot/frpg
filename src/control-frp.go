package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"strings"
	"syscall"
)

var frpcPath string
var frpsPath string

type ConfInfo struct {
	md5     string `json:"md5"`
	Name    string `json:"name"`    //conf name
	Running bool   `json:"running"` //true/false
	Pid     int    `json:"pid"`
	Path    string //conf path
}

//conf map
var frpConfList map[string]*ConfInfo

func getMd5(filePath string) string {
	f, _ := os.Open(filePath)
	defer f.Close()
	h := md5.New()
	io.Copy(h, f)
	return hex.EncodeToString(h.Sum(nil))
}

//list frp ini files
func listfrpConfs(frpConfDir string) {
	fileListInfo, _ := os.ReadDir(frpConfDir)

	if frpConfList == nil {
		frpConfList = make(map[string]*ConfInfo, len(fileListInfo))
	}

	for _, fileInfo := range fileListInfo {
		fileName := fileInfo.Name()
		if path.Ext(fileName) != ".ini" {
			continue
		}

		filePath := frpConfDir + "/" + fileName
		md5Str := getMd5(frpConfDir + "/" + fileName)

		if _, ok := frpConfList[md5Str]; ok {
			continue
		}

		frpConfList[md5Str] = &ConfInfo{
			md5:     md5Str,
			Name:    strings.Replace(fileName, ".ini", "", 1),
			Running: false,
			Pid:     0,
			Path:    filePath,
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
