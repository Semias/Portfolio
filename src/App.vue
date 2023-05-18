<template>
  <section class="section-row-about">
    <div class="section-container-about">
      <div class="section-column-about">
        <button
          alt="switch color scheme"
          title="switch color scheme"
          type="button"
          @click="
            switchTheme();
            switcherClass();
          "
          class="button-theme-switcher"
          v-bind:class="{ dark: switcherIsDark }"
        >
          <i class="icon-sun"></i>
          <i class="icon-brightness-contrast"></i>
        </button>
        <div class="about-picture" v-motion-fade>
          <figure>
            <img src="./assets/images/about-me.webp" alt="picture of stefan gall" />
          </figure>
        </div>
        <div class="about-me-title">
          <h1 v-motion-fade>{{ person }}</h1>
          <h2 v-motion-fade>{{ job }}</h2>
        </div>
        <Sociallinks />
      </div>
    </div>
  </section>
  <Skills headline="Tech Stack" />
  <Gallographic headline="Gallery Project" />

  <footer>
    made with
    <span
      ><a href="https://vuejs.org/" target="blank" title="Öffnet externen Link zur Seite https://vuejs.org/"><img src="./assets/images/skills/vue.svg" alt="vue.js logo" /></a
    ></span>
  </footer>
</template>

<script>
  import Sociallinks from "./components/Social-links.vue";
  import Gallographic from "./components/Gallographic.vue";
  import Skills from "./components/Skills.vue";
  // import { directive as motion } from '@vueuse/motion'

  export default {
    name: "App",
    components: {
      Sociallinks,
      Gallographic,
      Skills,
    },
    data() {
      return {
        person: "Stefan Gall",
        job: "Frontend Developer",
        isDarkMode: true, //Set to True = Dark Mode, False = Light Mode
        switcherIsDark: false,
      };
    },
    mounted() {
      this.checkAndSetSystemTheme();
    },
    methods: {
      checkAndSetSystemTheme() {
        let darkMode = window.matchMedia("(prefers-color-scheme: dark)");
        if (localStorage.getItem("theme") === "dark-theme") {
          this.isDarkMode = true;
          app.setAttribute("color-scheme", "dark");
        } else if (localStorage.getItem("theme") === "light-theme") {
          this.switcherIsDark = !this.switcherIsDark;
          this.isDarkMode = false;
          app.setAttribute("color-scheme", "light");
        } else if (!localStorage.getItem("theme") && darkMode.matches) {
          this.isDarkMode = true;
          app.setAttribute("color-scheme", "dark");
        } else if (!localStorage.getItem("theme") && !darkMode.matches) {
          this.switcherIsDark = !this.switcherIsDark;
          this.isDarkMode = false;
          app.setAttribute("color-scheme", "light");
        }
      },
      switchTheme() {
        if (this.isDarkMode) {
          app.setAttribute("color-scheme", "light");
          localStorage.setItem("theme", "light-theme");
          this.isDarkMode = false;
        } else {
          app.setAttribute("color-scheme", "dark");
          localStorage.setItem("theme", "dark-theme");
          this.isDarkMode = true;
        }
      },

      switcherClass() {
        this.switcherIsDark = !this.switcherIsDark;
      },
    },
  };
</script>

<style lang="scss">
  @import "../src/assets/include-media";

  :root {
    --ciprime: #42b883;

    --text-dark: #000;
    --cibg1-dark: #303030;
    --cibg2-dark: #2a2a2a;
    --cibg3-dark: #252525;

    --text-light: #ffffff;
    --cibg1-light: #f3f3f3;
    --cibg2-light: #e6e6e6;
    --cibg3-light: #cccccc;
  }

  $ciprime: #42b883;
  $cibg1: #303030;
  $cibg2: #202020;
  $cibg3: #2a2a2a;

  @font-face {
    font-family: "Jetbrains Mono";
    src: url("./assets/fonts/jetbrains/JetBrainsMono[wght].ttf");
    font-display: swap;
  }

  @font-face {
    font-family: "Roboto";
    src: url("./assets/fonts/roboto/Roboto-Regular.ttf");
    font-weight: 400;
    font-display: swap;
  }

  @font-face {
    font-family: "Roboto";
    src: url("./assets/fonts/roboto/Roboto-Medium.ttf");
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: "Roboto";
    src: url("./assets/fonts/roboto/Roboto-Bold.ttf");
    font-weight: 700;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-weight: 400;
    font-size: 16px;
  }

  body::-webkit-scrollbar-track,
  html::-webkit-scrollbar-track {
    background-color: white;
  }

  body::-webkit-scrollbar-thumb,
  html::-webkit-scrollbar-thumb {
    background-color: $ciprime;
    border-radius: none;
  }

  body::-webkit-scrollbar,
  html::-webkit-scrollbar {
    width: 10px;
  }

  #app {
    font-family: Roboto, Jetbrains Mono, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: white;
    background-color: var(--cibg1);
    font-weight: 400;
    overflow: hidden;
    transition: 0.2s;
    -webkit-transition: 0.2s;
    -moz-transition: 0.2s;

    @keyframes rotate {
      from {
        transform: rotate(0);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes moveUpDown {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(40px);
      }
      100% {
        transform: translateY(0);
      }
    }

    &[color-scheme="dark"] {
      --text: var(--text-light);
      --cibg1: var(--cibg1-dark);
      --cibg2: var(--cibg2-dark);
      --cibg3: var(--cibg3-dark);
    }

    &[color-scheme="light"] {
      --text: var(--text-dark);
      --cibg1: var(--cibg1-light);
      --cibg2: var(--cibg2-light);
      --cibg3: var(--cibg3-light);

      .gallery-links-qrcode {
        filter: invert(1);
      }
    }

    .section-row-about {
      width: 100%;
      height: 880px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);

      @include media("<=xs") {
        height: 670px;
      }

      &::before {
        content: "";
        background: url(./assets/images/left-ci.svg) center center no-repeat;
        background-size: cover;
        width: 580px;
        height: 500px;
        position: absolute;
        top: 220px;
        left: -350px;
        animation: rotate 60s infinite linear;
      }

      &::after {
        content: "";
        background: url(./assets/images/right-ci.svg) center center no-repeat;
        background-size: cover;
        width: 580px;
        height: 500px;
        position: absolute;
        top: -230px;
        right: 100px;
        animation: moveUpDown 6s infinite linear;

        @include media("<=xl") {
          right: -200px;
        }
      }

      .section-container-about {
        max-width: 1500px;
        padding: 0 1rem;
        margin: 0 auto;
        z-index: 1;

        .section-column-about {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;

          .button-theme-switcher {
            all: unset;
            margin-bottom: 3rem;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            background-color: var(--cibg1);
            filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3)) brightness(1.2);
            border-radius: 50%;
            color: black;
            cursor: pointer;
            transition: 0.3s;
            -moz-transition: 0.3s;
            -webkit-transition: 0.3s;

            @include media("<=xs") {
              margin-bottom: 1.5rem;
            }

            &:hover,
            &:focus {
              i {
                transform: rotate(90deg);
              }
            }

            &:focus {
              outline: 5px solid black;
            }

            &.dark {
              background-color: white;

              .icon-sun {
                display: none;
              }
              .icon-brightness-contrast {
                display: flex;
              }
            }

            .icon-brightness-contrast {
              display: none;
            }

            i {
              font-size: 1.5rem;
              color: var(--text);
              transition: 0.3s;
              -moz-transition: 0.3s;
              -webkit-transition: 0.3s;
            }
          }

          .about-picture {
            width: 350px;
            height: 350px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            box-shadow: 0 0 26px rgba(0, 0, 0, 0.4);

            @include media("<=xs") {
              width: 300px;
              height: 300px;
            }

            figure {
              width: 100%;
              height: 120%;
              display: flex;
              justify-content: center;

              img {
                height: 100%;
                width: 100%;
                object-fit: contain;
                object-position: center;
              }
            }
          }

          .about-me-title {
            display: flex;
            flex-direction: column;
            margin: 3rem 0;
            gap: 1rem;

            @include media("<=xs") {
              margin: 1.5rem 0;
            }

            h1 {
              font-size: 3.8rem;
              font-family: "Roboto";
              color: var(--ciprime);

              @include media("<=sm") {
                font-size: 3.4rem;
              }

              @include media("<=xs") {
                font-size: 3rem;
              }
            }

            h2 {
              font-size: 1.9rem;
              font-family: "Jetbrains Mono";
              color: var(--text);

              @include media("<=sm") {
                font-size: 1.7rem;
              }

              @include media("<=xs") {
                font-size: 1.5rem;
              }
            }
          }
        }
      }
    }

    footer {
      font-size: 1rem;
      font-family: "Jetbrains Mono";
      display: flex;
      justify-content: center;
      gap: 5px;
      padding: 0.5rem;
      gap: 0.8rem;
      color: var(--text);

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;

        a {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
          }
        }
      }
    }
  }
</style>
