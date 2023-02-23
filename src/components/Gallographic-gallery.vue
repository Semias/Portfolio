<template>
  <div class="gallery-teaser-container">
    <div
      class="gallery-teaser-image gallery-teaser-1"
      tabindex="0"
      v-motion
      :initial="{
        opacity: 0,
      }"
      :visibleOnce="{
        opacity: 1,
        transition: {
          delay: 300,
          ease: linear,
        },
      }"
    >
      <img
        src="../assets/images/gallographic/teaser01.png"
        alt="gallery teaser picture 1"
      />
    </div>
    <div
      class="gallery-teaser-image gallery-teaser-2"
      tabindex="0"
      v-motion
      :initial="{
        opacity: 0,
      }"
      :visibleOnce="{
        opacity: 1,
        transition: {
          delay: 600,
          ease: linear,
        },
      }"
    >
      <img
        src="../assets/images/gallographic/teaser02.png"
        alt="gallery teaser picture 2"
      />
    </div>
    <div
      class="gallery-teaser-image gallery-teaser-3"
      tabindex="0"
      v-motion
      :initial="{
        opacity: 0,
      }"
      :visibleOnce="{
        opacity: 1,
        transition: {
          delay: 900,
          ease: linear,
        },
      }"
    >
      <img
        src="../assets/images/gallographic/teaser03.png"
        alt="gallery teaser picture 3"
      />
    </div>
    <div
      class="gallery-teaser-image gallery-teaser-4"
      tabindex="0"
      v-motion
      :initial="{
        opacity: 0,
      }"
      :visibleOnce="{
        opacity: 1,
        transition: {
          delay: 1200,
          ease: linear,
        },
      }"
    >
      <img
        src="../assets/images/gallographic/teaser04.png"
        alt="gallery teaser picture 4"
      />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import "./src/assets/include-media";

.gallery-teaser-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  padding: 0 1rem;

  @include media("<=md") {
    width: 80%;
  }

  @include media("<=sm") {
    flex-wrap: wrap;
    gap: 20px;
    width: 90%;
  }

  @include media("<=xs") {
    width: 100%;
  }

  .gallery-teaser-image {
    width: 176px;
    height: 450px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
    transition: 0.5s;
    -webkit-transition: 0.5s;
    -moz-transition: 0.5s;

    @include media("<=sm") {
      height: 200px;
      width: 200px;
    }

    &:hover,
    &:focus {
      filter: saturate(0);

      img {
        height: 110%;
      }
    }

    img {
      height: 100%;
      width: auto;
      transition: 0.5s;
      -webkit-transition: 0.5s;
      -moz-transition: 0.5s;
    }
  }
}
</style>
