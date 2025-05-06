<template>
  <div>
    <!-- 삭제 버튼 -->
    <button @click="handleDelete" style="margin-bottom: 10px">쓸액이통</button>

    <!-- 색상 선택 및 캔버스 -->
    <ImageCanvas />
    <v-stage ref="stage" :config="stageSize">
      <v-layer ref="layer">
        <ImageLoader ref="imageLoader" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import ImageLoader from "../components/ImageLoader.vue";
import ImageCanvas from "../components/ImageCanvas.vue";

export default {
  components: {
    ImageLoader,
    ImageCanvas,
  },
  data() {
    return {
      stageSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  },
  methods: {
    handleDelete() {
      // 선택된 이미지를 삭제
      const imageLoader = this.$refs.imageLoader;
      if (imageLoader.selectedImageName) {
        imageLoader.deleteImage(imageLoader.selectedImageName);
      } else {
        alert("이미지를 선택해주세요~");
      }
    },
  },
};
</script>
