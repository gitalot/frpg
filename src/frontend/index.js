//get and generate conf list when loaded
document.addEventListener('DOMContentLoaded', () => {
    bind_getConfList()

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