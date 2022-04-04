let videoEl
let theirEl
let yourConnection
let theirConnection

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
}

const init = async () => {
  videoEl = document.querySelector('#localVideo')
  theirEl = document.querySelector('#remoteVideo')
  await initDevice()
}

const initDevice = async () => {
  const stream = await window.navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  videoEl.srcObject = stream

  let devices = await window.navigator.mediaDevices.enumerateDevices()
  console.log(`devices`, devices)
  await startPeerConnection(stream)
}

const startPeerConnection = async (stream) => {
  const configuration = {
    // iceServers: [{ urls: 'stun:stun.services.mozilla.com' }]
  }
  const videoTracks = stream.getVideoTracks()
  const audioTracks = stream.getAudioTracks()
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`)
  }
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`)
  }
  yourConnection = new RTCPeerConnection(configuration)
  theirConnection = new RTCPeerConnection(configuration)
  // yourConnection.onicecandidate = onYourConnectionCandiate
  // theirConnection.onicecandidate = onTheirCandidata
  yourConnection.addEventListener('icecandidate', onYourConnectionCandiate)
  theirConnection.addEventListener('icecandidate', onTheirConnectionCandidata)
  // theirConnection.ontrack = onTheirTrack
  theirConnection.addEventListener('track', onTheirTrack)

  yourConnection.addEventListener('iceconnectionstatechange', (e) =>
    onIceStateChange(pc1, e)
  )
  theirConnection.addEventListener('iceconnectionstatechange', (e) =>
    onIceStateChange(pc2, e)
  )

  stream.getTracks().forEach((track) => yourConnection.addTrack(track, stream))

  let offer = await yourConnection.createOffer(offerOptions)
  console.log(`offer`, offer.sdp)
  await yourConnection.setLocalDescription(offer)
  await theirConnection.setRemoteDescription(offer)
  let answer = await theirConnection.createAnswer(offerOptions)
  console.log(`answer`, answer.sdp)
  await yourConnection.setRemoteDescription(answer)
  await theirConnection.setLocalDescription(answer)
}

window.onload = init

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`)
    console.log('ICE state change event: ', event)
  }
}

const onYourConnectionCandiate = (event) => {
  console.log('your connection candiate', event)
  if (event.candidate) {
    theirConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
  }
}
const onTheirConnectionCandidata = (event) => {
  console.log('their connection candiate', event)
  if (event.candidate) {
    // console.log('your connection candiate', event)
    yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
  }
}

const onTheirTrack = (e) => {
  if (theirEl.srcObject !== e.streams[0]) {
    theirEl.srcObject = e.streams[0]
    console.log('pc2 received remote stream')
  }
}
