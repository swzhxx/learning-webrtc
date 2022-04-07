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
  //占用3个字节 一般前三个字符固定为FLV
  signautre: string
  //占用1个字节
  version: number
  //占用1个字节 第0位和第二位分别表示video和audio存在的情况
  flags: number
  //4个字节，固定为9
  dataOffset: number
  constructor() {
    this.flags = 0
    this.version = 0
    this.signautre = ''
    this.dataOffset = 0
  }
  formatPrint(): void {
    console.log('------------------FLV HEADER----------------')
    console.log('signautre :  %s', this.signautre)
    console.log('version   :  %s', this.version)
    console.log('flags     :  %s', this.flags)
    console.log('dataOffset:  %s', this.dataOffset)
    console.log('--------------------------------------------')
  }
  fromByteBuffer(buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }
  static fromByteBuffer(buffer: ByteBuffer): FlvHeader {
    let char1 = String.fromCharCode(buffer.readByte())
    let char2 = String.fromCharCode(buffer.readByte())
    let char3 = String.fromCharCode(buffer.readByte())
    let self = new FlvHeader()

    let version = buffer.readByte()
    let flags = buffer.readByte()

    self.signautre = `${char1}${char2}${char3}`
    self.version = version
    self.flags = flags
    self.dataOffset = buffer.readInt32()
    return self
  }
}

class Tag implements FromByteBuffer {
  tagHeader: TagHeader
  tagData: Array<number>
  constructor() {
    this.tagHeader = new TagHeader()
    this.tagData = []
  }
  fromByteBuffer(buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }
  static fromByteBuffer(buffer: ByteBuffer): Tag {
    // throw new Error('Method not implemented.')
    let tagHeader = TagHeader.fromByteBuffer(buffer)
    let tagData = buffer.readBytes(tagHeader.dataSize)
    let tag = new Tag()
    tag.tagHeader = tagHeader
    if (tag.tagHeader.type == FlvTagType.ScriptData) {
      let scriptData = ScriptData.fromByteBuffer(tagData)
    }
    // tag.tagData = tagData
    return tag
  }
}

class TagHeader implements FromByteBuffer {
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

  constructor() {
    this.type = 0
    this.dataSize = 0
    this.timeStamp = 0
    this.timeStampEx = 0
    this.streamId = 0
  }
  getTimeStamp(): number {
    if (this.timeStamp == 1677215) {
      return (this.timeStamp << 8) + this.timeStampEx
    } else {
      return this.timeStamp
    }
  }
  fromByteBuffer(buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }
  static fromByteBuffer(buffer: ByteBuffer): TagHeader {
    let type = number2TagType(buffer.readByte())
    let dataSize = (buffer.readInt16() << 8) + buffer.readInt8()
    let timeStamp = (buffer.readInt16() << 8) + buffer.readInt8()
    let timeStampEx = buffer.readInt8()
    let streamId = (buffer.readInt16() << 8) + buffer.readInt8()

    let self = new TagHeader()
    self.type = type
    self.dataSize = dataSize
    self.timeStamp = timeStamp
    self.timeStampEx = timeStampEx
    self.streamId = streamId
    // throw new Error('Method not implemented.')
    return self
  }
}

class ScriptData implements FromByteBuffer {
  // private duration: Uint8Array
  // private width: Uint8Array
  // private height: Uint8Array
  // private videodatarate: Uint8Array
  // private framerate: Uint8Array
  // private videocodecid: Uint8Array
  // private data: Uint8Array
  constructor() {}
  fromByteBuffer(buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }
  static fromByteBuffer(byteBuffer: ByteBuffer): ScriptData {
    let buffer = Buffer.from(byteBuffer.toArrayBuffer())
    let onMetaData = fromAMF(buffer)

    console.log('onMetaData', onMetaData)
    let metaInfo = fromAMF(buffer.slice(13))
    console.log('metaInfo', metaInfo)
    return new ScriptData()
    // throw new Error('Method not implemented.')
  }
}
class VideoData {}
class AudioData {}

class FlvDecoder implements FromByteBuffer {
  flvHeader: FlvHeader
  flvBody: Array<Tag>
  constructor() {
    this.flvHeader = new FlvHeader()
    this.flvBody = []
  }
  fromByteBuffer(buffer: ByteBuffer): this {
    throw new Error('Method not implemented.')
  }
  static fromByteBuffer(buffer: ByteBuffer): FlvDecoder {
    let self = new FlvDecoder()
    let header = FlvHeader.fromByteBuffer(buffer)
    header.formatPrint()
    while (true) {
      let previousTagSize = buffer.readInt32()
      let tag = Tag.fromByteBuffer(buffer)
    }
    return self
  }
}

export default FlvDecoder
