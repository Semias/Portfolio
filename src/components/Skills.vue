<template>
  <section class="section-row-skills" id="coding">
    <div class="section-container-skills">
      <div class="section-column-skills">
        <h1
          v-motion
          :initial="{ opacity: 0, y: 100 }"
          :visibleOnce="{ opacity: 1, y: 0, scale: 1 }"
          :variants="{ custom: { scale: 2 } }"
          :delay="300"
        >
          {{ headline }}
        </h1>
        <div class="skills-container-items">
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 450,
              },
            }"
          >
            <img src="../assets/images/skills/html.svg" alt="HTML" />
          </div>
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 600,
              },
            }"
          >
            <img src="../assets/images/skills/css.svg" alt="css" />
          </div>
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 750,
              },
            }"
          >
            <img src="../assets/images/skills/bootstrap.svg" alt="Bootstrap" />
          </div>
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 900,
              },
            }"
          >
            <img src="../assets/images/skills/sass.svg" alt="sass" />
          </div>
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 1050,
              },
            }"
          >
            <img
              src="../assets/images/skills/javascript.svg"
              alt="Javascript"
            />
          </div>
          <div
            class="skill-item"
            tabindex="0"
            v-motion
            :initial="{
              opacity: 0,
              x: -20,
            }"
            :visibleOnce="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 1200,
              },
            }"
          >
            <img src="../assets/images/skills/vue.svg" alt="Vue.js" />
          </div>
          <!-- <div class="skill-item"><img src="../assets/images/skills/java.svg" alt="Java"></div> -->
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  components: {},
  props: {
    headline: String,
  },
  // methods: {
  //   doSomething() {

  //   }
  // }
};
</script>

<style lang="scss" scoped>
@import "./src/assets/include-media";

$ciprime: #42b883;
$cibg1: #303030;
$cibg2: #202020;
$cibg3: #2a2a2a;
.section-row-skills {
  background-color: var(--cibg2);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  padding: 8rem 0 14rem;

  @include media("<=xs") {
    padding: 6rem 0;
  }

  .section-container-skills {
    max-width: 1300px;
    padding: 0 1rem;
    margin: 0 auto;
    width: 90%;
    .section-column-skills {
      display: flex;
      flex-direction: column;
      gap: 7rem;

      @include media("<=xs") {
        gap: 3rem;
      }

      h1 {
        font-family: "Jetbrains Mono";
        font-size: 3.8rem;
        color: $ciprime;

        @include media("<=sm") {
          font-size: 3.4rem;
        }

        @include media("<=xs") {
          font-size: 3rem;
        }
      }
      .skills-container-items {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0 1rem;

        @include media("<=xl") {
          justify-content: center;
          gap: 3rem;
        }

        @include media("<=md") {
          justify-content: center;
          gap: 3rem;
          column-gap: 9rem;
        }

        @include media("<=sm") {
          justify-content: center;
          gap: 4rem;
        }

        @include media("<=xs") {
          justify-content: center;
          gap: 3rem;
        }

        .skill-item {
          width: 120px;
          height: 120px;
          display: flex;
          justify-content: center;
          filter: drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.3));

          @include media("<=xs") {
            width: 90px;
            height: 90px;
          }

          img {
            height: 100%;
            width: auto;
            max-width: 100%;
            transition: 0.3s;
            -webkit-transition: 0.3s;
            -moz-transition: 0.3s;

            &:hover {
              transform: scale(0.9);
            }
          }
        }
      }
    }
  }
}
</style>
