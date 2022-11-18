<template>
  
  <div class="skillbar-box" :class="[classname]">
    <div class="skillbar-icon"><i :class="[icon]"></i></div>
    <div class="skillbar">
      <div class="skillbar-label">{{ label }}</div>
      <div class="skillbar-bg" :data-width="[datawidth]" :style="[style, datawidth]">
    </div>
  </div>

  </div>

</template>

<script>
const bottomDiff = 200

console.log(bottomDiff)

const skillbars = document.querySelector(".skillbar");
console.log(skillbars)



export default {
  props: {
    classname: String,
    label: String,
    icon: String,
    datawidth: Int16Array,
    style: String,
  },
  
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      addClass(scrollbars, show);
    },
    addClass(element, classname) {
      element.classList.add(classname);
    },
    setWidth(element, [datawidth], classname) {
      const child = element.querySelector(classname)
      child.style.width = datawidth ? `${child.dataset.width}%` : `0%`;
    }
  },
}


</script>

<style lang="scss" scoped>

.skillbar-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  .skillbar-icon {
    i {
      font-size: 3rem;
    }
  }
  .skillbar {
    width: 100%;
    height: 3rem;
    border: 0.1rem solid white;
    cursor: default;
    position: relative;
    border-radius: 10px;

    &.show {
      .skillbar-label {
        color: black;
      }

    }


    &:hover {
      .skillbar-label {
        color: black;
        transform: translate(0, -0.5rem);
      }

      .skillbar-bg {
        transform: translate(0, -0.5rem);
        box-shadow: 0 1rem 3.5rem black;
      }
    }

    .skillbar-label {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 1rem;
      font-size: 1.5rem;
      z-index: 2;
      transition: 0.25s all;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .skillbar-bg {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      transition: 0.25s all ease-in-out;
      height: 100%;
      border-radius: 10px;
      background-color: white;
    }
  }

}


</style>