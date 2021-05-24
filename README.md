

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