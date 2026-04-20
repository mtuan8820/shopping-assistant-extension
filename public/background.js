chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error)                                         
                
chrome.commands.onCommand.addListener((command) => {
    if (command === 'reload') chrome.runtime.reload()
})
