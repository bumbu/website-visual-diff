const screenshot = require('website-screenshot');

/**
 * Saves screenshots
 *
 * options:
 * * name - used for file name
 * * url
 * * size
 * * * width - browser width
 * * * height - browser height
 * * folder
 * * cookies
 *
 *
 * @param  {object} options
 * @return {Promise}
 */
function makeScreenshot(options) {

}


/**
 * Makes a bulk of screenshots
 *
 * options:
 * * baseUrl
 * * pages[]
 * * * name
 * * * url (without base)
 * * sizes[]
 * * cookies
 * * beforeScreenshot (callback)
 * * afterScreenshot (callback)
 *
 * @param  {[type]} options [description]
 * @return {Promise}         [description]
 */
function bulkScreenshots(options) {

}

/**
 * Compares 2 screenshots
 *
 * options:
 * * file1
 * * file2
 *
 * @param  {[type]} options [description]
 * @return {Promise}         [description]
 */
function compareScreenshots(options) {

}

/**
 * Compares 2 screenshots
 *
 * options:
 * * folder1
 * * folder2
 * * pages[]
 * * * name
 * * sizes[]
 *
 * @param  {[type]} options [description]
 * @return {Promise}         [description]
 */
function bulkCompare(options) {

}


// module.exports = {
//   makeScreenshot,
// }



module.exports = screenshot
