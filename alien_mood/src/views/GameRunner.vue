<template>
  <div ref="contentArea" class="mobile-wrapper h-[full]">
    <!-- 탭 버튼 -->
    <!-- <div style="display: flex; gap: 10px; margin-bottom: 20px">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :style="{
          padding: '10px 20px',
          backgroundColor: activeTab === index ? '#007BFF' : '#E0E0E0',
          color: activeTab === index ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }"
      >
        {{ tab.name }}
      </button>
    </div> -->

    <!-- 탭 내용 -->
    <!-- <div>
      <div v-if="activeTab === 0">
        <h2>Konva</h2>
        <TestKonva></TestKonva>
      </div>
      <div v-if="activeTab === 1">
        <h2>Fabric</h2>
        <TestFabric></TestFabric>
      </div>
      <div v-if="activeTab === 2">
        <h2>삭제 테스트</h2>
        <deleteTest></deleteTest>
      </div>
      <div v-if="activeTab === 3">
        <h2>점 테스트</h2>
        <rotationTest></rotationTest>
      </div>
      <div v-if="activeTab === 1">
        <TestFinal></TestFinal>
      </div>
      <div v-if="activeTab === 0"></div>
    </div> -->
    <CanvasUI ref="child"></CanvasUI>
    <!-- <MainCanvas ref="child"></MainCanvas> -->
  </div>
</template>

<script>
// import TestKonva from "@/components/TEST/TestKonva.vue";
// import TestFabric from "@/components/TEST/TestFabric.vue";
// import deleteTest from "@/components/TEST/deleteTest.vue";
// import rotationTest from "@/components/TEST/rotationTest.vue";
import TestFinal from "@/components/TEST/TestFinal.vue";
import MainCanvas from "@/components/MainCanvas.vue";
import CanvasUI from "@/components/CanvasUI.vue";
export default {
  components: {
    // TestKonva,
    // TestFabric,
    // deleteTest,
    // rotationTest,
    // TestFinal,
    // MainCanvas,
    CanvasUI,
  },
  data() {
    return {
      activeTab: 0, // 현재 활성화된 탭 (0부터 시작)
      tabs: [
        // { name: "Konva" },
        // { name: "Fabric" },
        // { name: "추가 삭제" },
        // { name: "삭제 회전 크기" },
        // { name: "메인" },
        // { name: "최종 테스트" },
      ],
      vhRaf: null,
      lastVh: 0,
    };
  },
  mounted() {
    // this.setResponsiveFont();
    // window.addEventListener("resize", this.setResponsiveFont);
    this.$nextTick(() => {
      this.correctFontSize();
    });

    this.setRealViewportHeight();
    window.addEventListener("resize", this.setRealViewportHeight);
    window.addEventListener("orientationchange", this.setRealViewportHeight);
    window.addEventListener("scroll", this.setRealViewportHeight, {
      passive: true,
    });
    this.startVhPolling();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.setResponsiveFont);

    window.removeEventListener("resize", this.setRealViewportHeight);
    window.removeEventListener("orientationchange", this.setRealViewportHeight);
    window.removeEventListener("scroll", this.setRealViewportHeight);
    cancelAnimationFrame(this.vhRaf);
  },
  methods: {
    correctFontSize() {
      // 자식 요소 선택
      const child = this.$refs.child;
      if (!child || !(child instanceof Element)) return;

      // 부모의 실제 font-size(px) 구하기
      const parent = child.parentElement;
      const parentFontSize = parseFloat(
        window.getComputedStyle(parent).fontSize
      );

      // body의 기본 font-size(px) 구하기
      const bodyFontSize = parseFloat(
        window.getComputedStyle(document.body).fontSize
      );

      // 보정 비율 계산
      const scale = bodyFontSize / parentFontSize;

      // 자식에 보정된 font-size 적용
      const childFontSize = parseFloat(window.getComputedStyle(child).fontSize);
      child.style.fontSize = `${childFontSize * scale}px`;
    },
    // setResponsiveFont() {
    //   // body의 현재 font-size(px) 가져오기
    //   const body = document.body;
    //   const style = window.getComputedStyle(body);
    //   const currentSize = parseFloat(style.fontSize); // px 단위

    //   // 1.6배 하고 소수점은 반내림
    //   const newSize = Math.floor(currentSize * 1.6);

    //   // body에 적용
    //   body.style.fontSize = `${newSize}px`;
    // },

    setRealViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const content = this.$refs.contentArea;
      if (content) {
        content.style.height = `calc(var(--vh, 1vh) * 100)`;
      }
      this.lastVh = vh;
    },
    startVhPolling() {
      const check = () => {
        const vh = window.innerHeight * 0.01;
        if (vh !== this.lastVh) {
          this.setRealViewportHeight();
        }
        this.vhRaf = requestAnimationFrame(check);
      };
      this.vhRaf = requestAnimationFrame(check);
    },
  },
};
</script>

<style></style>
