//Use lowercase for all lang names
const i18n = {
    lang: ["en", "zh", "zh-CN"],
    text: {
        "title": {
            "en": "conf list",
            "zh-CN": "配置列表"
        },
        "refresh": {
            "en": "refresh",
            "zh-CN": "刷新"
        },
        "settings": {
            "en": "settings",
            "zh-CN": "设置"
        },
        "restart": {
            "en": "restart",
            "zh-CN": "重启"
        },
        "run": {
            "en": "run",
            "zh-CN": "运行"
        },
        "stop": {
            "en": "stop",
            "zh-CN": "停止"
        }
    }
}

//convert text
function transText(textList, lang = navigator.language) {
    for (const textName of textList) {
        try {
            const text = i18n.text[textName][lang]

            const elements = document.querySelectorAll(`[data-i18n="${textName}"]`)

            for (const ele of elements) {
                if (ele.textContent.trim() !== "") {
                    ele.textContent = text
                } else if (ele.tagName === "INPUT") {
                    ele.value = text
                } else if (ele.title) {
                    ele.title = text
                }
            }
        } catch (err) {
            console.log("language convert [textName]  error:", err)
        }
    }
}

//convert all text
function transAll() {
    transText(Object.keys(i18n.text))
}