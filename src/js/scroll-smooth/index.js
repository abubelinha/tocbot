/* globals location, requestAnimationFrame */

exports.initSmoothScrolling = initSmoothScrolling

function initSmoothScrolling (options) {
  if (isCssSmoothSCrollSupported()) { }

  var duration = options.duration

  var pageUrl = location.hash
    ? stripHash(location.href)
    : location.href

  delegatedLinkHijacking()

  function delegatedLinkHijacking () {
    document.body.addEventListener('click', onClick, false)

    function onClick (e) {
      if (!isInPageLink(e.target) || e.target.className.indexOf('no-smooth-scroll') > -1) return

      e.preventDefault()

      jump(e.target.hash, {
        duration: duration,
        callback: function () {
          setFocus(e.target.hash)
        }
      })
    }
  }

  function isInPageLink (n) {
    return n.tagName.toLowerCase() === 'a' &&
      (n.hash.length > 0 || n.href.charAt(n.href.length - 1) === '#') &&
      (stripHash(n.href) === pageUrl || stripHash(n.href) + '#' === pageUrl)
  }

  function stripHash (url) {
    return url.slice(0, url.lastIndexOf('#'))
  }

  function isCssSmoothSCrollSupported () {
    return 'scrollBehavior' in document.documentElement.style
  }

  // Adapted from:
  // https://www.nczonline.net/blog/2013/01/15/fixing-skip-to-content-links/
  function setFocus (hash) {
    var element = document.getElementById(hash.substring(1))

    if (element) {
      if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
        element.tabIndex = -1
      }

      element.focus()
    }
  }
}

function jump (target, options) {
  var start = window.pageYOffset
  var opt = {
    duration: options.duration,
    offset: options.offset || 0,
    callback: options.callback,
    easing: options.easing || easeInOutQuad
  }
  // This makes ids that start with a number work: ('[id="' + target.split('#').join('') + '"]')
  // And this is for IE: document.body.scrollTop
  var distance = typeof target === 'string'
    ? opt.offset + (
      target
      ? document.querySelector('[id="' + target.split('#').join('') + '"]').getBoundingClientRect().top
      : -(document.documentElement.scrollTop || document.body.scrollTop))
    : target
  var duration = typeof opt.duration === 'function'
    ? opt.duration(distance)
    : opt.duration
  var timeStart
  var timeElapsed

  requestAnimationFrame(function (time) { timeStart = time; loop(time) })
  function loop (time) {
    timeElapsed = time - timeStart

    window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration))

    if (timeElapsed < duration) { requestAnimationFrame(loop) } else { end() }
  }

  function end () {
    window.scrollTo(0, start + distance)

    if (typeof opt.callback === 'function') { opt.callback() }
  }

  // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
  function easeInOutQuad (t, b, c, d) {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }
}
