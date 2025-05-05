<template>
  <v-group>
    <!-- 업로드된 이미지를 렌더링 -->
    <v-image
      v-for="image in images"
      :key="image.name"
      :config="image"
      @click="selectImage(image.name)"
      @transformend="handleTransformEnd"
      draggable
    />
    <!-- Transformer -->
    <v-transformer ref="transformer" />
    <!-- 파일 업로드 버튼 -->
    <v-text :config="textConfig" @click="triggerFileInput" />
    <!-- 숨겨진 파일 입력 -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      @change="onFileChange"
      multiple
    />
  </v-group>
</template>

<script>
export default {
  data() {
    return {
      images: [], // 업로드된 이미지 배열
      selectedImageName: "", // 선택된 이미지 이름
      textConfig: {
        text: "Click to upload images", // 업로드 버튼 텍스트
        fontSize: 18,
        fill: "blue",
        x: 50,
        y: 10,
      },
    };
  },
  methods: {
    // 파일 선택 창 열기
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    // 파일 선택 후 이미지 추가
    onFileChange(event) {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            this.images.push({
              x: 50 + index * 20, // 이미지의 초기 x 좌표
              y: 50 + index * 20, // 이미지의 초기 y 좌표
              width: img.width, // 이미지의 원본 너비
              height: img.height, // 이미지의 원본 높이
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              name: `image${this.images.length + 1}`, // 고유 이름
              image: img, // Konva에서 사용할 이미지 객체
              draggable: true,
            });
          };
        };
        reader.readAsDataURL(file);
      });
    },
    // 이미지 선택
    selectImage(name) {
      this.selectedImageName = name;
      this.updateTransformer(); // Transformer 즉시 업데이트
    },
    // Transformer 업데이트
    updateTransformer() {
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const selectedNode = stage.findOne(`.${this.selectedImageName}`);

      if (selectedNode) {
        transformerNode.nodes([selectedNode]);
        stage.batchDraw(); // Transformer 즉시 렌더링 강제
      } else {
        transformerNode.nodes([]);
        stage.batchDraw(); // Transformer 즉시 렌더링 강제
      }
    },
    // Transform 완료 시 상태 업데이트
    handleTransformEnd(e) {
      const image = this.images.find(
        (img) => img.name === this.selectedImageName
      );
      if (!image) return;

      image.x = e.target.x();
      image.y = e.target.y();
      image.rotation = e.target.rotation();
      image.scaleX = e.target.scaleX();
      image.scaleY = e.target.scaleY();
    },
  },
};
</script>
