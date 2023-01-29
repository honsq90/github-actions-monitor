'use strict';

import './popup.css';
import greenLogo from '../public/icons/green_128.png'
import orangeLogo from '../public/icons/orange_128.png'
import redLogo from '../public/icons/red_128.png'

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
        node.classList.add("statusItem")

        const repoSpan = document.createElement("span");
        const repoText = document.createTextNode(`${repo.owner}/${repo.name}`)
        repoSpan.appendChild(repoText);
        const statusIcon = document.createElement("img");
        statusIcon.setAttribute('height', 12)
        statusIcon.setAttribute('width', 12)
        switch (repo.status) {
          case "completed":
            statusIcon.setAttribute('src', greenLogo)
            break;
          case "in_progress":
            statusIcon.setAttribute('src', orangeLogo)
            break;
          default:
            statusIcon.setAttribute('src', redLogo)
            break;
        }

        node.appendChild(repoSpan)
        node.appendChild(statusIcon)

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
