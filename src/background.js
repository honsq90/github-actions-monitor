'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

function retrieveStatus(owner, name) {
  return fetch(`https://api.github.com/repos/${owner}/${name}/actions/runs`)
    .then(res => res.json())
    .then(res => res.workflow_runs[0].status)
}

setInterval(async () => {
  chrome.storage.local.get('trackList')
    .then(({ trackList = [] }) => {
      const statusPromises = trackList
        .map(repo => retrieveStatus(repo.owner, repo.name)
          .then((status) => {
            return { status, owner: repo.owner, name: repo.name }
          })
          .catch((status) => {
            return { status, owner: repo.owner, name: repo.name }
          })
        );
      return Promise.all(statusPromises)
    })
    .then(trackList => {
      if (trackList instanceof Array) {
        if (trackList.every(({ status }) => status == "completed")) {
          buildsSuccessful()
        } else if (trackList.filter(({ status }) => status == "in_progress").length > 0) {
          buildInProgress()
        } else {
          buildFailed()
        }
      }

      chrome.storage.local.set({trackList})

    })

}, 5000)


function buildsSuccessful() {
  chrome.action.setIcon({ path: "../icons/green_128.png" })
}


function buildFailed() {
  chrome.action.setIcon({ path: "../icons/red_128.png" })
}


function buildInProgress() {
  chrome.action.setIcon({ path: "../icons/orange_128.png" })
}

