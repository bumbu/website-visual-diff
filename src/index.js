var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var resemble = require('resemble');
var Semaphore = require('promise-semaphore');
var screenshot = require('website-screenshot');

module.exports = {
  cache,
  compare,
  copy,
  clean
}

function cache(settings) {
  ensureFoldersExist(settings.baseFolder)

  var folderPath = path.join(settings.baseFolder, 'original');
  return loadAndSaveShoots(settings, folderPath);
}

function compare(settings) {
  ensureFoldersExist(settings.baseFolder)
  // Clean current and diffs folders
  removeDir(path.join(settings.baseFolder, 'current'), true);
  removeDir(path.join(settings.baseFolder, 'diffs'), true);

  var folderPath = path.join(settings.baseFolder, 'current');
  var promise = loadAndSaveShoots(settings, folderPath);
  return compareShots(settings, promise)
}

function copy(settings) {
  ensureFoldersExist(settings.baseFolder)

  var dirFrom = path.join(settings.baseFolder, 'current')
  var dirTo = path.join(settings.baseFolder, 'original')
  copyDirContents(dirFrom, dirTo)
}

function clean(settings) {
  removeDir(path.join(settings.baseFolder, 'original'), true);
  removeDir(path.join(settings.baseFolder, 'current'), true);
  removeDir(path.join(settings.baseFolder, 'diffs'), true);
}

/**
 * UTILS
 */

/**
 * Checks if a folder exists, and if not the creates it
 * @param  {String} folderPath path
 */
function checkOrCreate(folderPath) {
  try {
    fs.statSync(folderPath)
  } catch (e) {
    fs.mkdirSync(folderPath)
  }
}

function ensureFoldersExist(baseFolder) {
  checkOrCreate(baseFolder)
  checkOrCreate(path.join(baseFolder, 'original'))
  checkOrCreate(path.join(baseFolder, 'current'))
  checkOrCreate(path.join(baseFolder, 'diffs'))
}

/**
 * Create file name based on page name and sizes
 * @param  {Object<name>} page
 * @param  {Object<width, height>} size
 * @return {String}
 */
function getFileName(page, size) {
  return `${page.name}-${size.width}x${size.height}.png`;
}

/**
 * Removes a directory and its cotents
 * If cleanOnly is true then only the contents are removed
 * @param  {String} dirPath
 * @param  {boolean} cleanOnly
 */
function removeDir(dirPath, cleanOnly) {
  var files;

  try {
    files = fs.readdirSync(dirPath);
  } catch(e) {
    return;
  }

  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  }

  !cleanOnly && fs.rmdirSync(dirPath);
}

function copyDirContents(dirFrom, dirTo) {
  var files;

  try {
    files = fs.readdirSync(dirFrom);
  } catch(e) {
    return;
  }

  files.forEach(function(file) {
    var fileFrom = path.join(dirFrom, file);
    var fileTo = path.join(dirTo, file)

    // Remove same file if it exists in target directory
    try {
      if (fs.statSync(fileTo).isFile()) {
        fs.unlinkSync(fileTo);
      }
    } catch (e) {
      // Nothing
    }

    fs.renameSync(fileFrom, fileTo);
  })
}

function fileExists(filePath) {
  var exists = true;
  try {
    fs.accessSync(filePath, fs.F_OK);
  } catch (e) {
    exists = false;
  }

  return exists;
}

/**
 * Creates screenshots based on provided settings and saves them into provided folder
 * @param  {Object} settings
 * @param  {String} folderPath
 * @return {Promise}
 */
function loadAndSaveShoots(settings, folderPath) {
  var promisesPool = [];
  var semaphore = new Semaphore({rooms: 6});

  settings.pages.forEach((page) => {
    settings.sizes.forEach((size) => {

      promisesPool.push(semaphore.add(() => {
        return new Promise((resolve, reject) => {

          console.log(`Start ${page.name} for ${size.width}x${size.height}`);

          screenshot({
            url : settings.urlBase + page.url,
            width : size.width,
            height : size.height,
            page: size.page === undefined ? true : size.page,
            cookies: settings.cookies,
            auth: settings.auth,
            delay: settings.delay,
          })
          .then(function(img){
            var fileName = getFileName(page, size);

            fs.writeFile(path.join(folderPath, fileName), img.data, function(err){
              if (err) {
                console.info(`Failed to save ${fileName}`, err)
              }

              resolve();
            });
          })
          .catch((err) => {
            console.info(`Failed to retrieve ${page.url}`, err)
            resolve();
          })

        })
      }))

    })
  })

  var promise = Promise.all(promisesPool);

  // Close screenshot service
  promise = promise.then(() => {
    console.log(`Done`)
    screenshot.close();
  }).catch(() => {
    console.log(`Done with errors`)
    screenshot.close();
  })

  return promise
}

function compareShots(settings, promise) {
  var compareFromPath = path.join(settings.baseFolder, 'current');
  var compareToPath = path.join(settings.baseFolder, 'original');

  settings.pages.forEach((page) => {
    settings.sizes.forEach((size) => {

      promise = promise.then(() => {
        return new Promise((resolve, reject) => {
          var fileName = getFileName(page, size);
          var currentFile = path.join(compareFromPath, fileName)
          var originalFile = path.join(compareToPath, fileName)

          try {
              fs.accessSync(path, fs.F_OK);
              // Do something
          } catch (e) {
              // It isn't accessible
          }

          if (!fileExists(currentFile) || !fileExists(originalFile)) {
            console.log(`${chalk.red('ERROR')} ${page.name} ${size.width}x${size.height} - no matching files`)
            resolve();
            return;
          }

          var diff = resemble.resemble(originalFile).compareTo(currentFile).ignoreColors().onComplete(function(data){
            var diffFile = path.join(settings.baseFolder, 'diffs', fileName);
            var difference = parseFloat(data.misMatchPercentage);

            if (difference > 0) {
              console.log(`${chalk.red('DIFF')} ${page.name} ${size.width}x${size.height}`)
              // Save file
              fs.writeFile(diffFile, data.getBuffer(), resolve);
            } else {
              console.log(`${chalk.green('SAME')} ${page.name} ${size.width}x${size.height}`)
              resolve();
            }
          });

        })
      })

    })
  })

  return promise
}
