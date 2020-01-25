interface MediaDevices {
    getDisplayMedia(options: { video: boolean }): Promise<MediaStream>
}

interface MediaRecorderEventMap {
    dataavailable: Event & { readonly data: Blob }
}

declare class MediaRecorder {
    constructor(
        stream: MediaStream,
        options?: {
            mimeType?: string
            audioBitsPerSecond?: number
            videoBitsPerSecond?: number
            bitsPerSecond?: number
        }
    )
    readonly mimeType: string
    readonly state: "inactive" | "recording" | "paused"
    readonly stream: MediaStream

    pause(): void
    resume(): void
    requestData(): void
    start(timesliceMsec?: number): void
    stop(): void

    addEventListener<K extends keyof MediaRecorderEventMap>(
        type: K,
        listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void

    static isTypeSupported(mimeType: string): boolean
}

const wsUrl = location.origin.replace(/^http/, "ws")
document.getElementById("start_broadcast")!.addEventListener("click", async () => {
    // get user media

    const mimeType = "video/webm;codecs=h264"

    if (!MediaRecorder.isTypeSupported(mimeType))
        return alert(`このブラウザは ${mimeType} によるエンコードをサポートしていないため利用できません`)

    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
    })
    ;(<HTMLVideoElement>document.getElementById("preview")!).srcObject = stream

    const recorder = new MediaRecorder(stream, {
        mimeType,
        bitsPerSecond: 6 * 1000 * 1000
    })
    const params = new URLSearchParams()
    params.set("rtmp_url", (<HTMLInputElement>document.getElementById("rtmp_url")!).value)
    params.set("rtmp_key", (<HTMLInputElement>document.getElementById("rtmp_key")!).value)
    console.log(params.toString())
    const ws = new WebSocket(wsUrl + "/to_ffmpeg?" + params.toString())

    recorder.addEventListener("dataavailable", e => {
        ws.send(e.data)
    })
    recorder.addEventListener("stop", () => {
        ws.close()
    })

    ws.onopen = () => {
        recorder.start(1)
    }

    ws.onmessage = e => {
        console.log(e.data)
    }

    document.getElementById("end_broadcast")!.addEventListener("click", () => {
        recorder.stop()
    })
})
