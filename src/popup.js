'use strict';

import './popup.css';
import greenLogo from '../public/icons/green_128.png'
import orangeLogo from '../public/icons/orange_128.png'
import redLogo from '../public/icons/red_128.png'
import greyLogo from '../public/icons/grey_128.png'

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions


  const repoForm = document.getElementById("formAddRepo");

  repoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(repoForm);
    chrome.storage.local.get('trackList')
      .then(({ trackList = [] }) => {
        const owner = data.get('owner');
        const name = data.get('name');
        if (!trackList.find((track) => track.owner == owner && track.name == name)) {
          trackList.push({ owner, name })
          chrome.storage.local.set({ trackList })
          repoForm.reset()
        }
        window.location.reload()
      })

  })
  refreshList();

  setInterval(() => {
    refreshList()
  }, 2500)
})();

function refreshList() {
  const list = document.getElementById("trackList")
  list.innerHTML = ''

  chrome.storage.local.get('refreshTimestamp')
    .then(({ refreshTimestamp = '' }) => {
      const refreshTimestampText = document.getElementById("refreshTimestamp")
      refreshTimestampText.innerHTML = refreshTimestamp
    })

  chrome.storage.local.get('trackList')
    .then(({ trackList = [] }) => {

      trackList
        .filter(({ deleted }) => !deleted)
        .forEach(repo => {

          const node = document.createElement("li");
          node.classList.add("statusItem")

          // create status icon
          const statusIcon = document.createElement("img");
          statusIcon.setAttribute('height', 12)
          statusIcon.setAttribute('width', 12)
          switch (repo.status) {
            case "completed":
              statusIcon.setAttribute('src', greenLogo)
              break;
            case "queued":
            case "pending":
            case "in_progress":
              statusIcon.setAttribute('src', orangeLogo)
              break;
            case undefined:
              statusIcon.setAttribute('src', greyLogo)
              break;
            default:
              statusIcon.setAttribute('src', redLogo)
              break;
          }
          node.appendChild(statusIcon)
          const repoText = document.createTextNode(`${repo.owner}/${repo.name}`)

          // create link
          if (repo.html_url) {
            const repoLink = document.createElement("a")
            repoLink.setAttribute("href", repo.html_url)
            repoLink.setAttribute("target", "_blank")
            repoLink.setAttribute("rel", "noreferrer noopener")
            repoLink.classList.add("statusItem--text")
            repoLink.appendChild(repoText)
            node.appendChild(repoLink)
          } else {
            repoText.classList.add("statusItem--text")
            node.appendChild(repoText)
          }

          // create delete button
          const deleteButton = document.createElement("button")
          deleteButton.textContent = "✕"
          deleteButton.classList.add("statusItem--delete")
          deleteButton.dataset.owner = repo.owner
          deleteButton.dataset.name = repo.name
          deleteButton.setAttribute("type", "button")

          deleteButton.addEventListener("click", (event) => {
            const { name, owner } = event.target.dataset

            const deleteItem = confirm(`Are you sure you want to delete '${owner}/${name}'?`);
            if (deleteItem) {
              chrome.storage.local.get('trackList')
                .then(({ trackList = [] }) => {
                  const newTrackList = trackList
                    .filter((track) => track.owner != owner && track.name != name);
                  chrome.storage.local.set({ trackList: newTrackList })
                  window.location.reload()
                })
            }
          })

          // create list content
          node.appendChild(deleteButton)

          list.appendChild(node);
        })
    })

}
