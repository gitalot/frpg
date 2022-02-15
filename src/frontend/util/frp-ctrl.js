let allConfs = new Set()
let selectedConfs = new Set() //conf items which are selected
const runningConfs = new Set() //conf items which are running

const confConfigArea = document.getElementById('conf-list-control-panel')
const selectAllConfBtn = document.getElementById("select-all-conf-btn")
const confListEle = document.getElementById('conf-list')


//todo 是否可以通过eval更新frpState信息

//frpState={'1':'running'}  //index:state
const frpState = new Proxy({}, {
    set(obj, prop, val) {
        let [disableBtnName, showBtnName] = ['run', 'stop']
        if (val === 'stop') {
            [disableBtnName, showBtnName] = ['stop', 'run']
        }
        const targetItemEle = document.querySelector('#conf-item-' + prop)

        targetItemEle.querySelector(`button[name=${disableBtnName}]`).disabled = true
        targetItemEle.querySelector(`button[name=${showBtnName}]`).disabled = false
    }
})

//generate conf list
function generateConfList(confsInfo) {
    confsInfo = JSON.parse(confsInfo)
    allConfs = new Set(Object.keys(confsInfo))

    let HTML = ''
    for (const key in confsInfo) {
        const name = confsInfo[key].name
        const isRunning = confsInfo[key].running
        //record the conf index as confId
        //"${selectedConfs.has(key)?'checked':''}"
        HTML += `<li id="conf-item-${key}" data-conf-id="${key}">
    <div data-conf-id="${key}">
      <input type="checkbox" name="select" id="item-checkbox-${key}" >
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
    run(confId) {
        frpState[confId] = 'running'
        // runningConfs.add(confId)
        bind_frpCtrl(confId, 'run')
    },
    stop(confId) {
        frpState[confId] = 'stop'
        // runningConfs.delete(confId)
        bind_frpCtrl(confId, 'stop')
    }
}

//click event listener for frp conf item
confListEle.addEventListener('click', e => {
    const eleName = e.target.name // run | stop | setting
    const confId = e.target.parentNode.dataset.confId
    switch (eleName) {
        case "run":
            frpCtrl.run(confId)
            break;
        case "stop":
            frpCtrl.stop(confId)
            break;
        case "setting":
            // frpCtrl.setting(e, confsInfo.confId)
            break;
        case "select":
            frpCtrl.select(e.target.checked, confId)
            break;
        default:
            break;
    }
})

//stop all running items
document.getElementById("stop-all").addEventListener('click', () => {
    //todo 一种是停止所有，一种是停止选中的
    bind_frpCtrl('0', 'stopAll')
    bind_getConfList() //刷新状态
})

//run all selected items
document.getElementById("run-all").addEventListener('click', () => {
    //todo 一种是运行所有，一种是运行选中的
    selectedConfs.forEach(confId => {
        frpCtrl.run(confId)
    })
    // for (const confId of selectedConfs) {
    //   frpCtrl.run(confId)
    // }
})


//select or unselect all conf items
selectAllConfBtn.addEventListener('click', e => {
    const isSelectedAll = e.target.checked
    const checkboxes = confListEle.querySelectorAll("input[type=checkbox]")
    for (const checkbox of checkboxes) {
        // if (checkbox.checked === e.target.checked) continue
        checkbox.checked = isSelectedAll
        frpCtrl.select(isSelectedAll, checkbox.id.split('-')[2])
    }
})

confConfigArea.addEventListener('click', (e) => {
    jslog(e.target.name)
    switch (e.target.name) {
        case 'open-conf-dir':
            bind_openConfDir()
            break;
        case 'refresh-conf-list':
            bind_getConfList()
            break;
        case 'add-conf':
            // bind_addConf()
            break
        default:
            break;
    }
})