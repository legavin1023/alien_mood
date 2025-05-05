<template>
  <v-stage ref="stage" :config="stageSize">
    <v-layer ref="layer">
      <ImageLoader />
    </v-layer>
  </v-stage>
</template>

<script>
import ImageLoader from "../components/ImageLoader.vue";

export default {
  components: {
    ImageLoader,
  },
  data() {
    return {
      stageSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  },
};
</script>
