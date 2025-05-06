<template>
  <div>
    <!-- 삭제 버튼 -->
    <button @click="handleDelete" style="margin-bottom: 10px">쓸액이통</button>

    <!-- 색상 선택 및 캔버스 -->
    <ImageCanvas ref="imageCanvas" />
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
      const imageLoader = this.$refs.imageLoader;
      const imageCanvas = this.$refs.imageCanvas;

      // 이미지 삭제
      if (imageLoader.selectedImageName) {
        imageLoader.deleteImage(imageLoader.selectedImageName);
        return;
      }

      // 도형 삭제
      if (imageCanvas.selectedItemIndex !== null) {
        imageCanvas.deleteShape(imageCanvas.selectedItemIndex);
        return;
      }

      alert("삭제할 항목을 선택해주세요!");
    },
  },
};
</script>
