<template>
  <div style="position: relative; width: 100%; height: 100%">
    <!-- 삭제 버튼 -->
    <button
      @click="handleDelete"
      style="
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 10px;
        background-color: red;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
      "
    >
      삭제
    </button>

    <!-- 이미지 추가 버튼 -->
    <div
      style="
        position: absolute;
        top: 50px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <button
        v-for="(image, index) in additionalImages"
        :key="'add-' + index"
        @click="addImage(image)"
        style="
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: lightgray;
        "
      >
        이미지 추가 {{ index + 1 }}
      </button>
    </div>

    <!-- 기본 이미지 변경 버튼 -->
    <div
      style="
        position: absolute;
        top: 100px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <button
        v-for="(image, index) in predefinedImages"
        :key="'replace-' + index"
        @click="replaceDefaultImage(image)"
        style="
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: lightblue;
        "
      >
        기본 이미지 변경 {{ index + 1 }}
      </button>
    </div>

    <!-- 파일 업로드 버튼 -->
    <button
      @click="triggerFileInput"
      style="
        position: absolute;
        top: 150px;
        left: 10px;
        padding: 10px;
        background-color: blue;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
      "
    >
      이미지 첨부
    </button>

    <!-- 숨겨진 파일 입력 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileChange"
      multiple
    />

    <!-- Konva Stage -->
    <v-stage :config="stageSize">
      <v-layer>
        <!-- 기본 이미지 렌더링 -->
        <v-image v-if="defaultImage" :config="defaultImage" draggable />
        <!-- 추가된 이미지 렌더링 -->
        <v-image
          v-for="image in images"
          :key="image.name"
          :config="image"
          :name="image.name"
          @pointerdown="selectImage(image.name)"
          @transformend="handleTransformEnd"
          draggable
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        />
        <!-- Transformer -->
        <v-transformer
          ref="transformer"
          :enabledAnchors="[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";
import image4 from "@/assets/image/다가오는솔라스 (1).jpg";
import image5 from "@/assets/image/다가오는솔라스 (2).jpg";
import image6 from "@/assets/image/다가오는솔라스 (4).jpg";

export default {
  data() {
    return {
      stageSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      predefinedImages: [image4, image5, image6], // 기본 이미지 변경용 이미지
      additionalImages: [image1, image2, image3], // 추가 이미지용 이미지
      defaultImage: null, // 기본 이미지 객체
      images: [],
      selectedImageName: "",
    };
  },
  mounted() {
    this.initializeDefaultImage();
  },
  methods: {
    // 기본 이미지 초기화
    initializeDefaultImage() {
      const img = new Image();
      img.src = this.predefinedImages[0]; // 첫 번째 이미지를 기본 이미지로 설정
      img.onload = () => {
        const aspectRatio = img.height / img.width; // 이미지 비율 계산
        this.defaultImage = {
          x: this.stageSize.width / 2 - 100, // 200의 절반인 100으로 위치 조정
          y: this.stageSize.height / 2 - (200 * aspectRatio) / 2, // 높이에 따라 중앙 정렬
          width: 200, // 고정된 너비
          height: 200 * aspectRatio, // 비율에 따른 높이
          image: img,
          draggable: true,
        };
      };
    },
    // 기본 이미지 변경
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImage) return;

      const img = new Image();
      img.src = newImageSrc;
      img.onload = () => {
        const aspectRatio = img.height / img.width; // 이미지 비율 계산
        this.defaultImage.image = img; // 이미지 내용 교체
        this.defaultImage.width = 200; // 고정된 너비
        this.defaultImage.height = 200 * aspectRatio; // 비율에 따른 높이
        this.defaultImage.x = this.stageSize.width / 2 - 100; // 위치 재조정
        this.defaultImage.y =
          this.stageSize.height / 2 - (200 * aspectRatio) / 2; // 위치 재조정
      };
    },
    // 미리 정의된 추가 이미지 추가
    addImage(imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        this.images.push({
          x: (Math.random() * this.stageSize.width) / 2,
          y: (Math.random() * this.stageSize.height) / 2,
          width: img.width,
          height: img.height,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          name: `image${this.images.length + 1}`,
          image: img,
          draggable: true,
        });
      };
    },
    // 파일 선택 창 열기
    triggerFileInput() {
      const fileInput = this.$refs.fileInput;
      if (fileInput) {
        fileInput.click();
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
            // 이미지 크기 조정
            const maxSize = 200; // 최대 크기 200px
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > width && height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            } else if (width > maxSize) {
              width = maxSize;
              height = maxSize;
            }

            this.images.push({
              x: 50 + index * 20,
              y: 50 + index * 20,
              width: width, // 조정된 너비
              height: height, // 조정된 높이
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              name: `image${this.images.length + 1}`,
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

      // 선택된 이미지를 배열의 맨 뒤로 이동
      const imageIndex = this.images.findIndex((img) => img.name === name);
      if (imageIndex > -1) {
        const image = this.images.splice(imageIndex, 1)[0]; // 배열에서 제거
        this.images.push(image); // 배열의 맨 뒤로 추가
      }

      this.updateTransformer();
    },
    // Transformer 업데이트
    updateTransformer() {
      const transformer = this.$refs.transformer?.getNode();
      if (!transformer) {
        console.warn("Transformer is not initialized.");
        return;
      }

      const stage = transformer.getStage();
      const selectedNode = stage.findOne(`.${this.selectedImageName}`);

      if (selectedNode) {
        transformer.nodes([selectedNode]);
        stage.batchDraw();
      } else {
        transformer.nodes([]);
        stage.batchDraw();
      }
    },
    // Transform 완료 시 상태 업데이트
    handleTransformEnd(e) {
      if (!e || !e.target) {
        console.warn("Transform event is missing or invalid.");
        return;
      }

      const item = this.images.find(
        (img) => img.name === this.selectedImageName
      );

      if (!item) {
        console.warn("No item found to update.");
        return;
      }

      item.x = e.target.x();
      item.y = e.target.y();
      item.width = e.target.width();
      item.height = e.target.height();
      item.rotation = e.target.rotation();
    },
    // 드래그 시작 및 종료
    onDragStart(e) {
      e.target.addName("dragging");
    },
    onDragEnd(e) {
      const stage = e.target.getStage();
      const draggedNode = stage.findOne(".dragging");
      if (draggedNode) {
        draggedNode.removeName("dragging");
      }
    },
    // 항목 삭제
    handleDelete() {
      if (this.selectedImageName) {
        this.images = this.images.filter(
          (img) => img.name !== this.selectedImageName
        );
        this.selectedImageName = "";
        this.updateTransformer();
      } else {
        alert("삭제할 항목을 선택해주세요!");
      }
    },
  },
};
</script>
