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

window.addEventListener("load", () => {
  let lang = navigator.language
  switch (lang) {
    case (lang.match(/zh*/)).input:
      lang = "zh-CN"
      break;
    default:
      lang = "en"
      break;
  }
  transAll()
})