package main

import (
	"fmt"
	"net"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

type confIds struct {
	Ids []string `json:"ids"`
}

func serverAPI(workdir string, addr string) {
	webRoot := workdir + "/web"
	frpConfDir := workdir + "/frp/confs"

	gin.SetMode(gin.ReleaseMode) //set production mode
	//
	r := gin.Default()
	//static server for static resources
	r.Use(static.Serve("/", static.LocalFile(webRoot, false)))

	//list frp conf list
	r.GET("/api/frpConfs", func(c *gin.Context) {
		listfrpConfs(frpConfDir)
		c.JSON(200, gin.H{
			"confs": frpConfList,
		})
	})

	// run or stop frp
	// action: run | stop
	r.POST("/api/frp:action", func(c *gin.Context) {
		action := c.Param("action")

		if action == "stopAll" {
			for k, v := range frpConfList {
				if v.Running {
					stopfrp(k)
				}
			}
		} else {
			actionFn := runfrp //action==run
			if action == "stop" {
				actionFn = stopfrp
			}
			var ids confIds
			c.ShouldBind(&ids)
			for _, val := range ids.Ids {
				actionFn(val)
				fmt.Println(val)
			}
		}

		c.JSON(200, gin.H{
			"status": "0",
			"msg":    "",
		})
	})

	//open conf dir
	r.GET("/api/confDir", func(c *gin.Context) {
		openOsFileManager(frpConfDir)
		c.JSON(200, gin.H{
			"msg": "ok",
		})
	})

	r.Run(addr) // listen and serve on 0.0.0.0:8080
}

func startServer(workdir string) (string, string) {
	host := "127.0.0.1"
	port := "59999"
	addr := host + ":" + port
	api := addr + "/api"

	con, err := net.DialTimeout("tcp", net.JoinHostPort(host, port), 1)
	if err == nil {
		con.Close()
	} else {
		go serverAPI(workdir, addr)
	}
	return "http://" + addr, "http://" + api
}
