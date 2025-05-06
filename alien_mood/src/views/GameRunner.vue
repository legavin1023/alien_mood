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

    <!-- 이미지 선택 버튼 -->
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
        v-for="(image, index) in predefinedImages"
        :key="index"
        @click="addImage(image)"
        style="
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: lightgray;
        "
      >
        이미지 {{ index + 1 }}
      </button>
    </div>

    <!-- 파일 업로드 버튼 -->
    <button
      @click="triggerFileInput"
      style="
        position: absolute;
        top: 100px;
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
        <!-- 도형 렌더링 -->
        <v-rect
          v-for="(item, index) in items"
          :key="'shape-' + index"
          :config="item"
          @click="selectItem(index)"
          @touchstart="selectItem(index)"
          @transformend="handleTransformEnd(index, $event)"
          draggable
        />
        <!-- 이미지 렌더링 -->
        <v-image
          v-for="image in images"
          :key="image.name"
          :config="image"
          :name="image.name"
          @click="selectImage(image.name)"
          @touchstart="selectImage(image.name)"
          @transformend="handleTransformEnd"
          draggable
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        />
        <!-- Transformer -->
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";

export default {
  data() {
    return {
      stageSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      predefinedImages: [image1, image2, image3], // 미리 정의된 이미지
      images: [],
      selectedItemIndex: null,
      selectedImageName: "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTransformer();
    });
  },
  methods: {
    // 도형 추가
    addItem(color) {
      this.items.push({
        x: this.stageSize.width / 2 - 50,
        y: this.stageSize.height / 2 - 50,
        width: 100,
        height: 100,
        fill: color,
        rotation: 0,
        draggable: true,
        name: `item-${this.items.length}`,
      });
    },
    // 미리 정의된 이미지 추가
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
    selectItem(index) {
      this.selectedItemIndex = index;
      this.selectedImageName = null;
      this.updateTransformer();

      // 선택된 도형을 배열의 맨 뒤로 이동
      const item = this.items[index];
      this.items.splice(index, 1); // 배열에서 제거
      this.items.push(item); // 배열의 맨 뒤로 추가

      // Transformer 업데이트
      this.updateTransformer();
    },
    // 이미지 선택
    selectImage(name) {
      this.selectedImageName = name;
      this.selectedItemIndex = null;
      this.updateTransformer();

      // 선택된 이미지를 배열의 맨 뒤로 이동
      const imageIndex = this.images.findIndex((img) => img.name === name);
      if (imageIndex > -1) {
        const image = this.images[imageIndex];
        this.images.splice(imageIndex, 1); // 배열에서 제거
        this.images.push(image); // 배열의 맨 뒤로 추가
      }

      // Transformer 업데이트
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
      const selectedNode =
        this.selectedItemIndex !== null
          ? stage.findOne(`.item-${this.selectedItemIndex}`)
          : stage.findOne(`.${this.selectedImageName}`);

      if (selectedNode) {
        transformer.nodes([selectedNode]);
        stage.batchDraw();
      } else {
        transformer.nodes([]);
        stage.batchDraw();
      }
    },
    // Transform 완료 시 상태 업데이트
    handleTransformEnd(index, e) {
      // 이벤트 객체가 유효한지 확인
      if (!e || !e.target) {
        console.warn("Transform event is missing or invalid.");
        return;
      }

      // 선택된 항목이 도형인지 이미지인지 확인
      const item =
        this.selectedItemIndex !== null
          ? this.items[index]
          : this.images.find((img) => img.name === this.selectedImageName);

      if (!item) {
        console.warn("No item found to update.");
        return;
      }

      // Transformer로부터 업데이트된 속성 가져오기
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
      if (this.selectedItemIndex !== null) {
        this.items.splice(this.selectedItemIndex, 1);
        this.selectedItemIndex = null;
        this.updateTransformer();
      } else if (this.selectedImageName) {
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

<style>
.imageButton {
  position: fixed;
  top: 10px;
}
</style>
