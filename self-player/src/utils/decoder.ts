// import byte from 'byte'

interface AsyncFrom<Readable, Self> {
  asyncFrom(stream: Readable): Promise<Self>
}

class FlvHeader implements AsyncFrom<ReadableStream, FlvHeader> {
  flags: number
  version: number
  signautre: string
  headerSize: number
  constructor() {
    this.flags = 0
    this.version = 0
    this.signautre = ''
    this.headerSize = 0
  }
  asyncFrom(stream: ReadableStream<any>): Promise<FlvHeader> {
    throw new Error('Method not implemented.')
  }

  // from(stream: ReadableStream<any>): void {
  //   throw new Error('Method not implemented.')
  // }
  static asyncFrom(stream: ReadableStream<any>): Promise<FlvHeader> {
    throw new Error('Method not implemented.')
    // Promise.resolve(new FlvHeader())
  }
}

class Tag {}

class TagHeader {}

class FlvDecoder {}

export default FlvDecoder
