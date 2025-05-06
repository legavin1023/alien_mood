<template>
  <v-group>
    <!-- 업로드된 이미지를 렌더링 -->
    <v-image
      v-for="image in images"
      :key="image.name"
      :config="image"
      :name="image.name"
      @click="selectImage(image.name)"
      @transformend="handleTransformEnd"
      draggable
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      class="imageButton"
    />
    <!-- Transformer -->
    <v-transformer ref="transformer" />
    <!-- 파일 업로드 버튼 -->
    <v-text :config="textConfig" @click="triggerFileInput" />
    <!-- 숨겨진 파일 입력 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
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
        text: "이미지 첨부", // 업로드 버튼 텍스트
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
      const fileInput = this.$refs.fileInput;
      if (fileInput) {
        fileInput.click(); // 파일 선택 창 열기
      } else {
        console.error("File input element not found.");
      }
    },
    // 파일 선택 후 이미지 추가
    onFileChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;

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
    // 드래그 시작 시 클래스 추가
    onDragStart(e) {
      e.target.addName("dragging");
    },
    // 드래그 종료 시 클래스 제거
    onDragEnd(e) {
      const stage = e.target.getStage();
      const draggedNode = stage.findOne(".dragging");
      if (draggedNode) {
        draggedNode.removeName("dragging");
      }
      const name = e.target.name(); // 드래그된 이미지의 이름 가져오기
      this.$emit("drag-end", name);
    },
    // 이미지 삭제
    deleteImage(name) {
      this.images = this.images.filter((img) => img.name !== name);
      if (this.selectedImageName === name) {
        this.selectedImageName = "";
        this.updateTransformer(); // Transformer 초기화
      }
    },
  },
};
</script>

<style>
.imageButton {
  position: fixed;
  top: 10px;
}
</style>
