
export function pollStatus() {
  setInterval(async () => {
    chrome.storage.local.get('trackList')
      .then(({ trackList = [] }) => {
        chrome.action.setBadgeText({ text: `${trackList.length}` });

        const statusPromises = trackList
          .map(repo => retrieveLatestRun(repo.owner, repo.name)
            .then(({status, html_url}) => {
              return { status, html_url, owner: repo.owner, name: repo.name }
            })
            .catch((error) => {
              return { status: error, owner: repo.owner, name: repo.name }
            })
          );
        return Promise.all(statusPromises)
      })
      .then(trackList => {
        if (trackList instanceof Array) {
          if (trackList.every(({ status }) => status == "completed")) {
            buildsSuccessful()
          } else if (trackList.filter(({ status }) => status == "in_progress" || status == "queued" || status == "pending").length > 0) {
            buildInProgress()
          } else {
            buildFailed()
          }
        }

        chrome.storage.local.set({trackList, refreshTimestamp: new Date().toLocaleTimeString()})

      })
  }, 5000)
}

function retrieveLatestRun(owner, name) {
  return fetch(`https://api.github.com/repos/${owner}/${name}/actions/runs`)
    .then(res => res.json())
    .then(res => {
      console.log(res.workflow_runs[0])
      return res.workflow_runs[0] || {}
    })
}


function buildsSuccessful() {
  chrome.action.setIcon({ path: "../icons/green_128.png" })
}


function buildFailed() {
  chrome.action.setIcon({ path: "../icons/red_128.png" })
}


function buildInProgress() {
  chrome.action.setIcon({ path: "../icons/orange_128.png" })
}
