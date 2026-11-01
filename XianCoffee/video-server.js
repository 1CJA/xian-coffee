/**
 * 本地视频服务脚本。
 * 用于开发阶段调试门店视频资源。
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const videoPath = 'D:/XianCoffee/准备图片/视频/cf.mp4'
const port = 8899

const server = http.createServer((req, res) => {
  if (req.url !== '/store-video.mp4') {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  fs.stat(videoPath, (error, stat) => {
    if (error) {
      res.writeHead(404)
      res.end('Video not found')
      return
    }

    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
      const chunkSize = end - start + 1
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      })
      fs.createReadStream(videoPath, { start, end }).pipe(res)
      return
    }

    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    })
    fs.createReadStream(videoPath).pipe(res)
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Qi'an Coffee video server: http://127.0.0.1:${port}/store-video.mp4`)
})
