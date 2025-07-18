<template>
  <div
    class="mobile-wrapper relative bg-white max-w-[430px] mx-auto min-h-screen select-none"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <canvas ref="canvas" style="border: 1px solid #ccc"></canvas>

    <!-- 텍스트 편집 시 색상 선택 UI -->
    <div
      v-if="editingTextbox"
      class="fixed rounded-[20px] z-50 overflow-hidden"
      :style="{
        left: editingTextbox.colorPanelLeft + 'px',
        top: editingTextbox.colorPanelTop + 'px',
        transform: 'translate(-50%, 0)',
        background: 'transparent',
      }"
    >
      <div class="flex gap-[16px] p-[8px] scrollbar-hide">
        <button
          v-for="(color, idx) in textBackgroundColors"
          :key="color"
          @click="changeTextBackgroundColor(color, idx)"
          class="w-[20px] h-[20px] rounded-full transition-all duration-200 relative flex-shrink-0"
          :style="{
            backgroundColor: selectedColorIndex === idx ? '#ffffff' : color,
          }"
          :title="`배경색 ${idx + 1}`"
        >
          <!-- 선택된 색상에 내부 원 표시 -->
          <div
            v-if="selectedColorIndex === idx"
            class="absolute inset-[3px] rounded-full border-2"
            :style="{
              backgroundColor: color,
              borderColor: '#202020',
            }"
          ></div>
        </button>
      </div>
    </div>

    <div v-if="!hideUi">
      <!-- 오버레이: 패널이 열려 있을 때만 표시 -->
      <div
        v-if="panelOpen"
        class="fixed left-0 right-0 top-0 bottom-[282px] z-10"
        style="background: transparent"
        @click.stop="panelOpen = false"
      ></div>
      <!-- 패널: 네비 위에서 바닥에 딱 붙어서 열림 -->
      <div
        class="edit-panel z-0 fixed left-1/2 bottom-0 rounded-t-[28px] w-full max-w-[430px] -translate-x-1/2 bg-black-b700 flex flex-col transition-all duration-300"
        :style="{
          height: panelOpen ? '282px' : '0px',
          transform: panelOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
          overflow: panelOpen ? 'visible' : 'hidden',
          pointerEvents: panelOpen ? 'auto' : 'none',
        }"
        @click.stop
      >
        <div
          class="panel-header relative w-[full] h-[28px] flex items-center justify-center"
        >
          <div
            class="panel-handle w-[30px] h-[4px] rounded-full cursor-pointer bg-black-b200"
            @click="togglePanel"
          ></div>
        </div>
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
              class="imgBox w-full h-[32px] text-center flex items-center justify-center border-b text-black-b70 border-black-b600"
            >
              <span>{{ imageCount }}/3</span>
            </div>
            <div class="flex mt-[14px]" style="gap: 15px">
              <div
                v-for="(img, idx) in uploadedImages"
                :key="img.fabricObj.id || img.url"
                class="bg-black-b600 rounded-[2px] flex items-center justify-center relative"
                :style="{
                  width: 'calc((100% - 30px) / 3)',
                  aspectRatio: '1 / 1', // 정사각형
                  position: 'relative',
                }"
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
                class="bg-black-b600 rounded-[2px] cursor-pointer p-0 flex items-center justify-center"
                :style="{
                  width: 'calc((100% - 30px) / 3)',
                  aspectRatio: '1 / 1', // 정사각형
                  position: 'relative',
                }"
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
            <!-- 텍스트 목록 -->
            <div
              class="flex flex-col gap-[14px] mb-[14px]"
              v-if="textboxes.length > 0"
            >
              <div
                v-for="(textItem, idx) in textboxes"
                :key="textItem.fabricObj.id || idx"
                class="rounded-[8px] p-[12px] flex items-center justify-between relative"
                :style="{
                  backgroundColor:
                    textItem.backgroundColor || 'rgba(0, 0, 0, 0.8)',
                }"
              >
                <input
                  :value="textItem.text"
                  @input="updateTextContent(idx, $event.target.value)"
                  @click="selectTextOnCanvas(textItem.fabricObj)"
                  class="bg-transparent flex-1 outline-none"
                  :style="{
                    color: getTextColor(
                      textItem.backgroundColor || 'rgba(0, 0, 0, 0.8)'
                    ),
                    fontFamily: 'Pretendard, sans-serif',
                  }"
                  placeholder="텍스트를 입력하세요"
                />
                <button
                  @click="removeTextbox(idx)"
                  class="ml-[8px] w-[24px] h-[24px] bg-red-500 rounded-full flex items-center justify-center text-white text-[14px]"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- 텍스트 추가 버튼 -->
            <button
              @click="addTextbox"
              class="w-[300px] h-[42px] bg-black-b600 rounded-[10px] cursor-pointer p-0 flex items-center justify-center"
              style="margin: 0 auto"
            >
              <span
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  color: #fff;
                  font-size: 18px;
                  font-weight: bold;
                  gap: 8px;
                "
              >
                <img
                  src="@/assets/image/ui/add.svg"
                  alt="텍스트 추가"
                  width="40"
                  height="40"
                />
              </span>
            </button>
          </div>
          <div v-else-if="activePanelTab === 4"></div>
          <div v-else-if="activePanelTab === 5">
            <!-- 이모티콘 추가 버튼 -->
            <div
              class="grid"
              style="grid-template-columns: repeat(3, 1fr); gap: 15px"
            >
              <div
                v-for="img in StickerList"
                :key="img.src"
                class="flex items-center justify-center bg-black-b800 rounded-[2px]"
                :style="{
                  aspectRatio: '1 / 1',
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                }"
              >
                <button
                  @click="addSticker(img.src)"
                  style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <img
                    :src="img.src"
                    :alt="img.label"
                    style="
                      width: 80%;
                      height: 80%;
                      object-fit: contain;
                      display: block;
                    "
                  />
                </button>
              </div>
            </div>
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
      avatarTabs: ["얼굴형", "자세", "머리", "눈", "입", "장식"],
      activeAvatarTab: 0,
      imageCount: 0,
      // 캔버스에 추가된 이미지
      uploadedImages: [], // { url, fabricObj } 배열
      // 캔버스에 추가된 텍스트
      textboxes: [], // { text, fabricObj } 배열
      // 텍스트 배경색 옵션
      textBackgroundColors: [
        "rgba(0, 0, 0, 0.8)",
        "#ffffff",
        "#0C0C0D",
        "#00AA39",
        "#DE9A1C",
        "#E62929",
        "#E65529",
        "#00ACCA",
        "#0047CA",
        "#001946",
        "#5E01FF",
        "#A675FA",
        "#DF1AE3",
        "#EF1F8B",
        "#EF1F3B",
      ],
      // 현재 편집 중인 텍스트
      editingTextbox: null,
      // 현재 선택된 텍스트 배경색 인덱스
      selectedColorIndex: 0,

      //아래 변수들은 터치패널을 위한 변수들
      // panelOpen: false,
      panelOpen: true,
      touchStartY: 0,
      touchMoveY: 0,
      activePanelTab: 3,
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
      this.touchMoveY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    },
    onTouchMove(e) {
      this.touchMoveY = e.touches[0].clientY;
    },
    onTouchEnd() {
      const delta = this.touchStartY - this.touchMoveY;
      const duration = Date.now() - this.touchStartTime;

      // 패널이 열려 있을 때만 아래로 스와이프 닫기 허용
      if (
        this.panelOpen &&
        delta < -30 &&
        Math.abs(delta) > 30 &&
        duration < 500
      ) {
        this.panelOpen = false;
      }
      // 패널이 닫혀 있을 때만 "충분히 긴" 위로 스와이프만 허용 (예: 80px 이상)
      else if (!this.panelOpen && delta > 80 && duration < 500) {
        this.panelOpen = true;
      }
      // 클릭(짧은 터치)에는 아무 동작도 하지 않음
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
        multiplier: 4,
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
      const size = 36;
      const padding = 12;
      const hitSize = size + padding * 2;
      const img = new window.Image();
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
      const size = 36;
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
      const size = 36;
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

      // 1. 텍스트 삭제 시 패널에서도 삭제
      if (transform.target.type === "i-text") {
        const idx = this.textboxes.findIndex(
          (item) => item.fabricObj === transform.target
        );
        if (idx !== -1) {
          this.textboxes.splice(idx, 1);
          this.textboxes = [...this.textboxes]; // 반응성을 위한 새 배열 생성
        }

        // 텍스트에 배경이 연결되어 있으면 같이 삭제
        if (
          transform.target._bgRect &&
          canvasInstance.contains(transform.target._bgRect)
        ) {
          canvasInstance.remove(transform.target._bgRect);
        }
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
      const dpr = window.devicePixelRatio || 1;
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
      const dpr = window.devicePixelRatio || 1;

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
      const text = "여기에 입력해주세요.";
      const padding = 12;
      const defaultBackgroundColor = this.textBackgroundColors[0];
      const textColor = this.getTextColor(defaultBackgroundColor);

      const textbox = new IText(text, {
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        originX: "center",
        originY: "center",
        fontSize: 32,
        fill: textColor, // 배경색에 맞는 텍스트 색상 적용
        fontFamily: "Pretendard, sans-serif",
        editable: true,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        backgroundColor: "transparent",
        textAlign: "center",
      });

      // 배경 사각형 생성 (첫 번째 색상으로 설정)
      const bgRect = new Rect({
        left: textbox.left,
        top: textbox.top,
        originX: "center",
        originY: "center",
        width: textbox.width + padding * 2,
        height: textbox.height + padding * 2,
        rx: 18,
        ry: 18,
        fill: defaultBackgroundColor, // 첫 번째 색상으로 설정
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

      // 텍스트 변경 이벤트에서 패널 동기화
      const syncTextToPanel = () => {
        const idx = this.textboxes.findIndex(
          (item) => item.fabricObj === textbox
        );
        if (idx !== -1) {
          this.textboxes[idx].text = textbox.text;
          this.textboxes = [...this.textboxes]; // 반응성을 위한 새 배열 생성
        }
        updateBgRect();
      };

      // 이벤트 연결
      textbox.on("changed", syncTextToPanel);
      textbox.on("scaling", updateBgRect);
      textbox.on("moving", updateBgRect);
      textbox.on("rotating", updateBgRect);

      // 편집 모드 진입/종료 이벤트
      textbox.on("editing:entered", () => {
        this.showColorPanel(textbox);
      });
      textbox.on("editing:exited", () => {
        this.hideColorPanel();
      });

      // 최초 위치/순서 보장
      ensureBgBelowText();

      this.addCustomControls(textbox);
      this.canvas.setActiveObject(textbox);
      this.canvas.renderAll();

      // textboxes 배열에 추가
      this.textboxes.push({
        text: text,
        fabricObj: markRaw(textbox),
        backgroundColor: defaultBackgroundColor, // 배경색 정보 추가
      });

      // 텍스트 추가 후 자동으로 편집 모드로 진입
      this.$nextTick(() => {
        textbox.enterEditing();
        textbox.selectAll();
        this.canvas.renderAll();
      });
    },

    // 패널에서 텍스트 내용 업데이트
    updateTextContent(idx, newText) {
      if (idx >= 0 && idx < this.textboxes.length) {
        const textItem = this.textboxes[idx];
        textItem.text = newText;
        textItem.fabricObj.set({ text: newText });

        // 배경 사각형 크기도 업데이트
        if (textItem.fabricObj._bgRect) {
          const padding = 12;
          textItem.fabricObj._bgRect.set({
            width:
              textItem.fabricObj.width * textItem.fabricObj.scaleX +
              padding * 2,
            height:
              textItem.fabricObj.height * textItem.fabricObj.scaleY +
              padding * 2,
          });
        }

        this.canvas.requestRenderAll();
        this.textboxes = [...this.textboxes]; // 반응성을 위한 새 배열 생성
      }
    },

    // 패널에서 텍스트 삭제
    removeTextbox(idx) {
      if (idx >= 0 && idx < this.textboxes.length) {
        const textItem = this.textboxes[idx];

        // 캔버스에서 텍스트와 배경 삭제
        if (
          textItem.fabricObj._bgRect &&
          this.canvas.contains(textItem.fabricObj._bgRect)
        ) {
          this.canvas.remove(textItem.fabricObj._bgRect);
        }
        if (this.canvas.contains(textItem.fabricObj)) {
          this.canvas.remove(textItem.fabricObj);
        }

        // 배열에서 삭제
        this.textboxes.splice(idx, 1);
        this.textboxes = [...this.textboxes]; // 반응성을 위한 새 배열 생성

        this.canvas.requestRenderAll();
      }
    },

    // 텍스트 편집 시 색상 패널 표시
    showColorPanel(textbox) {
      const bounds = textbox.getBoundingRect();
      const canvasElement = this.$refs.canvas;
      const canvasRect = canvasElement.getBoundingClientRect();

      // 현재 텍스트의 배경색에 맞는 색상 인덱스 찾기
      if (textbox._bgRect) {
        const currentColor = textbox._bgRect.fill;
        const colorIndex = this.textBackgroundColors.findIndex(
          (color) => color === currentColor
        );
        this.selectedColorIndex = colorIndex !== -1 ? colorIndex : 0;

        // textboxes 배열의 해당 항목 배경색도 동기화
        const textIdx = this.textboxes.findIndex(
          (item) => item.fabricObj === textbox
        );
        if (textIdx !== -1 && !this.textboxes[textIdx].backgroundColor) {
          this.textboxes[textIdx].backgroundColor = currentColor;
          this.textboxes = [...this.textboxes];
        }
      } else {
        this.selectedColorIndex = 0;
      }

      this.editingTextbox = {
        fabricObj: textbox,
        colorPanelLeft: canvasRect.left + bounds.left + bounds.width / 2,
        colorPanelTop: canvasRect.top + bounds.top + bounds.height + 10,
      };
    },

    // 색상 패널 숨김
    hideColorPanel() {
      this.editingTextbox = null;
      this.selectedColorIndex = 0; // 선택된 색상 인덱스 초기화
    },

    // 텍스트 배경색 변경
    changeTextBackgroundColor(color, idx) {
      if (!this.editingTextbox) return;

      const textbox = this.editingTextbox.fabricObj;
      if (textbox._bgRect) {
        textbox._bgRect.set({ fill: color });
        this.selectedColorIndex = idx; // 선택된 색상 인덱스 업데이트

        // 배경색에 따라 텍스트 색상 변경
        const textColor = this.getTextColor(color);
        textbox.set({ fill: textColor });

        this.canvas.requestRenderAll();

        // 패널의 해당 텍스트 항목도 업데이트 (시각적 피드백을 위해)
        const textIdx = this.textboxes.findIndex(
          (item) => item.fabricObj === textbox
        );
        if (textIdx !== -1) {
          // 배경색 정보도 업데이트
          this.textboxes[textIdx].backgroundColor = color;
          // Vue의 반응성을 위해 배열을 새로 생성
          this.textboxes = [...this.textboxes];
        }
      }
    },

    // 배경색에 따른 텍스트 색상 결정
    getTextColor(backgroundColor) {
      // 흰색 배경일 때는 검정 텍스트
      if (
        backgroundColor === "#ffffff" ||
        backgroundColor.includes("255, 255, 255")
      ) {
        return "#000000";
      }
      // 그 외에는 흰색 텍스트
      return "#ffffff";
    },

    // 패널에서 텍스트 클릭 시 캔버스에서 선택 및 편집 모드 진입
    selectTextOnCanvas(fabricObj) {
      this.canvas.setActiveObject(fabricObj);
      this.canvas.renderAll();

      // 편집 모드로 진입
      this.$nextTick(() => {
        fabricObj.enterEditing();
        fabricObj.selectAll();
        this.canvas.renderAll();
      });
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
      // 그룹 오브젝트만 카운트 (uploadedImages와 동기화)
      this.imageCount = this.uploadedImages.length;
    },
    replaceDefaultImage(newImageSrc) {
      if (!this.defaultImageObject) return;
      const img = new window.Image();
      img.src = newImageSrc;
      img.onload = () => {
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;
        const imgW = img.width;
        const imgH = img.height;
        // 중앙 정렬 + cover 방식 (꽉 채우기, 잘림 발생)
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
    async initializeCanvas() {
      // 기준 픽셀 크기(모든 폰에서 무난하게 보이는 값)
      const canvasWidth = 414;
      const canvasHeight = 736;

      this.canvas = markRaw(
        new Canvas(this.$refs.canvas, {
          width: canvasWidth,
          height: canvasHeight,
          selection: false,
          backgroundColor: "#ffffff",
        })
      );

      // CSS 크기도 고정(px)
      this.$refs.canvas.style.width = canvasWidth + "px";
      this.$refs.canvas.style.height = canvasHeight + "px";

      // 배경이미지 중앙 정렬
      const img = new window.Image();
      img.src = this.backroundList[0].src;
      img.onload = async () => {
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;
        const imgW = img.width;
        const imgH = img.height;
        // 중앙 정렬 + cover 방식 (꽉 채우기, 잘림 발생)
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
    },
    addSticker(stickerSrc) {
      const img = new window.Image();
      img.src = stickerSrc;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const padding = 12;

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

        // 스티커는 uploadedImages에 추가하지 않음!
      };
    },

    // 기존 텍스트들의 배경색 정보 동기화
    syncTextboxBackgroundColors() {
      let updated = false;
      this.textboxes.forEach((textItem, idx) => {
        if (!textItem.backgroundColor && textItem.fabricObj._bgRect) {
          this.textboxes[idx].backgroundColor = textItem.fabricObj._bgRect.fill;
          updated = true;
        }
      });
      if (updated) {
        this.textboxes = [...this.textboxes];
      }
    },
  },
  // 컴포넌트 마운트 시 캔버스 초기화
  mounted: async function () {
    this.$nextTick(async () => {
      await this.initializeCanvas();
      if (this.canvas) {
        this.canvas.on("object:removed", (e) => {
          // 이미지 삭제 처리
          const imgIdx = this.uploadedImages.findIndex(
            (img) => img.fabricObj === e.target
          );
          if (imgIdx !== -1) {
            this.uploadedImages.splice(imgIdx, 1);
            this.uploadedImages = this.uploadedImages.slice();
          }

          // 텍스트 삭제 처리
          const textIdx = this.textboxes.findIndex(
            (item) => item.fabricObj === e.target
          );
          if (textIdx !== -1) {
            this.textboxes.splice(textIdx, 1);
            this.textboxes = [...this.textboxes]; // 반응성을 위한 새 배열 생성
          }

          this.updateImageCount();
        });

        // 텍스트 편집 이벤트 글로벌 처리
        this.canvas.on("text:editing:entered", (e) => {
          if (e.target.type === "i-text") {
            this.showColorPanel(e.target);
          }
        });

        this.canvas.on("text:editing:exited", () => {
          this.hideColorPanel();
        });

        // 캔버스 클릭 시 색상 패널 숨김
        this.canvas.on("mouse:down", (e) => {
          if (!e.target || e.target.type !== "i-text") {
            this.hideColorPanel();
          }
        });
      }

      // 기존 텍스트들의 배경색 정보 동기화
      this.syncTextboxBackgroundColors();

      // 아래로 스와이프 새로고침 방지
      const wrapper = this.$el.querySelector(".mobile-wrapper");
      if (wrapper) {
        wrapper.addEventListener(
          "touchmove",
          (e) => {
            if (this.panelOpen) e.preventDefault();
          },
          { passive: false }
        );
      }
    });
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
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
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
