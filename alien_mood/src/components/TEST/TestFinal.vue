<template>
  <!-- UI 패널: 이모티콘, 도형, 이미지, 옷, 색상, 포즈, 저장 버튼 등 -->
  <div style="position: relative; width: 100%; height: 100%">
    <div
      style="
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
      "
    >
      <!-- 이모티콘 추가 버튼 -->
      <button
        v-for="img in additionalImages"
        :key="img.src"
        @click="addImage(img.src)"
        style="background: none; border: none; cursor: pointer"
      >
        <img :src="img.src" :alt="img.label" width="32" height="32" />
      </button>
      <!-- 도형 추가 버튼 -->
      <button @click="addRectangle">도형 추가</button>
      <!-- 기본 이미지 교체 버튼 -->
      <button
        v-for="(img, idx) in predefinedImages"
        :key="'replace-img-' + idx"
        @click="replaceDefaultImage(img)"
      >
        기본 이미지 변경 {{ idx + 1 }}
      </button>
      <!-- 파일 첨부 버튼 -->
      <button @click="triggerFileInput">이미지 첨부</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileChange"
      />
      <!-- SVG 색상 변경 버튼 (예시) -->
      <div>
        <button
          v-for="(btn, idx) in colorButtonList"
          :key="btn.label + idx"
          @click="changeSvgColorsByIds(btn.colors)"
        >
          {{ btn.label }}
        </button>
      </div>
      <!-- 옷 종류별 아이콘 버튼 -->
      <div style="display: flex; gap: 8px">
        <button
          v-for="clothes in clothesList"
          :key="clothes.name"
          @click="selectClothes(clothes)"
          style="background: none; border: none; cursor: pointer"
        >
          <img :src="clothes.icon" :alt="clothes.name" width="48" height="48" />
          <div>{{ clothes.name }}</div>
        </button>
      </div>
      <!-- 옷 색상 옵션 버튼 (입힌 옷이 있을 때만) -->
      <div v-if="selectedClothes" style="margin: 12px 0">
        <button
          v-for="(btn, idx) in selectedClothes.colorButtons"
          :key="btn.label + idx"
          @click="changeClothesColors(btn.targets, selectedClothes.name, idx)"
          style="display: flex; align-items: center; gap: 8px"
        >
          <span
            v-if="btn.mainColor"
            :style="{
              display: 'inline-block',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: btn.mainColor,
              border: '1px solid #aaa',
            }"
          ></span>
          {{ btn.label }}
        </button>
      </div>
      <!-- 포즈 선택 버튼 -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <button
          v-for="pose in ['인간', '인간팔']"
          :key="pose"
          :style="{
            background: currentPose === pose ? '#00bfff' : '#eee',
            color: currentPose === pose ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '6px 16px',
            cursor: 'pointer',
          }"
          @click="changePose(pose)"
        >
          {{ pose }}
        </button>
      </div>
      <!-- 캔버스 저장 버튼 -->
      <button @click="saveCanvasAsImage">이미지로 저장</button>
    </div>
    <!-- Fabric.js 캔버스 -->
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<script>
// 이미지, SVG 등 리소스 import
const req = require.context("@/assets/image", false, /\.png$/);
const additionalImages = req.keys().map((key, idx) => ({
  src: req(key),
  label: `emoji${idx + 1}`,
}));

import { ref, onMounted, markRaw } from "vue";
import {
  Canvas,
  Rect,
  Image as FabricImage,
  Control,
  util,
  controlsUtils,
  loadSVGFromURL,
} from "fabric";
import image1 from "@/assets/image/Ae.png";
import image2 from "@/assets/image/Ai.png";
import image3 from "@/assets/image/css.png";
import image4 from "@/assets/image/다가오는솔라스 (1).jpg";
import image5 from "@/assets/image/다가오는솔라스 (2).jpg";
import image6 from "@/assets/image/다가오는솔라스 (4).jpg";
import deleteIcon from "@/assets/image/deleteIcon.png";
import rotateIcon from "@/assets/image/custom-handle.png";
import resizeIcon from "@/assets/image/html.png";
import svgUrl from "@/assets/image/green.svg";
import shirt from "@/assets/image/shirt.svg";
import shirtArm from "@/assets/image/shirt팔.svg";
import drass from "@/assets/image/dress.svg";
import drassArm from "@/assets/image/dress팔.svg";
import human from "@/assets/image/인간.svg";
import humanArm from "@/assets/image/인간팔.svg";

export default {
  data() {
    return {
      canvas: null, // Fabric.js 캔버스 인스턴스
      isRestoring: false, // 복원 중 여부
      predefinedImages: [image4, image5, image6], // 기본 이미지 목록
      additionalImages: [
        { src: image1, label: "에펙" },
        { src: image2, label: "일러" },
        { src: image3, label: "html" },
        // ...이모티콘 추가
      ],
      defaultImageObject: null, // 교체 가능한 기본 이미지 오브젝트
      currentPose: "인간", // 현재 포즈 상태
      colorButtonList: [
        // SVG 색상 변경용 버튼 예시
        {
          label: "핑크색",
          colors: [
            { id: "green_1", color: "#ff0055" },
            { id: "green_2", color: "#00bfff" },
          ],
        },
        {
          label: "초록색",
          colors: [
            { id: "green_1", color: "#00cc44" },
            { id: "green_2", color: "#ffe066" },
          ],
        },
      ],
      // 옷 목록 (포즈별 SVG, 위치, 색상 옵션 포함)
      clothesList: [
        {
          name: "드레스",
          icon: drass,
          svgUrl: {
            인간: drass,
            인간팔: drassArm,
          },
          position: {
            인간: { left: 90, top: 470 },
            인간팔: { left: 170, top: 480 },
          },
          colorButtons: [
            {
              label: "핑크/파랑",
              mainColor: "#ff69b4", // 대표색
              targets: [
                { type: "id", value: "dress_body1", color: "#ff69b4" },
                { type: "id", value: "dress_body2", color: "#ff69b4" },
                { type: "id", value: "belt", color: "#00bfff" },
              ],
            },
            {
              label: "핑크/노랑",
              mainColor: "#ffe066",
              targets: [
                { type: "id", value: "dress_body1", color: "#ff69b4" },
                { type: "id", value: "dress_body2", color: "#ff69b4" },
                { type: "id", value: "belt", color: "#ffe066" },
              ],
            },
            {
              label: "노랑/파랑",
              mainColor: "#00cc44",
              targets: [
                { type: "id", value: "dress_body1", color: "#00cc44" },
                { type: "id", value: "dress_body2", color: "#00cc44" },
                { type: "id", value: "belt", color: "#00bfff" },
              ],
            },
          ],
        },
        {
          name: "셔츠",
          icon: shirt,
          svgUrl: {
            인간: shirt,
            인간팔: shirtArm,
          },
          position: {
            인간: { left: 70, top: 440 },
            인간팔: { left: 160, top: 440 },
          },
          colorButtons: [
            {
              label: "검정/흰색색",
              mainColor: "#3E3E3EFF", // 대표색
              targets: [
                { type: "id", value: "main", color: "#3E3E3EFF" },
                { type: "id", value: "collar", color: "#DDDDDDFF" },
              ],
            },
            {
              label: "주황/초록",
              mainColor: "#FF6969FF",
              targets: [
                { type: "id", value: "main", color: "#FF6969FF" },
                { type: "id", value: "collar", color: "#66FF87FF" },
              ],
            },
            {
              label: "보라/노랑",
              mainColor: "#C2CC00FF",
              targets: [
                { type: "id", value: "main", color: "#C2CC00FF" },
                { type: "id", value: "collar", color: "#5900FFFF" },
              ],
            },
          ],
        },
      ],
      selectedClothes: null, // 현재 선택된 옷 데이터
      selectedColorIndexes: {}, // { [clothes.name]: index }
    };
  },
  methods: {
    //상태 저장
    saveAvatarToLocal() {
      const data = {
        currentPose: this.currentPose,
        selectedClothesName: this.selectedClothes?.name,
        selectedColorIndexes: this.selectedColorIndexes,
        // 필요하다면 배경, 추가 이미지 등도 포함
      };

      localStorage.setItem("avatarOptions", JSON.stringify(data));
    },
    // 로컬 스토리지에서 아바타 복원
    restoreAvatarFromLocal() {
      this.isRestoring = true;
      const data = localStorage.getItem("avatarOptions");
      if (!data) {
        this.isRestoring = false;
        return;
      }
      const parsed = JSON.parse(data);

      // 1. 색상 인덱스 복원
      if (parsed.selectedColorIndexes) {
        this.selectedColorIndexes = parsed.selectedColorIndexes;
      }

      // 2. 포즈 복원
      if (parsed.currentPose) this.currentPose = parsed.currentPose;

      // 3. 인간 SVG를 포즈에 맞게 다시 그림
      this.addHumanSvg();

      // 4. 옷 복원 + 색상 적용
      if (parsed.selectedClothesName) {
        const clothes = this.clothesList.find(
          (c) => c.name === parsed.selectedClothesName
        );
        if (clothes) {
          this.selectClothes(clothes);
          const idx = parsed.selectedColorIndexes?.[clothes.name] ?? 0;
          const btn = clothes.colorButtons[idx];
          if (btn) {
            this.changeClothesColors(btn.targets, clothes.name, idx);
          }
        }
      }
      this.isRestoring = false;
    },
    // 포즈에 따라 인간 SVG를 캔버스에 추가
    async addHumanSvg() {
      // 기존 인간 SVG가 있으면 삭제
      if (this.humanSvgGroup) {
        this.canvas.remove(this.humanSvgGroup);
        this.humanSvgGroup = null;
      }
      const humanSvgUrl = this.currentPose === "인간팔" ? humanArm : human;
      const loadedSVG = await loadSVGFromURL(humanSvgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
      svgGroup.set({
        left: 100,
        top: this.canvas.height / 2,
        originX: "left",
        originY: "center",
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      this.canvas.add(svgGroup);
      this.humanSvgGroup = svgGroup;
      this.canvas.renderAll();
    },
    // 옷 선택 시 캔버스에 추가 (포즈별 SVG/위치 적용)
    async selectClothes(clothes) {
      if (this.clothesSvgGroup) {
        this.canvas.remove(this.clothesSvgGroup);
      }
      const svgUrl =
        typeof clothes.svgUrl === "object"
          ? clothes.svgUrl[this.currentPose] || clothes.svgUrl["인간"]
          : clothes.svgUrl;
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);

      const pos = clothes.position?.[this.currentPose] || {
        left: 100,
        top: 200,
      };

      svgGroup.set({
        left: pos.left,
        top: pos.top,
        originX: "left",
        originY: "center",
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      this.canvas.add(svgGroup);
      this.clothesSvgGroup = svgGroup;
      this.selectedClothes = clothes;
      this.canvas.renderAll();

      // 마지막으로 선택한 색상 옵션 적용
      const idx = this.selectedColorIndexes[clothes.name] ?? 0;
      const btn = clothes.colorButtons[idx];
      if (btn) {
        this.changeClothesColors(btn.targets, clothes.name, idx);
        this.saveAvatarToLocal();
      }
    },
    // 포즈 변경 시 인간/옷 SVG 갱신
    async changePose(pose) {
      this.currentPose = pose;
      if (this.humanSvgGroup) this.canvas.remove(this.humanSvgGroup);
      if (this.clothesSvgGroup) this.canvas.remove(this.clothesSvgGroup);
      await this.addHumanSvg();
      if (this.selectedClothes) {
        await this.selectClothes(this.selectedClothes);
        this.saveAvatarToLocal();
        this.saveAvatarToLocal();
      }
    },
    // 옷 SVG 색상 변경 (id/class 모두 지원, 재귀 순회)
    changeClothesColors(targets, clothesName, idx) {
      if (!this.clothesSvgGroup) return;
      // 색상 적용
      function changeRecursive(obj) {
        if (obj._objects) {
          obj._objects.forEach((child) => changeRecursive(child));
        } else {
          targets.forEach(({ type, value, color }) => {
            if (
              (type === "id" &&
                (obj.id === value || (obj.get && obj.get("id") === value))) ||
              (type === "class" &&
                (obj.className === value ||
                  (obj.get && obj.get("class") === value)))
            ) {
              obj.set("fill", color);
            }
          });
        }
      }
      changeRecursive(this.clothesSvgGroup);
      this.canvas.requestRenderAll();

      // 선택된 색상 인덱스 저장
      this.selectedColorIndexes = {
        ...this.selectedColorIndexes,
        [clothesName]: idx,
      };

      // 색상 변경 시에도 저장!
      if (!this.isRestoring) {
        this.saveAvatarToLocal();
      }
    },

    // 캔버스 이미지를 파일로 저장 (파일명 입력 가능, 기본값: 오늘기분외계인)
    saveCanvasAsImage() {
      let filename = prompt("저장할 파일 이름을 입력하세요.", "오늘기분외계인");
      if (!filename || filename.trim() === "") {
        filename = "오늘기분외계인";
      }
      if (!filename.endsWith(".jpg") && !filename.endsWith(".png")) {
        filename += ".jpg";
      }
      const dataUrl = this.canvas.toDataURL({
        format: "jpg",
        quality: 1.0,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 일반 SVG 색상 변경 (id 기준)
    changeSvgColorsByIds(idColorList) {
      if (!this.svgGroup) return;
      this.svgGroup.forEachObject((obj) => {
        idColorList.forEach(({ id, color }) => {
          if (obj.id === id || obj.get("id") === id) {
            obj.set("fill", color);
          }
        });
      });
      this.canvas.requestRenderAll();
    },
    // 일반 SVG 추가 (예시)
    async addSvgToCanvas() {
      const loadedSVG = await loadSVGFromURL(svgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
      let bounds = svgGroup.getBoundingRect();
      let svgWidth = bounds.width;
      let svgHeight = bounds.height;
      if (!svgWidth || !svgHeight) {
        svgWidth = loadedSVG.options.width || 200;
        svgHeight = loadedSVG.options.height || 200;
      }
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      const scale = Math.min(
        (canvasWidth * 0.5) / svgWidth,
        (canvasHeight * 0.5) / svgHeight,
        1
      );
      svgGroup.set({
        left: 100,
        top: 100,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });
      this.addCustomControls(svgGroup);
      this.canvas.add(svgGroup);
      this.canvas.setActiveObject(svgGroup);
      this.svgGroup = svgGroup;
      this.canvas.renderAll();
    },
    // 일반 SVG 전체 색상 변경 (예시)
    changeSvgColor(color) {
      if (!this.svgGroup) return;
      this.svgGroup.forEachObject((obj) => {
        if (obj.set) obj.set("fill", color);
      });
      this.canvas.requestRenderAll();
    },
    // 커스텀 컨트롤(삭제/회전/크기조절) 렌더링 함수들
    renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    renderRotateIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = rotateIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    renderResizeIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 24;
      const padding = 16;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = resizeIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    // 오브젝트 삭제 핸들러
    deleteObject(_eventData, transform) {
      const canvasInstance = transform.target.canvas;
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    },
    // 커스텀 컨트롤 추가
    addCustomControls(obj) {
      obj.setControlsVisibility({
        tl: false,
        tr: false,
        bl: false,
        br: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: true,
        deleteControl: true,
        rotateControl: true,
        resizeControl: true,
      });

      obj.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: this.deleteObject,
        render: this.renderDeleteIcon,
        cornerSize: 28,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.rotateControl = new Control({
        x: 0,
        y: -0.5,
        offsetY: -40, // 경계선(점선)에서 40px 더 위
        cursorStyle: "crosshair",
        render: this.renderRotateIcon,
        cornerSize: 28,
        actionHandler: controlsUtils.rotationWithSnapping,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: this.renderResizeIcon,
        cornerSize: 28,
        actionHandler: controlsUtils.scalingEqually,
        hitbox: { width: 60, height: 60 },
      });

      obj.set({
        cornerColor: "#00000000",
        cornerSize: 18,
        cornerStyle: "circle",
        borderColor: "#00bfff",
        borderDashArray: [6, 4],
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
      });

      obj.on("selected", () => {
        obj.set({ hasBorders: true, hasControls: true });
        obj.setControlsVisibility({
          tl: false,
          tr: false,
          bl: false,
          br: false,
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          mtr: true,
          deleteControl: true,
          rotateControl: true,
          resizeControl: true,
        });
        obj.canvas.requestRenderAll();
      });
      obj.on("deselected", () => {
        obj.set({ hasBorders: false, hasControls: false });
        obj.setControlsVisibility({
          tl: false,
          tr: false,
          bl: false,
          br: false,
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          mtr: true,
          deleteControl: true,
          rotateControl: true,
          resizeControl: true,
        });
        obj.canvas.requestRenderAll();
      });
    },
    // 도형(사각형) 추가
    addRectangle() {
      const rect = new Rect({
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        fill: "#ffe066",
        width: 200,
        height: 200,
        objectCaching: false,
        originX: "center",
        originY: "center",
        centeredRotation: true,
        padding: 16,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
      });
      this.addCustomControls(rect);
      this.canvas.add(rect);
      this.canvas.setActiveObject(rect);
      this.canvas.renderAll();
    },
    // 이미지 추가 (최대 3개)
    addImage(imageSrc) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        // 가로가 400px을 넘으면 비율 유지하며 축소
        if (width > 400) {
          const scale = 400 / width;
          width = 400;
          height = height * scale;
        }
        const fabricImage = new FabricImage(img, {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          width,
          height,
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
        });
        this.addCustomControls(fabricImage);
        this.canvas.add(fabricImage);
        this.canvas.setActiveObject(fabricImage);
        this.canvas.renderAll();
      };
    },
    // 파일 첨부로 이미지 추가
    onFileChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // "사용자가 추가한 이미지"만 카운트 (selectable !== false)
      let imageCount = this.canvas
        .getObjects()
        .filter(
          (obj) => obj.type === "image" && obj.selectable !== false
        ).length;

      if (imageCount >= 3) {
        alert("이미지는 최대 3개까지만 추가할 수 있습니다.");
        return;
      }

      // 항상 첫 번째 파일만 추가
      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          let scale = 1;
          // 가로가 400px을 넘으면 비율 유지하며 축소 (scale만 조정)
          if (width > 400) {
            scale = 400 / width;
          }
          const fabricImage = new FabricImage(img, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            // 원본 width/height 유지
            width: width,
            height: height,
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            evented: true,
            hasControls: false,
            hasBorders: false,
          });
          this.addCustomControls(fabricImage);
          this.canvas.add(fabricImage);
          this.canvas.setActiveObject(fabricImage);
          this.canvas.renderAll();
        };
      };
      reader.readAsDataURL(file);
    },
    // 기본 이미지 교체
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImageObject) return;
      const img = new window.Image();
      img.src = newImageSrc;
      img.onload = () => {
        this.defaultImageObject.setElement(img);
        this.defaultImageObject.set({
          width: 200,
          height: 200,
          scaleX: 1,
          scaleY: 1,
        });
        this.canvas.renderAll();
      };
    },
    // 파일 첨부 input 트리거
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    // 캔버스 초기화 및 기본 오브젝트 추가
    async initializeCanvas() {
      this.canvas = markRaw(
        new Canvas(this.$refs.canvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          selection: true,
          backgroundColor: "#ffffff",
        })
      );
      // 인간 SVG 추가
      await this.addHumanSvg();
      // 기본 이미지 추가
      const img = new window.Image();
      img.src = this.predefinedImages[0];
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          width: 200,
          height: 200,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });
        this.canvas.add(fabricImage);
        this.defaultImageObject = fabricImage;
        this.canvas.renderAll();
      };
      // 예시 SVG 추가
      this.addSvgToCanvas();
      // 오브젝트 클릭 시 선택/비선택 처리
      this.canvas.on("mouse:up", (opt) => {
        const evt = opt.e;
        const target = this.canvas.findTarget(evt, false);
        if (target && target.selectable !== false) {
          this.canvas.setActiveObject(target);
          // 오브젝트를 맨 위로 올리기
          const objs = this.canvas.getObjects();
          const idx = objs.indexOf(target);
          if (idx > -1 && idx !== objs.length - 1) {
            objs.splice(idx, 1);
            objs.push(target);
            this.canvas._objects = objs;
          }
          this.canvas.renderAll();
        } else {
          this.canvas.discardActiveObject();
          this.canvas.renderAll();
        }
      });
    },
  },
  // 컴포넌트 마운트 시 캔버스 초기화
  mounted: async function () {
    await this.initializeCanvas();
    this.restoreAvatarFromLocal();
  },
};
</script>

<style>
canvas {
  display: block;
}
</style>
