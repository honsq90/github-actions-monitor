'use strict';
import { pollStatus } from "./retrieveStatus";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

pollStatus()

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  console.log('wake me up');
});
