import ByteBuffer from 'bytebuffer'
import { AVCPacketType, VideoData } from './flv'
import Nalu from './nalu'

type RawH264Buffer = ByteBuffer

class AVCSequence {
  spsLength: number
  spsData: ByteBuffer
  ppsNumber: number
  ppsLength: number
  ppsData: ByteBuffer
  lengthSizeMinusOne: number
  constructor (videoData: VideoData) {
    const data = videoData.data
    const buffer = ByteBuffer.wrap(data)
    buffer.readBytes(4)
    this.lengthSizeMinusOne = buffer.readUint8()
    buffer.readByte()
    this.spsLength = buffer.readUint16()
    this.spsData = buffer.readBytes(this.spsLength)
    this.ppsNumber = buffer.readUint8()
    this.ppsLength = buffer.readUint8()
    this.ppsData = buffer.readBytes(this.ppsLength)
  }
}

export default class AVC {
  static readVideoData (videoData: VideoData): AVCSequence | RawH264Buffer {
    if (
      videoData.avcPacketType === AVCPacketType.AVCDecoderConfigurationRecord
    ) {
      return new AVCSequence(videoData)
    } else if (videoData.avcPacketType === AVCPacketType.AVC_NALU) {
      return ByteBuffer.wrap(videoData.data)
    } else {
      throw new Error('unimplement videoData.AVC_END_OF_SEQUENCE')
    }
  }
}
