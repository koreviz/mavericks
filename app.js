/**
 * Mavericks App
 * Copyright(c) 2015 Koreviz
 */
const cluster = require('cluster')
const fs = require('fs')
const http = require('http')
const https = require('https')
const body = require('body/any')
const router = require('routes')()

const port = process.env.PORT || 8000

/**
 * App
 */
class App {
  constructor() {

  }

	/**
	 * cluster
	 */
  cluster(options, worker) {
    const cpus = options.number ? parseInt(options.number, 10) : require('os').cpus().length,
      sigs = ['SIGQUIT', 'SIGTERM']

    sigs.forEach(sig => process.on(sig, () => process.exit(1)))

    if (cluster.isMaster) {
      console.log('Mavericks Cluster started')

      for (var i = 0; i < cpus; i++) {
        cluster.fork()
      }

      cluster.on('exit', child => cluster.fork())
    }
    else
      worker()
  }

	/**
	 * createServer
	 */
  createServer(tls) {
    const rl = (req, res) => {
      const m = router.match(req.url)

      if (m) m.fn(req, res, m.params)
    }

    router.addRoute('/', (req, res, params) => this.json(res, { text: 'Hello World' }))

    if (tls) return https.createServer(tls, rl)
    return http.createServer(rl)
  }

	/**
	 * Files
	 */
  files(dir, ret) {
    ret = ret || []

    fs.readdirSync(dir)
      .filter(path => !~['node_modules', '.git'].indexOf(path))
      .forEach(p => {
        p = path.join(dir, p)

        if (fs.statSync(p).isDirectory())
          this.files(p, ret)
        else if (p.match(/\.js$/))
          ret.push(p)
      })

    return ret
  }

	/**
	 * JSON
	 */
  json(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }

	/**
	 * Watch
	 */
  watch(files, fn) {
    const options = { interval: 5000 }

    files.forEach(file => {
      fs.watchFile(file, options, (curr, prev) => {
        if (prev.mtime < curr.mtime) fn(file)
      })
    })
  }
}

if (!module.parent) {
  const me = new App().createServer()

  me.listen(port)
  console.log('Mavericks App listening on port %d', port)
}

module.exports = function () {
  return new App()
}