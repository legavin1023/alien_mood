<template>
  <div
    class="mobile-wrapper relative bg-white max-w-[430px] mx-auto min-h-screen select-none"
  >
    <canvas
      ref="canvas"
      style="border: 1px solid #ccc; width: 100%; height: 100%"
    ></canvas>
    <div v-if="!hideUi">
      <!-- 패널: 네비 위에서 바닥에 딱 붙어서 열림 -->
      <div
        class="edit-panel z-0 fixed pt-[28px] left-1/2 bottom-0 rounded-t-[28px] w-full max-w-[430px] -translate-x-1/2 bg-black-b700 flex flex-col transition-all duration-300"
        :style="{
          height: panelOpen ? '282px' : '1000px',
          transform: panelOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)', // 닫힐 때 아래로 내려감
          overflow: panelOpen ? 'visible' : 'hidden',
        }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="panel-handle absolute left-1/2 top-[12px] w-[30px] h-[4px] rounded-full cursor-pointer bg-black-b200 -translate-x-1/2 select-none"
          @click="togglePanel"
        ></div>
        <div
          class="panel-content w-full h-full px-[30px] pb-[12px] flex-1 min-h-0 overflow-y-auto"
          :style="{ overflowY: panelOpen ? 'auto' : 'hidden' }"
        >
          <!-- 탭별 내용 -->
          <div v-if="activePanelTab === 0" class="h-full px-[30px]">
            <div
              class="flex flex-wrap gap-[15px] h-full pb-[56px] custom-scrollbar-hide"
              style="box-sizing: border-box"
            >
              <div
                v-for="(img, idx) in backroundList"
                :key="'replace-img-' + idx"
                class="flex-shrink-0 bg-red-50"
                :style="{
                  width: 'calc((100% - 30px) / 3)', // (전체 - 2*15px gap) / 3
                }"
              >
                <button
                  @click="replaceDefaultImage(img.src)"
                  class="w-full h-full aspect-square overflow-hidden"
                  style="padding: 0"
                >
                  <img
                    :src="img.src"
                    :alt="'배경 ' + (idx + 1)"
                    class="w-full h-full object-cover"
                    draggable="false"
                  />
                </button>
              </div>
            </div>
          </div>
          <div v-else-if="activePanelTab === 1">
            <div class="avatar-panel">
              <!-- 탭 네비게이션 -->
              <div
                class="flex gap-[34px] h-[32px] leading-[18px] text-[18px] border-b-[1px] border-black-b200"
              >
                <button
                  v-for="(tab, idx) in avatarTabs"
                  :key="tab"
                  :class="[
                    'flex-1 py-2',
                    activeAvatarTab === idx
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-500',
                  ]"
                  @click="activeAvatarTab = idx"
                >
                  {{ tab }}
                </button>
              </div>
              <!-- 탭별 내용 -->
              <div class="avatar-tab-content">
                <div v-if="activeAvatarTab === 0">
                  <!-- 자세(포즈) 관련 내용 -->
                  <p>자세(포즈) 선택 영역</p>
                  <!-- 포즈 선택 버튼 -->
                  <div style="display: flex; gap: 8px">
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
                </div>
                <div v-else-if="activeAvatarTab === 1">
                  <!-- 얼굴형 관련 내용 -->
                  <p>얼굴형 선택 영역</p>
                </div>
                <div v-else-if="activeAvatarTab === 2">
                  <!-- 머리 관련 내용 -->
                  <p>머리 선택 영역</p>
                </div>
                <div v-else-if="activeAvatarTab === 3">
                  <!-- 눈 관련 내용 -->
                  <p>눈 선택 영역</p>
                </div>
                <div v-else-if="activeAvatarTab === 4">
                  <!-- 입 관련 내용 -->
                  <p>입 선택 영역</p>
                </div>
                <div v-else-if="activeAvatarTab === 5">
                  <!-- 옷/색상/포즈 등 -->
                  <!-- 옷 종류별 아이콘 버튼 -->
                  <div style="display: flex; gap: 8px">
                    <button
                      v-for="clothes in clothesList"
                      :key="clothes.name"
                      @click="selectClothes(clothes)"
                      style="background: none; border: none; cursor: pointer"
                    >
                      <img
                        :src="clothes.icon"
                        :alt="clothes.name"
                        width="48"
                        height="48"
                      />
                      <div>{{ clothes.name }}</div>
                    </button>
                  </div>
                  <!-- 옷 색상 옵션 버튼 (입힌 옷이 있을 때만) -->
                  <div v-if="selectedClothes" style="margin: 12px 0">
                    <button
                      v-for="(btn, idx) in selectedClothes.colorButtons"
                      :key="btn.label + idx"
                      @click="
                        changeClothesColors(
                          btn.targets,
                          selectedClothes.name,
                          idx
                        )
                      "
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
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activePanelTab === 2">
            <div
              class="imgBox w-full h-[32px] text-center border-b text-black-b70 border-black-b600"
            >
              <span>{{ imageCount }}/3</span>
            </div>
            <div class="flex gap-[15px] mt-2">
              <!-- 미리보기 썸네일 -->
              <div
                v-for="(img, idx) in uploadedImages"
                :key="img.fabricObj.id || img.url"
                class="w-[90px] h-[90px] bg-black-b600 rounded-[2px] flex items-center justify-center relative"
                style="position: relative"
              >
                <img
                  :src="img.url"
                  alt="첨부 이미지"
                  class="object-cover w-full h-full rounded-[2px]"
                />
                <button
                  @click="removePreviewImage(idx)"
                  style="
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    color: #fff;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                  "
                  title="삭제"
                >
                  ×
                </button>
              </div>
              <!-- 이미지가 3개 미만일 때만 업로드 버튼 노출 -->
              <label
                v-if="uploadedImages.length < 3"
                class="w-[90px] h-[90px] bg-black-b600 rounded-[2px] cursor-pointer p-0 flex items-center justify-center"
              >
                <img
                  src="@/assets/image/ui/add.svg"
                  alt="이미지 추가"
                  width="40"
                  height="40"
                />
                <input
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  style="display: none"
                />
              </label>
            </div>
          </div>
          <div v-else-if="activePanelTab === 3">
            <button @click="addTextbox">텍스트 추가</button>
          </div>
          <div v-else-if="activePanelTab === 4"></div>
          <div v-else-if="activePanelTab === 5">
            <!-- 이모티콘 추가 버튼 -->
            <button
              v-for="img in StickerList"
              :key="img.src"
              @click="addImage(img.src)"
              style="background: none; border: none; cursor: pointer"
            >
              <img :src="img.src" :alt="img.label" width="32" height="32" />
            </button>
          </div>
        </div>
      </div>
      <!-- 네비게이션 바: 항상 하단 고정, 패널과 넓이 동일 -->
      <div
        class="panel-nav z-100 text-[20px] fixed left-1/2 bottom-0 flex justify-around items-center h-[48px] bg-black-b900/90 w-full max-w-[430px] -translate-x-1/2"
      >
        <button
          v-for="(tab, idx) in [
            '배경',
            '아바타',
            '사진',
            '텍스트',
            '질문',
            '스티커',
          ]"
          :key="tab"
          :class="[
            'flex-1 h-full',
            activePanelTab === idx ? 'text-green-300 ' : 'text-black-b100',
          ]"
          @click="openPanel(idx)"
        >
          {{ tab }}
        </button>
      </div>
    </div>
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
  Group,
  IText,
} from "fabric";

import deleteIcon from "@/assets/image/ui/delete.svg";
import rotateIcon from "@/assets/image/ui/cached.svg";
import resizeIcon from "@/assets/image/ui/open_in_full.svg";
import human from "@/assets/image/인간.svg";
import humanArm from "@/assets/image/인간팔.svg";

// Vue CLI/webpack용 require.context 사용
const svgContext = require.context("@/assets/image", true, /\.(svg|png|jpg)$/);

function getImageUrl(filename) {
  try {
    return svgContext("./" + filename);
  } catch {
    return "";
  }
}

import backroundDataRaw from "@/assets/data/backround.json";
const backroundList = (backroundDataRaw.default || backroundDataRaw).map(
  (item) => ({
    ...item,
    src: getImageUrl(item.src),
  })
);
import stickerDataRaw from "@/assets/data/sticker.json";
const StickerList = (stickerDataRaw.default || stickerDataRaw).map((item) => ({
  ...item,
  src: getImageUrl(item.src),
}));

import clothesDataRaw from "@/assets/data/clothes.json";
const clothesData = clothesDataRaw.default || clothesDataRaw;
const clothesListRaw = clothesData.clothesList || [];
const clothesList = clothesListRaw.map((item) => ({
  ...item,
  icon: getImageUrl(item.icon),
  svgUrl: Object.fromEntries(
    Object.entries(item.svgUrl).map(([k, v]) => [k, getImageUrl(v)])
  ),
}));

export default {
  props: {
    hideUi: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Fabric.js 캔버스 인스턴스
      canvas: null,
      // 복원 중 여부
      isRestoring: false,
      // 배경 이미지 목록
      backroundList,
      // 교체 가능한 기본 이미지 오브젝트
      defaultImageObject: null,
      // 현재 포즈 상태
      currentPose: "인간",
      //스티커 목록
      StickerList,
      // 옷 목록 (포즈별 SVG, 위치, 색상 옵션 포함)
      clothesList,
      // 현재 선택된 옷 데이터
      selectedClothes: null,
      // { [clothes.name]: index }
      selectedColorIndexes: {},
      avatarTabs: ["자세", "얼굴형", "머리", "눈", "입", "장식"],
      activeAvatarTab: 0,
      imageCount: 0,
      // 캔버스에 추가된 이미지
      uploadedImages: [], // { url, fabricObj } 배열

      //아래 변수들은 터치패널을 위한 변수들
      // panelOpen: false,
      panelOpen: true,
      touchStartY: 0,
      touchMoveY: 0,
      activePanelTab: 2,
    };
  },
  components: {},
  methods: {
    openPanel(idx) {
      this.activePanelTab = idx;
      this.panelOpen = true;
    },
    togglePanel() {
      this.panelOpen = !this.panelOpen;
    },
    onTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    },
    onTouchMove(e) {
      this.touchMoveY = e.touches[0].clientY;
    },
    onTouchEnd() {
      const delta = this.touchStartY - this.touchMoveY;
      if (delta > 30) {
        // 위로 드래그: 열기
        this.panelOpen = true;
      } else if (delta < -30) {
        // 아래로 드래그: 닫기
        this.panelOpen = false;
      }
    },
    async addHumanControlLayer() {
      // 기존 컨트롤 레이어가 있으면 삭제
      if (this.humanControlLayer) {
        this.canvas.remove(this.humanControlLayer);
        this.humanControlLayer = null;
      }
      if (!this.humanSvgGroup) return;

      const bounds = this.humanSvgGroup.getBoundingRect();
      const controlLayer = new Rect({
        left: this.humanSvgGroup.left,
        top: this.humanSvgGroup.top,
        width: bounds.width,
        height: bounds.height,
        originX: this.humanSvgGroup.originX,
        originY: this.humanSvgGroup.originY,
        fill: "rgba(0,0,0,0)", // 완전 투명
        // fill: "rgba(0,0,255,0.2)", // 디버깅용: 파란 반투명
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        padding: 12,
      });
      this.addCharacterControls(controlLayer);
      this.canvas.add(controlLayer);
      this.humanControlLayer = controlLayer;

      // 컨트롤 레이어 이동 시 캐릭터/옷 동기화
      controlLayer.on("moving", () => {
        this.humanSvgGroup.set({
          left: controlLayer.left,
          top: controlLayer.top,
        });
        if (this.clothesSvgGroup) {
          const pos = this.selectedClothes?.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left: controlLayer.left + pos.left * controlLayer.scaleX,
            top: controlLayer.top + pos.top * controlLayer.scaleY,
          });
        }
        this.canvas.renderAll();
      });

      // 컨트롤 레이어 스케일 시 캐릭터/옷 동기화
      controlLayer.on("scaling", () => {
        this.humanSvgGroup.set({
          scaleX: controlLayer.scaleX,
          scaleY: controlLayer.scaleY,
          left: controlLayer.left,
          top: controlLayer.top,
        });
        if (this.clothesSvgGroup) {
          const pos = this.selectedClothes?.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            scaleX: controlLayer.scaleX,
            scaleY: controlLayer.scaleY,
            left: controlLayer.left + pos.left * controlLayer.scaleX,
            top: controlLayer.top + pos.top * controlLayer.scaleY,
          });
        }
        this.canvas.renderAll();
      });

      // ★ 컨트롤 레이어 회전 시 캐릭터/옷 동기화
      controlLayer.on("rotating", () => {
        this.humanSvgGroup.set({
          angle: controlLayer.angle,
        });
        if (this.clothesSvgGroup) {
          this.clothesSvgGroup.set({
            angle: controlLayer.angle,
          });
        }
        this.canvas.renderAll();
      });

      // // 캐릭터와 옷은 직접 선택 불가
      // this.humanSvgGroup.set({ selectable: false, evented: false });
      // if (this.clothesSvgGroup) {
      //   this.clothesSvgGroup.set({ selectable: false, evented: false });
      // }

      // 항상 z-index 정렬
      this.canvas.renderAll();
    },

    // 포즈에 따라 인간 SVG를 캔버스에 추가
    async addHumanSvg() {
      // 기존 인간 SVG가 있으면 삭제
      let prevLeft = 100;
      let prevTop = this.canvas.height / 2;
      let prevScaleX = 1;
      let prevScaleY = 1;
      let prevAngle = 0;
      if (this.humanSvgGroup) {
        // 기존 중심, 스케일, 각도 기억
        prevLeft = this.humanSvgGroup.left;
        prevTop = this.humanSvgGroup.top;
        prevScaleX = this.humanSvgGroup.scaleX;
        prevScaleY = this.humanSvgGroup.scaleY;
        prevAngle = this.humanSvgGroup.angle;
        this.canvas.remove(this.humanSvgGroup);
        this.humanSvgGroup = null;
      }
      const humanSvgUrl = this.currentPose === "인간팔" ? humanArm : human;
      const loadedSVG = await loadSVGFromURL(humanSvgUrl);
      let svgGroup = util.groupSVGElements(loadedSVG.objects);
      svgGroup.set({
        left: prevLeft,
        top: prevTop,
        originX: "center",
        originY: "center",
        scaleX: prevScaleX,
        scaleY: prevScaleY,
        angle: prevAngle,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
      });

      this.addCharacterControls(svgGroup);
      this.canvas.add(svgGroup);
      this.humanSvgGroup = svgGroup;
      this.addHumanMoveListener();
      await this.addHumanControlLayer();
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

      // 인간 SVG 기준 + 옷 position 값 더해서 위치/스케일 맞추기
      const human = this.humanSvgGroup;
      const pos = clothes.position?.[this.currentPose] || { left: 0, top: 0 };

      // 옷 그룹을 인간과 완전히 동일하게 맞춤
      svgGroup.set({
        left: human.left,
        top: human.top,
        originX: human.originX,
        originY: human.originY,
        scaleX: human.scaleX,
        scaleY: human.scaleY,
        angle: human.angle,
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

      // 옷 내부 오브젝트에만 offset 적용
      svgGroup.forEachObject((obj) => {
        obj.left += pos.left;
        obj.top += pos.top;
      });
      svgGroup.setCoords();
      this.canvas.add(svgGroup);
      this.clothesSvgGroup = svgGroup;
      this.selectedClothes = clothes;
      this.canvas.renderAll();

      // 마지막으로 선택한 색상 옵션 적용
      const idx = this.selectedColorIndexes[clothes.name] ?? 0;
      const btn = clothes.colorButtons[idx];
      if (btn) {
        this.changeClothesColors(btn.targets, clothes.name, idx);
      }
      await this.addHumanControlLayer();
    },
    // 인간을 움직일 때 옷도 같이 움직이게 이벤트 연결
    addHumanMoveListener() {
      if (!this.humanSvgGroup) return;
      this.humanSvgGroup.set({ selectable: true, evented: true });

      // 이동 시 옷 따라오기
      this.humanSvgGroup.on("moving", () => {
        if (this.clothesSvgGroup && this.selectedClothes) {
          const pos = this.selectedClothes.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left:
              this.humanSvgGroup.left + pos.left * this.humanSvgGroup.scaleX,
            top: this.humanSvgGroup.top + pos.top * this.humanSvgGroup.scaleY,
          });
          this.canvas.renderAll();
        }
      });

      // 크기 조절(스케일) 시 옷도 같이 스케일
      this.humanSvgGroup.on("scaling", () => {
        if (this.clothesSvgGroup && this.selectedClothes) {
          // scaleX, scaleY 동기화
          this.clothesSvgGroup.set({
            scaleX: this.humanSvgGroup.scaleX,
            scaleY: this.humanSvgGroup.scaleY,
          });
          // 위치도 스케일에 맞게 보정
          const pos = this.selectedClothes.position?.[this.currentPose] || {
            left: 0,
            top: 0,
          };
          this.clothesSvgGroup.set({
            left:
              this.humanSvgGroup.left + pos.left * this.humanSvgGroup.scaleX,
            top: this.humanSvgGroup.top + pos.top * this.humanSvgGroup.scaleY,
          });
          this.canvas.renderAll();
        }
      });
    },
    // 포즈 변경 시 인간/옷 SVG 갱신
    async changePose(pose) {
      this.currentPose = pose;
      if (this.humanSvgGroup) this.canvas.remove(this.humanSvgGroup);
      if (this.clothesSvgGroup) this.canvas.remove(this.clothesSvgGroup);
      await this.addHumanSvg();
      this.addCharacterControls(this.humanSvgGroup);
      if (this.selectedClothes) {
        await this.selectClothes(this.selectedClothes);
      }
      await this.addHumanControlLayer();
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
    },

    // 캔버스 이미지를 파일로 저장 (파일명 입력 가능, 기본값: 오늘기분외계인)
    saveCanvasAsImage() {
      let filename = prompt("저장할 파일 이름을 입력하세요.", "오늘기분외계인");
      if (filename === null) return; // 취소 시 저장하지 않음
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
    // 커스텀 컨트롤(삭제/회전/크기조절) 렌더링 함수들
    renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 12;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = deleteIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 1;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    },
    renderRotateIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 28;
      const padding = 12;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = rotateIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 1;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    },
    renderResizeIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = 24;
      const padding = 12;
      const hitSize = size + padding * 2;
      const img = new Image();
      img.src = resizeIcon;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.globalAlpha = 1;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.globalAlpha = 0.01;
      ctx.beginPath();
      ctx.arc(0, 0, hitSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.restore();
    },
    // 오브젝트 삭제 핸들러
    deleteObject(_eventData, transform) {
      const canvasInstance = transform.target.canvas;

      // 1. 텍스트에 배경이 연결되어 있으면 같이 삭제
      if (
        transform.target.type === "i-text" &&
        transform.target._bgRect &&
        canvasInstance.contains(transform.target._bgRect)
      ) {
        canvasInstance.remove(transform.target._bgRect);
      }

      // 2. 캐릭터(인간) 컨트롤 레이어 삭제 시, 인간/옷 그룹도 같이 삭제
      if (
        transform.target === this.humanControlLayer ||
        transform.target === this.humanSvgGroup
      ) {
        // 인간 SVG 그룹 삭제
        if (this.humanSvgGroup && canvasInstance.contains(this.humanSvgGroup)) {
          canvasInstance.remove(this.humanSvgGroup);
          this.humanSvgGroup = null;
        }
        // 옷 SVG 그룹 삭제
        if (
          this.clothesSvgGroup &&
          canvasInstance.contains(this.clothesSvgGroup)
        ) {
          canvasInstance.remove(this.clothesSvgGroup);
          this.clothesSvgGroup = null;
          this.selectedClothes = null;
        }
        // 컨트롤 레이어 삭제
        if (
          this.humanControlLayer &&
          canvasInstance.contains(this.humanControlLayer)
        ) {
          canvasInstance.remove(this.humanControlLayer);
          this.humanControlLayer = null;
        }
        canvasInstance.requestRenderAll();
        return;
      }

      // 3. 일반 오브젝트 삭제
      canvasInstance.remove(transform.target);
      canvasInstance.requestRenderAll();
    },
    addCharacterControls(obj) {
      obj.setControlsVisibility({
        tl: false,
        tr: false,
        bl: false,
        br: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: true, // 회전 핸들
        deleteControl: true, // 삭제 버튼 활성화
        rotateControl: true, // 커스텀 회전
        resizeControl: true, // 커스텀 리사이즈
      });
      obj.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: "pointer",
        mouseUpHandler: this.deleteObject,
        render: this.renderDeleteIcon,
        cornerSize: 24,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.rotateControl = new Control({
        x: 0,
        y: -0.5,
        offsetY: -40,
        cursorStyle: "crosshair",
        render: this.renderRotateIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.rotationWithSnapping,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: this.renderResizeIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.scalingEqually,
        hitbox: { width: 60, height: 60 },
      });

      obj.set({
        cornerColor: "#00000000",
        cornerSize: 24,
        cornerStyle: "circle",
        borderColor: "#ffffff",
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
        cornerSize: 24,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.rotateControl = new Control({
        x: 0,
        y: -0.5,
        offsetY: -40,
        cursorStyle: "crosshair",
        render: this.renderRotateIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.rotationWithSnapping,
        hitbox: { width: 60, height: 60 },
      });
      obj.controls.resizeControl = new Control({
        x: 0.5,
        y: 0.5,
        cursorStyle: "se-resize",
        render: this.renderResizeIcon,
        cornerSize: 24,
        actionHandler: controlsUtils.scalingEqually,
        hitbox: { width: 60, height: 60 },
      });

      obj.set({
        cornerColor: "#00000000",
        cornerSize: 24,
        cornerStyle: "circle",
        borderColor: "#ffffff",
        borderDashArray: [6, 4],
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
        // editable: true, // ← 이 줄은 필요 없음!
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
        padding: 12,
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
    // 텍스트 추가
    addTextbox() {
      const text = "1.방문자 카운팅 ";
      const padding = 12;
      const textbox = new IText(text, {
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        originX: "center",
        originY: "center",
        fontSize: 32,
        fill: "#222",
        fontFamily: "sans-serif",
        editable: true,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        backgroundColor: "transparent",
        textAlign: "center",
      });

      // 배경 사각형 생성
      const bgRect = new Rect({
        left: textbox.left,
        top: textbox.top,
        originX: "center",
        originY: "center",
        width: textbox.width + padding * 2,
        height: textbox.height + padding * 2,
        rx: 18,
        ry: 18,
        fill: "#fffbe6",
        selectable: false,
        evented: false,
        hasBorders: false,
        hasControls: false,
      });

      // 텍스트에 배경 참조 저장
      textbox._bgRect = bgRect;

      this.canvas.add(bgRect);
      this.canvas.add(textbox);

      // 항상 텍스트 바로 아래에 배경이 오도록 순서 조정 함수
      const ensureBgBelowText = () => {
        const objs = this.canvas.getObjects();
        const bgIdx = objs.indexOf(bgRect);
        const textIdx = objs.indexOf(textbox);
        if (bgIdx > -1 && textIdx > -1 && bgIdx !== textIdx - 1) {
          objs.splice(bgIdx, 1);
          objs.splice(textIdx, 0, bgRect);
          this.canvas._objects = objs;
        }
      };

      // 텍스트 이동/수정/스케일/회전 시 배경도 같이 이동 및 크기 조정
      const updateBgRect = () => {
        textbox.setCoords();
        bgRect.set({
          width: textbox.width * textbox.scaleX + padding * 2,
          height: textbox.height * textbox.scaleY + padding * 2,
          left: textbox.left,
          top: textbox.top,
          scaleX: 1,
          scaleY: 1,
          angle: textbox.angle,
        });
        ensureBgBelowText();
        this.canvas.requestRenderAll();
      };

      // 이벤트 연결
      textbox.on("changed", updateBgRect);
      textbox.on("scaling", updateBgRect);
      textbox.on("moving", updateBgRect);
      textbox.on("rotating", updateBgRect);

      // 최초 위치/순서 보장
      ensureBgBelowText();

      this.addCustomControls(textbox);
      this.canvas.setActiveObject(textbox);
      this.canvas.renderAll();
    },

    // 이미지 추가 (최대 3개)
    addImage(imageSrc) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const padding = 12; // 원하는 만큼

        // fabric.Image 생성
        const fabricImage = new FabricImage(img, {
          left: 0,
          top: 0,
          originX: "center",
          originY: "center",
          width,
          height,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });

        // 투명한 Rect 생성 (이미지보다 padding*2만큼 크게)
        const bgRect = new Rect({
          left: 0,
          top: 0,
          originX: "center",
          originY: "center",
          width: width + padding * 2,
          height: height + padding * 2,
          fill: "rgba(0,0,0,0)",
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });

        // Group으로 묶기
        const group = new Group([bgRect, fabricImage], {
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
        });

        this.addCustomControls(group);
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        this.canvas.renderAll();

        // 미리보기 배열에 추가 (group을 fabricObj로 저장)
        this.uploadedImages.push({
          url: imageSrc,
          fabricObj: markRaw(group),
        });
        this.updateImageCount();
      };
    },
    // 파일 첨부로 이미지 추가 삭제 카운트
    onFileChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      let imageCount = this.uploadedImages.length;
      if (imageCount >= 3) {
        alert("이미지는 최대 3개까지만 추가할 수 있습니다.");
        return;
      }

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
          if (width > 400) {
            scale = 400 / width;
          }
          const padding = 12;

          // fabric.Image 생성
          const fabricImage = new FabricImage(img, {
            left: 0,
            top: 0,
            originX: "center",
            originY: "center",
            width: width,
            height: height,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
          });

          // 투명한 Rect 생성
          const bgRect = new Rect({
            left: 0,
            top: 0,
            originX: "center",
            originY: "center",
            width: width * scale + padding * 2,
            height: height * scale + padding * 2,
            fill: "rgba(0,0,0,0)",
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
          });

          // Group으로 묶기
          const group = new Group([bgRect, fabricImage], {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            selectable: true,
            evented: true,
            hasControls: false,
            hasBorders: false,
          });

          this.addCustomControls(group);
          this.canvas.add(group);
          this.canvas.setActiveObject(group);
          this.canvas.renderAll();

          // 미리보기 배열에 group을 저장
          this.uploadedImages.push({
            url: e.target.result,
            fabricObj: markRaw(group),
          });
          this.updateImageCount();
        };
      };
      reader.readAsDataURL(file);

      event.target.value = "";
    },
    //미리보기 상의 이미지 삭제
    removePreviewImage(idx) {
      const img = this.uploadedImages[idx];
      if (img && img.fabricObj && this.canvas.contains(img.fabricObj)) {
        this.canvas.remove(img.fabricObj);
      }
    },

    // 이미지 삭제 시에도 호출
    removeImageObject(obj) {
      this.canvas.remove(obj);
      this.canvas.renderAll();
      this.updateImageCount();
    },

    // 캔버스의 사용자 이미지 개수 갱신
    updateImageCount() {
      this.imageCount = this.canvas
        .getObjects()
        .filter(
          (obj) => obj.type === "image" && obj.selectable !== false
        ).length;
    },
    // 기본 이미지 교체
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImageObject) return;
      const img = new window.Image();
      img.src = newImageSrc;
      img.onload = () => {
        // 캔버스와 이미지의 비율 계산
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;
        const imgW = img.width;
        const imgH = img.height;
        const scale = Math.max(canvasW / imgW, canvasH / imgH);

        this.defaultImageObject.setElement(img);
        this.defaultImageObject.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasW - imgW * scale) / 2,
          top: (canvasH - imgH * scale) / 2,
          originX: "left",
          originY: "top",
          width: imgW,
          height: imgH,
        });
        this.canvas.renderAll();
      };
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
      this.canvas.on("after:render", () => {
        const ctx = this.canvas.getContext();
        const objs = this.canvas.getObjects();
        objs.forEach((obj, idx) => {
          // 오브젝트의 좌상단 좌표 계산
          const p = obj.getPointByOrigin
            ? obj.getPointByOrigin("left", "top")
            : { x: obj.left, y: obj.top };
          ctx.save();
          ctx.font = "bold 18px sans-serif";
          ctx.fillStyle = "red";
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.strokeText(idx + "", p.x + 8, p.y + 24);
          ctx.fillText(idx + "", p.x + 8, p.y + 24);
          ctx.restore();
        });
      });
      // 배경이미지
      const img = new window.Image();
      img.src = this.backroundList[0].src;
      img.onload = async () => {
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;
        const imgW = img.width;
        const imgH = img.height;
        const scale = Math.max(canvasW / imgW, canvasH / imgH);

        const fabricImage = new FabricImage(img, {
          left: (canvasW - imgW * scale) / 2,
          top: (canvasH - imgH * scale) / 2,
          originX: "left",
          originY: "top",
          scaleX: scale,
          scaleY: scale,
          width: imgW,
          height: imgH,
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

        // 배경 이미지가 추가된 후 인간 추가
        await this.addHumanSvg();
        await this.addHumanControlLayer();
      };

      // mouse:up 이벤트는 한 번만 등록!
      this.canvas.on("mouse:down", (opt) => {
        const target = this.canvas.getActiveObject();
        const objs = this.canvas.getObjects();

        // 1. 기본 이미지는 항상 맨 아래
        if (this.defaultImageObject) {
          const idx = objs.indexOf(this.defaultImageObject);
          if (idx > -1) {
            objs.splice(idx, 1);
            objs.unshift(this.defaultImageObject);
          }
        }

        // 캐릭터(인간 SVG 그룹)만 클릭 시 셋을 동시에 맨 위로!
        if (target === this.humanSvgGroup) {
          [
            this.humanSvgGroup,
            this.humanControlLayer,
            this.clothesSvgGroup,
          ].forEach((obj) => {
            const idx = objs.indexOf(obj);
            if (idx > -1) objs.splice(idx, 1);
          });
          if (this.humanSvgGroup) objs.push(this.humanSvgGroup);
          if (this.humanControlLayer) objs.push(this.humanControlLayer);
          if (this.clothesSvgGroup) objs.push(this.clothesSvgGroup);

          this.canvas._objects = objs;
          this.canvas.renderAll();
          return;
        }

        // 텍스트(IText) 클릭 시 배경과 텍스트를 같이 맨 위로!
        if (target && target.type === "i-text" && target._bgRect) {
          // 둘 다 배열에서 제거
          [target._bgRect, target].forEach((obj) => {
            const idx = objs.indexOf(obj);
            if (idx > -1) objs.splice(idx, 1);
          });
          // 반드시 배경 → 텍스트 순서로 push
          objs.push(target._bgRect);
          objs.push(target);

          this.canvas._objects = objs;
          this.canvas.renderAll();
          return;
        }

        // 2. 캐릭터 3종 중 하나라도 클릭하면 셋을 동시에 맨 위로!
        const isHumanPart = [
          this.humanControlLayer,
          this.humanSvgGroup,
          this.clothesSvgGroup,
        ].includes(target);

        if (isHumanPart) {
          [
            this.humanSvgGroup,
            this.humanControlLayer,
            this.clothesSvgGroup,
          ].forEach((obj) => {
            const idx = objs.indexOf(obj);
            if (idx > -1) objs.splice(idx, 1);
          });
          if (this.humanSvgGroup) objs.push(this.humanSvgGroup);
          if (this.humanControlLayer) objs.push(this.humanControlLayer);
          if (this.clothesSvgGroup) objs.push(this.clothesSvgGroup);
        } else if (
          target &&
          ![
            this.humanControlLayer,
            this.humanSvgGroup,
            this.clothesSvgGroup,
            this.defaultImageObject,
          ].includes(target)
        ) {
          const idx = objs.indexOf(target);
          if (idx > -1) {
            objs.splice(idx, 1);
            objs.push(target);
          }
        }

        this.canvas._objects = objs;
        this.canvas.renderAll();
      });
    },
  },
  // 컴포넌트 마운트 시 캔버스 초기화
  mounted: async function () {
    await this.initializeCanvas();
    if (this.canvas) {
      this.canvas.on("object:removed", (e) => {
        const idx = this.uploadedImages.findIndex(
          (img) => img.fabricObj === e.target
        );
        if (idx !== -1) {
          this.uploadedImages.splice(idx, 1);
          this.uploadedImages = this.uploadedImages.slice();
        }
        this.updateImageCount();
      });
    }
  },
};
</script>

<style scoped>
.custom-scrollbar-hide {
  scrollbar-width: none; /* Firefox */
}
.custom-scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
.edit-panel {
  transition-property: height, transform;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  will-change: transform;
}
.edit-panel .panel-content {
  min-height: 0;
}
.edit-panel.open {
  height: 282px; /* 열린 상태 */
}
.panel-handle {
  margin: 10px auto 12px auto;
}
.panel-content {
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
}
.panel-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
</style>
