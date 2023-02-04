
export function pollStatus() {
  setInterval(async () => {
    chrome.storage.local.get('trackList')
      .then(({ trackList = [] }) => {
        chrome.action.setBadgeText({ text: `${trackList.length}` });

        const statusPromises = trackList
          .map(repo => retrieveLatestRun(repo.owner, repo.name)
            .then(({ status, html_url }) => {
              return { ...repo, status, html_url }
            })
            .catch((error) => {
              return { ...repo, status: error }
            })
          );
        return Promise.all(statusPromises)
      })
      .then(statusResponses => {
        if (statusResponses instanceof Array) {
          if (statusResponses.every(({ status }) => status == "completed")) {
            buildsSuccessful()
          } else if (statusResponses.filter(({ status }) => status == "in_progress" || status == "queued" || status == "pending").length > 0) {
            buildInProgress()
          } else {
            buildFailed()
          }
        }

        return chrome.storage.local.get('trackList')
          .then(({ trackList = [] }) => {
            const newTrackList = trackList.map((trackItem) => {
              const matchingResponse = statusResponses.find((response) => response.owner == trackItem.owner && response.name == trackItem.name);
              if (matchingResponse) {
                return { ...trackItem, ...matchingResponse };
              } else {
                return trackItem;
              }
            });
            chrome.storage.local.set({ trackList: newTrackList, refreshTimestamp: new Date().toLocaleTimeString() })

          })


      })
  }, 5000)
}

function retrieveLatestRun(owner, name) {
  return fetch(`https://api.github.com/repos/${owner}/${name}/actions/runs`)
    .then(res => res.json())
    .then(res => {
      if (res.workflow_runs) {
        return res.workflow_runs[0] || {}
      } else {
        return { status: res.message }
      }
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
