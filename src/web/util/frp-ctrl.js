let allConfs = new Set()
let selectedConfs = new Set() //conf items which are selected
const runningConfs = new Set() //conf items which are running

//node obj
// const confSubMenu = document.getElementById('item-setting-menu')
const confConfigArea = document.getElementById('conf-config-area')
const selectAllConfBtn = document.getElementById("select-all-conf-btn")
const confListEle = document.getElementById('conf-list')


//frpState={'1':'running'}  //index:state
const frpState = new Proxy({}, {
  set(obj, prop, val) {
    let [disableBtnName, showBtnName] = ['run', 'stop']
    if (val === 'stop') {
      [disableBtnName, showBtnName] = ['stop', 'run']
    }

    const itemNum = Number(prop)
    const targetItemEle = document.getElementById(`conf-item-${itemNum}`)

    targetItemEle.querySelector(`button[name=${disableBtnName}]`).disabled = true
    targetItemEle.querySelector(`button[name=${showBtnName}]`).disabled = false
  }
})

//generate conf list
function generateConfList(confsInfo) {
  let HTML = ''
  for (const key in confsInfo) {
    const name = confsInfo[key].name
    const isRunning = confsInfo[key].running
    //record the conf index as confId
    HTML += `<li id="conf-item-${key}" data-conf-id="${key}">
    <div data-conf-id="${key}">
      <input type="checkbox" name="select" id="item-checkbox-${key}">
      <label for="item-checkbox-${key}">${name}</label>
    </div>
    <div data-conf-id="${key}">
      <button type="button" name="run" class="iconfont icon-run" title="Run" data-i18n="run" ${isRunning ? "disabled"
        : ""}></button>
      <button type="button" name="stop" class="iconfont icon-stop" title="Stop" data-i18n="stop" ${isRunning ? ""
        : "disabled"}></button>
    </div>
  </li>`
  }
  confListEle.innerHTML = HTML
  // transText(["run", "stop", "more"])
}

//get frp confs info
async function getFrpConfs() {
  const res = await fetch(`${api}/frpConfs`)
  const data = await res.json()
  generateConfList(data.confs)
  allConfs = new Set(Object.keys(data.confs))
}

//event handlers of frp conf list ele
const frpCtrl = {
  select(isSelected, confId) {
    if (isSelected) {
      selectedConfs.add(confId)
    } else {
      selectedConfs.delete(confId)
    }

    if (selectedConfs.size === allConfs.size) {
      selectAllConfBtn.checked = true
    } else if (selectedConfs.size === 0) {
      selectAllConfBtn.checked = false
    }
  },
  setting(event, confId = null) {
    const isMenuHidden = confSubMenu.hidden
    if (isMenuHidden === true) {
      const [posX, posY] = [event.clientX, event.clientY]
      confSubMenu.setAttribute('style', `left:${posX}px;top:${posY}px;transform:translateX(-100%);`)
    }
    //show/hide setting submenu
    confSubMenu.hidden = !isMenuHidden
  },
  //{action:"",confIds:[]}
  //action: "run" | "stop"
  //confIds: string | set() | array
  run_stop: async (info) => {
    let action = info.action
    let confIds = []
    if (action !== 'stopAll') {
      confIds = info.confIds
      if (!(confIds instanceof Array)) {
        confIds = Array.from(confIds)
      }
    }

    const res = await fetch(`${api}/frp${action}`, {
      method: "POST",
      body: JSON.stringify({ "ids": confIds }),
      headers: { "Content-Type": "application/json" }
    })

    // const data = await res.json()
    if (action === "stopAll") {
      await getFrpConfs()
      return
    }

    for (const id of confIds) {
      frpState[id] = action
    }
  }
}

//click event listener for frp conf item
confListEle.addEventListener('click', e => {
  const eleName = e.target.name // run | stop | setting
  const confsInfo = e.target.parentNode.dataset
  switch (eleName) {
    case "run": case "stop":
      frpCtrl.run_stop({ action: eleName, confIds: confsInfo.confId })
      break;
    case "setting":
      // frpCtrl.setting(e, confsInfo.confId)
      break;
    case "select":
      frpCtrl.select(e.target.checked, confsInfo.confId)
      break;
    default:
      break;
  }
})


//select or unselect all conf items
selectAllConfBtn.addEventListener('click', e => {
  const checkboxes = confListEle.querySelectorAll("input[type=checkbox]")
  for (const checkbox of checkboxes) {
    if (checkbox.checked === e.target.checked) continue
    checkbox.click()
  }
})

confConfigArea.addEventListener('click', (e) => {
  switch (e.target.name) {
    case 'confs-folder':
      (async () => {
        const res = await fetch(`${api}/confDir`)
        if (!res.ok) {
          console.log(res)
        }
      })()
      break;
    case 'confs-refresh':
      getFrpConfs()
      break;

    default:
      break;
  }
})


//底部
//settings
document.getElementById("settings").addEventListener('click',()=>{
  console.log("todo 设置")
})

//run selected items
document.getElementById("run").addEventListener('click',()=>{
  frpCtrl.run_stop({action:"run",confIds:Array.from(selectedConfs)})
})

//stop all
document.getElementById("stop").addEventListener('click', () => {
  frpCtrl.run_stop({ action: "stopAll" })
})



//get and generate conf list when loaded
document.addEventListener('DOMContentLoaded',getFrpConfs)