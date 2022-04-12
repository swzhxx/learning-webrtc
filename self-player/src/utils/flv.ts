/* eslint-disable no-use-before-define */
import ByteBuffer from 'bytebuffer'
// import { deserializeAMF } from 'amf-packet'
import { fromAMF } from 'amf-codec'
import { Buffer } from 'buffer'
interface FromByteBuffer {
  fromByteBuffer(buffer: ByteBuffer): this
}

interface FormatPrint {
  formatPrint(): void
}

enum FlvTagType {
  Audio = 0x08,
  Video = 0x09,
  ScriptData = 0x12,
  Unknown = 0
}

enum FrameType {
  KeyFrame = 1,
  InterFrame = 2,
  DisposableFrame = 3,
  GeneratedKeyFrame = 4,
  VideoInfoFrame = 5
}

enum EncodeType {
  JPEG = 1,
  H263 = 2,
  ScreenVideo = 3,
  On2VP6 = 4,
  On2VP6WithAlphaChannel = 5,
  ScreenVideoVersion2 = 6,
  AVC = 7
}

export enum AVCPacketType {
  AVCDecoderConfigurationRecord = 0,
  AVC_NALU = 1,
  AVC_END_OF_SEQUENCE = 2
}

enum AudioSoundFormat {
  LINEAR_PCM_PLATFORM_ENDIAN = 0,
  ADPCM = 1,
  MP3 = 2,
  LINEAR_PCM_LITTLE_ENDIAN = 3,
  NELLYMOSER_16KHZ_MONO = 4,
  NELLYMOSER_8KHZ_MONO = 5,
  NELLYMOSER = 6,
  G711_ALAW_LOGARITHMIC_PCM = 7,
  G711_MULAW_LOGARITHMIC_PCM = 8,
  RESERVED = 9,
  AAC = 10,
  SPEEX = 11,
  MP3_8KHZ = 14,
  DEVICE_SPECIFIC_SOUND = 15
}

enum AudioSamplingRate {
  SAMPLING_5_POINT_5_KHZ = 0,
  SAMPLING_11_KHZ = 1,
  SAMPLING_22_KHZ = 2,
  SAMPLING_44_KHZ = 3
}

enum AudioSamplingPrecision {
  SND_8_BIT = 0,
  SND_16_BIT = 1
}

enum AudioSoundTrack {
  SND_MONO = 0,
  SND_STEREO = 1
}

const number2TagType = (num: number): FlvTagType => {
  switch (num) {
    case FlvTagType.Audio: {
      return FlvTagType.Audio
    }
    case FlvTagType.Video: {
      return FlvTagType.Video
    }
    case FlvTagType.ScriptData: {
      return FlvTagType.ScriptData
    }
    default: {
      return FlvTagType.Unknown
    }
  }
}

class FlvHeader implements FromByteBuffer, FormatPrint {
  // 占用3个字节 一般前三个字符固定为FLV
  signautre: string
  // 占用1个字节
  version: number
  // 占用1个字节 第0位和第二位分别表示video和audio存在的情况
  flags: number
  // 4个字节，固定为9
  dataOffset: number
  constructor () {
    this.flags = 0
    this.version = 0
    this.signautre = ''
    this.dataOffset = 0
  }

  formatPrint (): void {
    console.log('------------------FLV HEADER----------------')
    console.log('signautre :  %s', this.signautre)
    console.log('version   :  %s', this.version)
    console.log('flags     :  %s', this.flags)
    console.log('dataOffset:  %s', this.dataOffset)
    console.log('--------------------------------------------')
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): FlvHeader {
    const char1 = String.fromCharCode(buffer.readByte())
    const char2 = String.fromCharCode(buffer.readByte())
    const char3 = String.fromCharCode(buffer.readByte())
    const self = new FlvHeader()

    const version = buffer.readByte()
    const flags = buffer.readByte()

    self.signautre = `${char1}${char2}${char3}`
    self.version = version
    self.flags = flags
    self.dataOffset = buffer.readUint32()
    return self
  }
}

export class Tag implements FromByteBuffer {
  tagHeader: TagHeader
  tagData: VideoData | AudioData | ScriptData | null
  constructor () {
    this.tagHeader = new TagHeader()
    this.tagData = null
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): Tag {
    // throw new Error('Method not implemented.')
    const tagHeader = TagHeader.fromByteBuffer(buffer)

    let data = buffer.readBytes(tagHeader.dataSize)

    data = data.slice()
    const tag = new Tag()
    let tagData = null
    tag.tagHeader = tagHeader

    switch (tag.tagHeader.type) {
      case FlvTagType.ScriptData: {
        tagData = ScriptData.fromByteBuffer(data)
        break
      }
      case FlvTagType.Video: {
        tagData = VideoData.fromByteBuffer(data)
        break
      }
      case FlvTagType.Audio: {
        tagData = AudioData.fromByteBuffer(data)
        break
      }
    }
    tagData?.formatPrint()
    tag.tagData = tagData
    return tag
  }
}

export class TagHeader implements FromByteBuffer {
  // 1 byte:0x08表示音频,0x09表示视频,0x12表示script data
  type: FlvTagType
  // 3 byte:表示TagData大小
  dataSize: number
  // 3 byte:表示时间戳
  private timeStamp: number
  // 1 byte:时间戳的扩展字段
  private timeStampEx: number
  // 3 byte:stream id 总是0
  private streamId: number

  constructor () {
    this.type = 0
    this.dataSize = 0
    this.timeStamp = 0
    this.timeStampEx = 0
    this.streamId = 0
  }

  getTimeStamp (): number {
    if (this.timeStamp == 1677215) {
      return (this.timeStamp << 8) + this.timeStampEx
    } else {
      return this.timeStamp
    }
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): TagHeader {
    const type = number2TagType(buffer.readByte())
    const a = buffer.readUint16()
    const b = buffer.readUint8()
    const dataSize = (a << 8) + b
    const timeStamp = (buffer.readUint16() << 8) + buffer.readUint8()
    const timeStampEx = buffer.readUint8()
    const streamId = (buffer.readUint16() << 8) + buffer.readUint8()

    const self = new TagHeader()
    self.type = type
    self.dataSize = dataSize
    self.timeStamp = timeStamp
    self.timeStampEx = timeStampEx
    self.streamId = streamId
    // throw new Error('Method not implemented.')
    return self
  }
}

export class ScriptData implements FromByteBuffer {
  // eslint-disable-next-line @typescript-eslint/ban-types
  metaInfo: Object
  constructor () {
    this.metaInfo = {}
  }

  formatPrint () {
    console.log('script data  :', this.metaInfo)
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (byteBuffer: ByteBuffer): ScriptData {
    const buffer = Buffer.from(byteBuffer.toArrayBuffer())
    const onMetaData = fromAMF(buffer)

    const self = new ScriptData()
    // console.log('onMetaData', onMetaData)
    const metaInfo = fromAMF(buffer.slice(13))
    // console.log('metaInfo', metaInfo)
    // eslint-disable-next-line @typescript-eslint/ban-types
    self.metaInfo = metaInfo as Object
    return self
    // throw new Error('Method not implemented.')
  }
}
export class VideoData implements FromByteBuffer {
  frameType: FrameType
  encodeType: EncodeType
  data: ArrayBuffer
  // acvPacketType 和 compositionTimeOffset 当且仅当为AVC类型才存在
  avcPacketType: AVCPacketType | null
  compositionTimeOffset: number

  constructor () {
    this.frameType = FrameType.KeyFrame
    this.encodeType = EncodeType.AVC
    this.avcPacketType = null
    this.data = new ArrayBuffer(0)
    this.compositionTimeOffset = 0
  }

  formatPrint () {
    console.log('---------------------video---------------------------')
    console.log('frame type     :', this.frameType)
    console.log('encode type    :', this.encodeType)
    // console.log('avc packet type:', this.avcPacketType)
    // console.log('compos time    :', this.compositionTimeOffset)
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): VideoData {
    const videoArg = buffer.readByte()
    const frameType = ((videoArg & 0b11110000) >> 4) as FrameType
    const encodeType = (videoArg & 0b00001111) as EncodeType
    let packetType = null
    let compositionTimeOffset = 0
    if (encodeType === EncodeType.AVC) {
      packetType = buffer.readByte() as AVCPacketType
      const compositionTime = buffer.readBytes(3)
      if (packetType === AVCPacketType.AVC_NALU) {
        compositionTimeOffset =
          (compositionTime.readInt16() << 8) + compositionTime.readInt8()
      }
    }

    const data = buffer.slice(buffer.offset, buffer.limit + 1).toArrayBuffer()
    const self = new VideoData()
    self.frameType = frameType
    self.encodeType = encodeType
    self.data = data
    self.avcPacketType = packetType
    return self
  }
}

export class AudioData implements FromByteBuffer {
  soundFormat: AudioSoundFormat
  samplingRate: AudioSamplingRate
  samplingPrecision: AudioSamplingPrecision
  track: AudioSoundTrack
  data: ArrayBuffer
  constructor () {
    this.soundFormat = AudioSoundFormat.AAC
    this.samplingRate = AudioSamplingRate.SAMPLING_44_KHZ
    this.samplingPrecision = AudioSamplingPrecision.SND_16_BIT
    this.track = AudioSoundTrack.SND_STEREO
    this.data = new ArrayBuffer(0)
  }

  formatPrint () {
    console.log('------------------audio-------------------')
    console.log('sound format      :', this.soundFormat)
    console.log('sampling rate     :', this.samplingRate)
    console.log('sampling precision:', this.samplingPrecision)
    console.log('track             :', this.track)
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): AudioData {
    const audioArg = buffer.readByte()
    const audioFormatType = ((audioArg & 0b11110000) >> 4) as AudioSoundFormat
    const audioSamplingRate = ((audioArg & 0b00001100) >>
      2) as AudioSamplingRate
    const audioSamplePrecision = ((audioArg & 0b00000010) >>
      1) as AudioSamplingPrecision
    const audioTrack = (audioArg & 1) as AudioSoundTrack
    const self = new AudioData()
    self.soundFormat = audioFormatType
    self.samplingRate = audioSamplingRate
    self.samplingPrecision = audioSamplePrecision
    self.track = audioTrack

    const data = buffer.slice(buffer.offset, buffer.limit + 1).toArrayBuffer()
    self.data = data
    return self
  }
}

class Flv implements FromByteBuffer {
  flvHeader: FlvHeader
  flvBody: Array<Tag>
  constructor () {
    this.flvHeader = new FlvHeader()
    this.flvBody = []
  }

  fromByteBuffer (buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }

  static fromByteBuffer (buffer: ByteBuffer): Flv {
    const self = new Flv()
    const header = FlvHeader.fromByteBuffer(buffer)
    header.formatPrint()
    while (true) {
      const previousTagSize = buffer.readUint32()
      const tag = Tag.fromByteBuffer(buffer)
    }
    return self
  }
}

export default Flv
