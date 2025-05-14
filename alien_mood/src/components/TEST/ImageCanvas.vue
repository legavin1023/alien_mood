<template>
  <div>
    <!-- 색상 선택 버튼 -->
    <div style="display: flex; gap: 10px; margin-bottom: 10px">
      <button
        @click="addItem('red')"
        style="background-color: red; color: white; padding: 10px"
      >
        Red
      </button>
      <button
        @click="addItem('green')"
        style="background-color: green; color: white; padding: 10px"
      >
        Green
      </button>
      <button
        @click="addItem('blue')"
        style="background-color: blue; color: white; padding: 10px"
      >
        Blue
      </button>
    </div>

    <!-- 캔버스 -->
    <v-stage :config="stageSize">
      <v-layer>
        <v-rect
          v-for="(item, index) in items"
          :key="index"
          :config="item"
          @click="selectItem(index)"
          @touchstart="selectItem(index)"
          @transformend="handleTransformEnd(index, $event)"
          draggable
        />
        <!-- Transformer -->
        <v-transformer v-if="selectedItemIndex !== null" ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stageSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      items: [
        {
          x: window.innerWidth / 2 - 50, // 캔버스 중앙에 위치
          y: window.innerHeight / 2 - 50, // 캔버스 중앙에 위치
          width: 100,
          height: 100,
          fill: "blue", // 초기 색상
          rotation: 0,
          draggable: true,
          name: "item-0",
        },
      ], // 캔버스에 추가된 아이템 배열
      selectedItemIndex: 0, // 첫 번째 아이템을 선택 상태로 설정
    };
  },
  mounted() {
    // 페이지 로드 시 Transformer 초기화
    this.$nextTick(() => {
      this.updateTransformer();
    });
  },
  methods: {
    addItem(color) {
      // 새로운 아이템 추가
      this.items.push({
        x: this.stageSize.width / 2 - 50, // 캔버스 중앙에 위치
        y: this.stageSize.height / 2 - 50, // 캔버스 중앙에 위치
        width: 100,
        height: 100,
        fill: color, // 버튼에서 전달된 색상
        rotation: 0, // 초기 회전값
        draggable: true, // 드래그 가능
        name: `item-${this.items.length}`, // 고유 이름
      });
    },
    selectItem(index) {
      // 아이템 선택
      this.selectedItemIndex = index;
      this.updateTransformer();
    },
    updateTransformer() {
      const transformer = this.$refs.transformer?.getNode();
      if (!transformer) {
        console.warn("Transformer is not initialized.");
        return;
      }

      const stage = transformer.getStage();
      const selectedNode = stage.findOne(`.item-${this.selectedItemIndex}`);

      if (selectedNode) {
        transformer.nodes([selectedNode]);
        stage.batchDraw();
      } else {
        transformer.nodes([]);
        stage.batchDraw();
      }
    },
    handleTransformEnd(index, e) {
      // Transform 완료 시 상태 업데이트
      const item = this.items[index];
      if (!item) return;

      item.x = e.target.x();
      item.y = e.target.y();
      item.width = e.target.width();
      item.height = e.target.height();
      item.rotation = e.target.rotation();
    },
    deleteShape(index) {
      if (index !== null && this.items[index]) {
        this.items.splice(index, 1);
        this.selectedItemIndex = null;
        this.updateTransformer();
      }
    },
  },
};
</script>

<style>
/* 캔버스 스타일 */
</style>
