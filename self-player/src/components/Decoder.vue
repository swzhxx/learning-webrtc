<script lang="tsx">
  import { defineComponent, onMounted, reactive } from 'vue'
  import ByteBuffer from 'bytebuffer'
  import flv from './../utils/flv'
  export default defineComponent({
    name: 'Decoder',
    props: {},
    setup(props) {
      let data = reactive({
        videoBuffer: []
      })
      onMounted(async () => {
        let response: Response = await fetch('./cuc_ieschool.flv', {
          method: 'get'
        })
        if (!response.body) {
          return
        }
        response.arrayBuffer().then((res) => {
          let byteBuffer = ByteBuffer.wrap(res)
          flv.fromByteBuffer(byteBuffer)
        })

        // let decoder = new Decoder(response.body)
        // decoder.decode()
        // let buffer: any[] = []
        // const reader = response.body.getReader()
        // const stream = new ReadableStream({
        //   start(controller) {
        //     const push = () => {
        //       reader.read().then(({ done, value }) => {
        //         console.log('value', value)
        //         buffer = buffer.concat(value)
        //         if (!done) {
        //           push()
        //         }
        //       })
        //     }
        //     push()
        //   }
        // })
        // data.videoBuffer = response
      })
      return () => {
        return <canvas></canvas>
      }
    }
  })
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
