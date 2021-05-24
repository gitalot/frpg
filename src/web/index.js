document.getElementById('bottom-panel').addEventListener('click', function (e) {
  switch (e.target.name) {
    case "restart":
      frpCtrl.run_stop({action: 'stop_all', confIds: []})
       break;
    case "settings":
      console.log("todo")
      break;
    default:
      break;
  }
})