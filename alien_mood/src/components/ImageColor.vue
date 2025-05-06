<template>
  <div>
    <!-- 색상 선택 버튼 -->
    <div style="display: flex; gap: 10px; margin-bottom: 10px">
      <button
        @click="changeBoxColor('red')"
        style="background-color: red; color: white; padding: 10px"
      >
        Red
      </button>
      <button
        @click="changeBoxColor('green')"
        style="background-color: green; color: white; padding: 10px"
      >
        Green
      </button>
      <button
        @click="changeBoxColor('blue')"
        style="background-color: blue; color: white; padding: 10px"
      >
        Blue
      </button>
    </div>

    <!-- 캔버스 -->
    <v-stage :config="stageSize">
      <v-layer>
        <!-- 단일 상자 -->
        <v-rect :config="boxConfig" draggable />
        <!-- 여러 아이템 -->
        <v-rect
          v-for="(item, index) in items"
          :key="index"
          :config="item"
          @click="selectItem(index)"
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
      items: [], // 캔버스에 추가된 아이템 배열
      selectedItemIndex: null, // 선택된 아이템의 인덱스
      boxConfig: {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: "red", // 초기 색상
        draggable: true,
      },
    };
  },
  methods: {
    addItem(color) {
      // 새로운 아이템 추가
      this.items.push({
        x: Math.random() * this.stageSize.width, // 랜덤 x 좌표
        y: Math.random() * this.stageSize.height, // 랜덤 y 좌표
        width: 100,
        height: 100,
        fill: color, // 버튼에서 전달된 색상
        rotation: 0, // 초기 회전값
        draggable: true, // 드래그 가능
        name: `item-${this.items.length}`, // 고유 이름
      });
    },
    changeBoxColor(color) {
      // 상자의 색상을 변경
      this.boxConfig.fill = color;
    },
    selectItem(index) {
      // 아이템 선택
      this.selectedItemIndex = index;
      this.updateTransformer();
    },
    updateTransformer() {
      const transformer = this.$refs.transformer.getNode();
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
  },
};
</script>

<style>
/* 캔버스 스타일 */
</style>
