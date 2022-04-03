let videoEl

const init = async () => {
  videoEl = document.querySelector('#video')
  await initDevice()
}

const initDevice = async () => {
  const stream = await window.navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
  videoEl.srcObject = stream
}
window.onload = init
