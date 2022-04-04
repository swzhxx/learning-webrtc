const connection = new WebSocket('ws://localhost:8888')
connection.onopen = () => {
  console.log('Connected')
}

connection.onmessage = (message) => {
  let data
  try {
    data = JSON.parse(message.data)
  } catch (e) {
    data = {}
  }
  handleDispatchMessage(data)
}

const handleDispatchMessage = (data) => {
  switch (data.type) {
    case 'login': {
      onLogin(data.success)
      break
    }
    case 'offer': {
      onOffer(data.offer, data.name)
      break
    }
    case 'answer': {
      onAnswer(data.answer)
      break
    }
    case 'candidate': {
      onCandidate(data.candidate)
      break
    }
    case 'leave': {
      onLeave()
      break
    }
    default:
      break
  }
}

connection.onerror = (err) => {
  console.log('Got error', err)
}

const send = (message) => {
  if (connectedUser) {
    message.name = connectedUser
  }
  connection.send(JSON.stringify(message))
}

const loginButton = document.querySelector('#login')

loginButton.addEventListener('click', (event) => {
  let username = document.querySelector('#username').value
  send({
    type: 'login',
    name: username
  })
})

const localVideo = document.querySelector('#localVideo')
const remoteVideo = document.querySelector('#remoteVideo')
let localStream, connectedUser, localConnection, remoteConnection

const onLogin = (success) => {
  if (success === false) {
    alert('Login unsuccessful, please try a different name.')
  } else {
    // 准备好通话的通道
    startConnection()
  }
}

const onOffer = async (offer, name) => {
  // if (name == document.querySelector('#username').value) {
  //   return
  // }
  connectedUser = name
  await localConnection.setRemoteDescription(new RTCSessionDescription(offer))
  let answer = await localConnection.createAnswer()
  localConnection.setLocalDescription(answer)
  send({
    type: 'answer',
    answer
  })
}

const onAnswer = async (answer) => {
  await localConnection.setRemoteDescription(new RTCSessionDescription(answer))
}

const onCandidate = async (candidate) => {
  await localConnection.addIceCandidate(new RTCIceCandidate(candidate))
}

const onLeave = () => {
  connectedUser = null
  remoteConnection.srcObject = null
}

const startConnection = async () => {
  const stream = await window.navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  localVideo.srcObject = stream
  localStream = stream

  setupPeerConnection(stream)
}

const setupPeerConnection = async (stream) => {
  const configuration = {
    iceServers: [{ urls: 'stun:stun.services.mozilla.com' }]
  }
  localConnection = new RTCPeerConnection(configuration)
  remoteConnection = new RTCPeerConnection(configuration)

  localConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      send({
        type: 'candidate',
        candidate: event.candidate
      })
    }
  })
  localConnection.addEventListener('track', (event) => {
    if (remoteVideo.srcObject != event.streams[0]) {
      remoteVideo.srcObject = event.streams[0]
    }
  })

  stream.getTracks().forEach((track) => localConnection.addTrack(track, stream))
}

document.querySelector('#call').addEventListener('click', async () => {
  connectedUser = document.querySelector('#callname').value
  let offer = await localConnection.createOffer()
  send({
    type: 'offer',
    offer: offer
  })
  localConnection.setLocalDescription(offer)
})
