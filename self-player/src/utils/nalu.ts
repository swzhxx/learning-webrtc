import ByteBuffer from 'bytebuffer'
export enum NaluType {
  NALU_TYPE_SLICE = 1,
  NALU_TYPE_DPA = 2,
  NALU_TYPE_DPB = 3,
  NALU_TYPE_DPC = 4,
  NALU_TYPE_IDR = 5,
  NALU_TYPE_SPS = 7,
  NALU_TYPE_PPS = 8,
  NALU_TYPE_AUD = 9,
  NALU_TYPE_EOSEQ = 10,
  NALU_TYPE_EOSTREAM = 11,
  NALU_TYPE_FILL = 12
}

export enum NaluPriority {
  NALU_PRIORITY_DISPOSABLE = 0,
  NALU_PRIORITY_LOW = 1,
  NALU_PRIORITY_HIGH = 2,
  NALU_PRIORITY_HIGHEST = 3
}
export default class Nalu {
  forbiddenBit: number
  nalReferenceIdc: number
  nalUnitType: number

  data: ByteBuffer
  constructor (
    forbiddenBit: number,
    nalReferenceIdc: number,
    nalUnitType: number,
    data: ByteBuffer
  ) {
    this.forbiddenBit = forbiddenBit
    this.nalReferenceIdc = nalReferenceIdc
    this.nalUnitType = nalUnitType
    this.data = data
  }

  static findStartCode (buffer: ByteBuffer): boolean {
    if (
      buffer.view[buffer.limit] !== 0 ||
      buffer.view[buffer.limit + 1] !== 0 ||
      buffer.view[buffer.limit + 2] !== 1
    ) {
      return false
    }
    return true
  }

  static findStartCode2 (buffer: ByteBuffer): boolean {
    if (
      buffer.view[buffer.limit] !== 0 ||
      buffer.view[buffer.limit + 1] !== 0 ||
      buffer.view[buffer.limit + 2] !== 0 ||
      buffer.view[buffer.limit + 3] !== 1
    ) {
      return false
    }
    return true
  }

  static getAnnexNalu (buffer: ByteBuffer): Nalu | null {
    let pos = 0
    const startCodePrefix = buffer.slice(buffer.offset, buffer.offset + 3)
    if (!Nalu.findStartCode(startCodePrefix)) {
      try {
        const byte: number = buffer.view[buffer.limit + 3]
        startCodePrefix.append(new Uint8Array(1).fill(byte))
        if (!Nalu.findStartCode2(startCodePrefix)) {
          return null
        }
        pos = 4
      } catch (e) {
        return null
      }
    } else {
      pos = 3
    }
    let startCodeFound = 0
    let rewind = 0
    const naluBuffer = new ByteBuffer(0)
    while (startCodeFound !== 0) {
      naluBuffer.writeByte(buffer.readByte())
      if (Nalu.findStartCode(buffer.slice(buffer.view.byteLength - 3))) {
        startCodeFound = 1
        rewind = 3
        buffer.readBytes(-3)
      } else if (
        Nalu.findStartCode2(buffer.slice(buffer.view.byteLength - 4))
      ) {
        rewind = 4
        startCodeFound = 1
        buffer.readBytes(-4)
      }
    }
    naluBuffer.readBytes(-rewind)
    const len = naluBuffer.view.byteLength - rewind
    const forbinddenBit = naluBuffer.view[0] & 0x80
    const nalReferenceIdc = naluBuffer.view[0] & 0x60
    const nalUnitType = naluBuffer.view[0] & 0x1f

    return new Nalu(
      forbinddenBit,
      nalUnitType,
      nalReferenceIdc,
      naluBuffer.slice(1)
    )
  }

  static fromByteBuffer (buffer: ByteBuffer): Array<Nalu> {
    const nalus: Array<Nalu> = []
    while (buffer.offset < buffer.limit) {
      // const nalu = new Nalu(0, 0, 0, new ByteBuffer(0))
      const nalu = Nalu.getAnnexNalu(buffer)
      if (nalu == null) {
        continue
      }
      nalus.push(nalu)
    }
    return nalus
  }
}
