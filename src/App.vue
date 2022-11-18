<template>

  <section class="section-row-about">
    <div class="section-container-about">
      <div class="section-column-about">
        <div class="about-picture">
          <figure>
            <img src="./assets/images/about-me.png" alt="picture of stefan gall">
          </figure>
        </div>
        <div class="about-me-title">
          <h1>{{person}}</h1>
          <h2>{{job}}</h2>
        </div>
        <Sociallinks/>
      </div>
    </div>
  </section>

  <Coding headline="Coding"/>


  <Gallographic headline="Noch nicht genug?"/>


</template>

<script>
import { isContinueStatement } from '@babel/types';
import Sociallinks from './components/Social-links.vue'
import Gallographic from './components/Gallographic.vue'
import Coding from './components/Coding.vue'

export default {
  name: 'App',
  components: {
    Sociallinks,
    Gallographic,
    Coding
  },
  data() {
    return {
      person: "Stefan Gall",
      job: "Frontend Developer",
    }
  },
}
</script>

<style lang="scss">

$ciprime: #42B883;
$cibg1: #303030;
$cibg2: #202020;
$cibg3: #2a2a2a;



@font-face {
  font-family: "Jetbrains Mono";
  src: url('./assets/fonts/jetbrains/JetBrainsMono[wght].ttf');
}

@font-face {
  font-family: "Roboto";
  src: url('./assets/fonts/roboto/Roboto-Regular.ttf');
  font-weight: 400;
}

@font-face {
  font-family: "Roboto";
  src: url('./assets/fonts/roboto/Roboto-Medium.ttf');
  font-weight: 500;
}
@font-face {
  font-family: "Roboto";
  src: url('./assets/fonts/roboto/Roboto-Bold.ttf');
  font-weight: 700;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-weight: 400;
  font-size: 16px;
}

body::-webkit-scrollbar-track, html::-webkit-scrollbar-track {
    background-color: white;
}

body::-webkit-scrollbar-thumb, html::-webkit-scrollbar-thumb {
    background-color: $ciprime;
    border-radius: none;
}

body::-webkit-scrollbar, html::-webkit-scrollbar {
    width: 10px;
}

#app {
  font-family: Roboto, Jetbrains Mono, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background-color: $cibg1;
  font-weight: 400;

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
      transform: translateY(30px);
    }
    100% {
      transform: translateY(0);
    }
  }

  //section {
  //  padding: 3rem 0;
  //}
  
  .section-row-about {
    width: 100%;
    height: 900px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    
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
      right: 250px;
      animation: moveUpDown 7s infinite linear;
    }

    .section-container-about {
      max-width: 1500px;
      margin: 0 auto;

      .section-column-about {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .about-picture {
          width: 350px;
          height: 350px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          box-shadow: 0 0 26px rgba(0,0,0,0.4);

          figure {
            width: 100%;
            height: 120%;
            display: flex;
            justify-content: center;

            img {
              height: 100%;
              width: auto;
            }
          }
        }

        .about-me-title {
          display: flex;
          flex-direction: column;
          margin: 3rem 0;
          gap: 1rem;

          h1 {
            font-size: 3.8rem;
            font-family: "Roboto";
            color: $ciprime;
          }

          h2 {
            font-size: 1.9rem;
            font-family: "Jetbrains Mono";
          }

        }

      }
    }
  }
}
</style>
