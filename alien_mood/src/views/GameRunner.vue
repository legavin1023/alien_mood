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
    <CanvasUI></CanvasUI>
    <MainCanvas></MainCanvas>
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
    MainCanvas,
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
    this.setRealViewportHeight();
    window.addEventListener("resize", this.setRealViewportHeight);
    window.addEventListener("orientationchange", this.setRealViewportHeight);
    window.addEventListener("scroll", this.setRealViewportHeight, {
      passive: true,
    });
    this.startVhPolling();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.setRealViewportHeight);
    window.removeEventListener("orientationchange", this.setRealViewportHeight);
    window.removeEventListener("scroll", this.setRealViewportHeight);
    cancelAnimationFrame(this.vhRaf);
  },
  methods: {
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
