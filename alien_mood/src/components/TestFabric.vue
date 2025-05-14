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

    <!-- Fabric.js 캔버스 -->
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
import { markRaw } from "vue";

import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";
import image4 from "@/assets/image/다가오는솔라스 (1).jpg";
import image5 from "@/assets/image/다가오는솔라스 (2).jpg";
import image6 from "@/assets/image/다가오는솔라스 (4).jpg";

export default {
  data() {
    return {
      canvas: null, // Fabric.js 캔버스 객체
      predefinedImages: [image4, image5, image6], // 기본 이미지 변경용 이미지
      additionalImages: [image1, image2, image3], // 추가 이미지용 이미지
      selectedObject: null, // 선택된 객체
      defaultImageObject: null, // 기본 이미지 객체 참조
    };
  },
  mounted() {
    this.initializeCanvas();
  },
  methods: {
    // 캔버스 초기화
    initializeCanvas() {
      if (!window.fabric || !window.fabric.Canvas) {
        console.error("Fabric.js가 로드되지 않았습니다.");
        return;
      }

      this.canvas = markRaw(
        new window.fabric.Canvas(this.$refs.canvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
        })
      );

      console.log("캔버스 초기화 성공:", this.canvas);

      // 기본 이미지 추가
      const img = new Image();
      img.src = this.predefinedImages[0]; // 첫 번째 기본 이미지
      img.onload = () => {
        const fabricImage = markRaw(
          new window.fabric.Image(img, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            width: 200, // 고정된 너비
            height: 200, // 고정된 높이
            scaleX: 1, // 스케일 고정
            scaleY: 1, // 스케일 고정
            selectable: false, // 선택 불가능
            evented: false, // 이벤트 비활성화
            hasControls: false, // 컨트롤 핸들 숨김
            hasBorders: false, // 테두리 숨김
            lockMovementX: true, // X축 이동 고정
            lockMovementY: true, // Y축 이동 고정
            lockScalingX: true, // X축 크기 조절 고정
            lockScalingY: true, // Y축 크기 조절 고정
            lockRotation: true, // 회전 고정
          })
        );

        this.canvas.add(fabricImage);
        this.defaultImageObject = fabricImage; // 기본 이미지 객체 참조 저장
        this.canvas.renderAll();
      };

      // 객체 선택 이벤트
      this.canvas.on("object:selected", (e) => {
        this.selectedObject = e.target;
        console.log("선택된 객체:", this.selectedObject);
      });

      // 선택 해제 이벤트
      this.canvas.on("selection:cleared", () => {
        this.selectedObject = null;
        console.log("선택이 해제되었습니다.");
      });
    },

    // 이미지 추가
    addImage(imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const fabricImage = markRaw(
          new window.fabric.Image(img, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
          })
        );
        this.canvas.add(fabricImage);
        this.canvas.setActiveObject(fabricImage);
        this.canvas.renderAll();
      };
    },

    // 기본 이미지 변경
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImageObject) {
        console.error("기본 이미지 객체가 없습니다.");
        return;
      }

      const img = new Image();
      img.src = newImageSrc;
      img.onload = () => {
        this.defaultImageObject.setElement(img);
        this.defaultImageObject.set({
          width: 200, // 고정된 너비
          height: 200, // 고정된 높이
          scaleX: 1, // 스케일 고정
          scaleY: 1, // 스케일 고정
          selectable: false, // 선택 불가능
          evented: false, // 이벤트 비활성화
          hasControls: false, // 컨트롤 핸들 숨김
          hasBorders: false, // 테두리 숨김
          lockMovementX: true, // X축 이동 고정
          lockMovementY: true, // Y축 이동 고정
          lockScalingX: true, // X축 크기 조절 고정
          lockScalingY: true, // Y축 크기 조절 고정
          lockRotation: true, // 회전 고정
        });
        this.canvas.renderAll();
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

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const fabricImage = markRaw(
              new window.fabric.Image(img, {
                left: 100,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
              })
            );
            this.canvas.add(fabricImage);
            this.canvas.setActiveObject(fabricImage);
            this.canvas.renderAll();
          };
        };
        reader.readAsDataURL(file);
      });
    },

    // 선택된 객체 삭제
    handleDelete() {
      // 현재 활성화된 객체 가져오기
      const activeObject = this.canvas.getActiveObject();

      if (activeObject) {
        console.log("삭제할 객체:", activeObject);

        // 기본 이미지가 선택된 경우 삭제 방지
        if (activeObject === this.defaultImageObject) {
          alert("기본 이미지는 삭제할 수 없습니다.");
          return;
        }

        // 객체 삭제
        this.canvas.remove(activeObject);
        this.canvas.discardActiveObject(); // 활성화된 객체 초기화
        this.canvas.renderAll(); // 캔버스 다시 렌더링
      } else {
        alert("삭제할 객체를 선택하세요!");
      }
    },

    // 선택된 객체 크기 조정
    resizeSelectedObject(scale) {
      if (this.selectedObject) {
        this.selectedObject.scaleX *= scale;
        this.selectedObject.scaleY *= scale;
        this.canvas.renderAll();
      }
    },
  },
};
</script>

<style>
/* 추가적인 스타일이 필요하면 여기에 작성하세요 */
</style>
