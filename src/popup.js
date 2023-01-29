'use strict';

import './popup.css';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  const list = document.getElementById("trackList")
  chrome.storage.local.get('trackList')
    .then(({ trackList = [] }) => {
      trackList.forEach(repo => {

        const node = document.createElement("li");
        const link = document.createTextNode(`${repo.owner}/${repo.name} - ${repo.status}`)
        node.appendChild(link);
        list.appendChild(node);
      })
    })

  const repoForm = document.getElementById("add-repo");

  repoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(repoForm);
    chrome.storage.local.get('trackList')
      .then(({ trackList = [] }) => {
        trackList.push({ owner: data.get('owner'), name: data.get('name') })
        chrome.storage.local.set({ trackList })
        repoForm.reset()
        window.location.reload()
      })

  })
})();
