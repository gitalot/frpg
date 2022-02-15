# About

A frp gui app.

- Go + webview
- html+css+javascript

# compile

- macos

  ```shell
  mkdir -p build/frpg.app/Contents/{MacOS,Resources}
  cp -a web frp build/frpg.app/Contents/MacOS/
  mkdir -p build/frpg.app/Contents/MacOS/frp/confs
  cd src
  go build -o ../build/frpg.app/Contents/MacOS/frpg
  cd ..
  mkdir build/frpg.apps/Contents/MacOS/frp/confs
  open build/frpg.app/Contents/MacOS
  ```


- linux

  ```shell
  mkdir build/linux
  cp -a src/web build/linux
  cd src
  go build -o ../build/linux/frpg
  cd ..
  mkdir build/linux/confs
  xdg-open build/linux
  ```


- windows

    - Go
    - [tdm-gcc](https://jmeubank.github.io/tdm-gcc/download/) **tdm64-gcc.exe**.

  ```powershell
  mkdir -p build/windows/
  cp -r src/web build/windows/
  cd src
  go build -ldflags="-H windowsgui" -o ../build/windows/frpg.exe
  cd ..
  mkdir -p build/windows/frp/confs
  start build/windows
  ```

# Usage

Double click to run `frpg`(linux) /  `frpg.app`(macos) / `frpg.exe`(windows).

or Command line

- Windows

  ```powershell
  ./frpg.exe
  ```


- Linux

  ```shell
  ./frpg
  ```


- MacOS

  ```shell
  ./frpg.app/Contents/MacOS/frpg
  ```

# todo

- [ ] 支持frps，当前仅frpc
- [ ] frp进程管理，避免重复启动
- [ ] 重启frp服务
- [ ] 简单的ini配置文件可视化编辑工具？
- [ ] 指定启动模式（仅web模式、仅GUI模式，当前为二者均启用）
- [ ] frp ini配置文件导入和多目录指定
- [ ] systray集成
- [ ] 启用了GUI的情况下，退出GUI服务自动检测和终止其启动多frp进程

# 绑定调用和数据传递

Go中调用JS：使用webview的Eval(“js code string”)

JS中调用Go：先在Go中使用webview的Bind()创建一个可供JS调用的函数，然后在JS中调用即可。

在GO

```go
w.Bind("FnForJS", func (dataFromJs string) {
//some code
}
```

在JS

```shell
FnForJS('hello')
```

在Go和JS中来回传递数据：

JS –> Go –> JS ：在JS中调用Bind的函数将数据传递给Go；在Go中对应的Bond函数中处理传入的参数数据，然后调用Eval()执行JS代码传递数据给JS

- 在go中

   ```go
   w := webview.New()
   
   //通过webview的Bind()创建一个函数 供js调用
   w.Bind("GoBindFn1", func(dataFromJs string) {
     fmt.Println(dataFromJs) //处理js中调用GoBindFn1时传递的参数
     
     //如果需要将处理的数据传送给js处理，可以直接调用js的函数，将数据作为参数传递
     w.Eval(jsFn(data2)) //eval调用js的函数，将数据作为参数传递给js的函数
   })
   ```

- 在js中

   ```javascript
   function jsFn(dataFromGo){
   	JSON.parse(dataFromGo)  //Go中通过eval即可将数据传递给该函数处理
   }
   
   GoBindFn1("data from JS")  //调用Go中为js Bind的函数，可以将数据作为参数传递给Go
   ```

Go –> JS –> Go ：在Go调用Eval()执行JS函数传递给JS；在JS中对应的函数中处理传入的参数数据，然后调用Go中的Bind的函数传递数据给Go

- 在Go中

  ```go
  w := webview.New()
  
  //通过webview的Bind()创建一个函数 供js调用
  w.Bind("GoBindFn1", func(dataFromJs string) {
    fmt.Println(dataFromJs) //处理js中调用GoBindFn1时传递的参数
    
    //如果需要将处理的数据传送给js处理，可以直接调用js的函数，将数据作为参数传递
  })
  
  w.Eval(jsFn(data2)) //eval调用js的函数，将数据作为参数传递给js的函数
  ```

- 在js中

  ```javascript
  function jsFn(dataFromGo){
    //注意 eval传递过来的为字符串，js中应当进行处理
  	JSON.parse(dataFromGo)  //Go中通过eval即可将数据传递给该函数处理
    GoBindFn1("data from JS")  //调用Go中为js Bind的函数，可以将数据作为参数传递给Go
  }
  ```

