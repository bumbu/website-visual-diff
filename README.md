# website-visual-diff
Compare your website before and after making changes

## Using with gulp

```js
var VISUAL_DIFF_CONFIG = {
  baseFolder: path.join(__dirname, '/visual_diff'),

  urlBase: 'http://localhost:8000',

  cookies: [{
    url: 'http://localhost:8000/',
    name: 'my-secret-cookie',
    value: 'any-cookie',
  }],

  sizes: [{
    // Mobile
    width: 320,
    height: 568,
  }, {
    // Large
    width: 1280,
    height: 800,
  }],

  pages: [{
    name: 'events',
    url: `/events/`,
  }, {
    name: 'appointments',
    url: `/appointment/`,
  }, {
    name: 'account',
    url: `/account/`,
  }]
}

// Caches screenshots
// RUN IT before making changes to CSS/HTML
gulp.task('diff:cache', function() {
  return vdiff.cache(VISUAL_DIFF_CONFIG);
})

// Creates new screenshots and compares them with cached screenshots
gulp.task('diff:compare', function() {
  return vdiff.compare(VISUAL_DIFF_CONFIG);
})

// Copies new screenshots into cache
// RUN IT if you want to update the cache with last taken screenshots
gulp.task('diff:copy', function() {
  return vdiff.copy(VISUAL_DIFF_CONFIG);
})

// Removes all screenshots (both cache and current)
gulp.task('diff:clean', function() {
  return vdiff.clean(VISUAL_DIFF_CONFIG);
})
```
