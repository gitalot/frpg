package main

import (
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
)

var FrpcPath string = ""
var FrpsPath string = ""

type ConfInfo struct {
	Id      int      `json:"id"`      //conf index num
	Name    string   `json:"name"`    //conf name
	Running bool     `json:"running"` //true/false
	path    string   //conf path
	channel chan int //channel for running frp
}

//conf map
var frpConfList = make(map[string]*ConfInfo, 1)

//stop frp
func stopfrp(confId string) {
	<-frpConfList[confId].channel
}

//list frp ini files
func listfrpConfs(frpConfDir string) {
	fileListInfo, _ := os.ReadDir(frpConfDir)
	// fileList := make([]string, 1)
	frpConfList = make(map[string]*ConfInfo, 1)
	for index, fileInfo := range fileListInfo {
		fileName := fileInfo.Name()
		if path.Ext(fileName) != ".ini" {
			continue
		}
		frpConfList[strconv.Itoa(index)] = &ConfInfo{
			Id:      index,
			Name:    strings.Replace(fileName, ".ini", "", 1),
			Running: false,
			path:    frpConfDir + "/" + fileName,
		}
	}
}

func runfrp(confId string) {
	frpTaskInfo := frpConfList[confId]
	frpConfFile := frpTaskInfo.path

	if frpTaskInfo.channel == nil {
		frpConfList[confId].channel = make(chan int)
	}
	channel := frpConfList[confId].channel

	cmd := exec.Command(FrpcPath, "-c", frpConfFile)
	cmd.Start()

	frpConfList[confId].Running = true

	go func() {
		channel <- cmd.Process.Pid
		cmd.Process.Kill()
		cmd.Wait()
		frpConfList[confId].Running = false
	}()
}

func checkfrp(frpFile string) string {
	filePath, err := exec.LookPath(frpFile)
	if err != nil {
		filePath = "frp/" + frpFile //内置path
	}
	return filePath
}

func init() {
	FrpcPath = checkfrp("frpc")
	FrpsPath = checkfrp("frps")
}
