import express from "express"
import expressWs from "express-ws"
import { spawn } from "child_process"

const { app } = expressWs(express())

app.use(express.static(__dirname + "/../client/assets/"))

app.ws("/to_ffmpeg", (ws, req) => {
    const url = new URL(req.query.rtmp_url)
    if (url.protocol !== "rtmp:") {
        ws.send(JSON.stringify({ type: "error", message: "invalid url" }), () => {
            ws.close()
        })
    }
    url.href += "/" + req.query.rtmp_key
    console.log(url)

    const ffmpeg = spawn("ffmpeg", ["-i", "/dev/stdin", "-codec", "copy", "-f", "flv", url.href], {
        stdio: ["pipe", "inherit", "inherit"]
    })
    ws.onmessage = e => {
        if (typeof e.data === "string") return
        const data = e.data as Buffer
        ffmpeg.stdin.write(data)
    }
    ws.onclose = e => {
        ffmpeg.stdin.end()
    }
})

app.listen(3000, "localhost", () => {
    console.log("available in http://localhost:3000")
})
