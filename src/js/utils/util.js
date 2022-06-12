/*
 * Util method to get stored key from local machine
 */
export const chromeStorageGetLocalValuePromise = (key, defaultValue) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (Object.values(result)[0] != undefined) {
        resolve(Object.values(result)[0]);
      } else {
        resolve(defaultValue);
      }
    });
  });
};
