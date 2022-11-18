<template>
  
  <section class="section-row-coding" id="coding">
    <div class="section-container-coding">
      <div class="section-column-coding">
        <h1>{{ headline }}</h1>
        <div class="skillbar-container">
          <Skillbar classname="html" label="HTML" icon="icon-linkedin" datawidth="86" style="background-color: red; width: 86%"/>
        </div>
      </div>
    </div>
  </section>

</template>

<script>
import Skillbar from './Skillbar.vue'


export default {
  components: {
    Skillbar
  },
  // data: {
    // skillbars: [
      // { title: "HTML", progress:90, color:"orange"},
      // { title: "CSS", progress:90, color:"orange"},
      // { title: "SCSS", progress:90, color:"orange"},

      // { title: "Javascript", progress:90, color:"orange"},
      // { title: "Vue", progress:90, color:"orange"},
      // { title: "Typescript", progress:90, color:"orange"},

    // ]
  // },
  props: {
    headline: String,
  },
  created() {
  window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll(event) {
    },
    // setWidth(element, [datawidth], classname) {
    //   const child = element.querySelector(classname)
    //   child.style.width = datawidth ? `${child.dataset.width}%` : `0%`;
    // }
  },

}
</script>

<style lang="scss" scoped>

$ciprime: #42B883;
$cibg1: #303030;
$cibg2: #202020;
$cibg3: #2a2a2a;
  .section-row-coding {
    background-color: $cibg3;
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    padding: 5rem 0;

    .section-container-coding {
      max-width: 800px;
      margin: 0 auto;
      .section-column-coding {
        h1 {
          font-family: "Jetbrains Mono";
          font-size: 3.8rem;
          color: $ciprime;
        }

        .skillbar-container {
          width: 100%;
        }
      }
    }
  }

</style>