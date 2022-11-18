<template>
  
  <div class="gallery-teaser-container">
    <div class="gallery-teaser-image gallery-teaser-1">
      <img src="../assets/images/gallographic/teaser01.png" alt="gallery teaser picture 1">
    </div>
    <div class="gallery-teaser-image gallery-teaser-2">
      <img src="../assets/images/gallographic/teaser02.png" alt="gallery teaser picture 2">
    </div>
    <div class="gallery-teaser-image gallery-teaser-3">
      <img src="../assets/images/gallographic/teaser03.png" alt="gallery teaser picture 3">
    </div>
    <div class=" gallery-teaser-image gallery-teaser-4">
      <img src="../assets/images/gallographic/teaser04.png" alt="gallery teaser picture 4">
    </div>
  </div>

</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
  .gallery-teaser-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;

    .gallery-teaser-image {
      width: 176px;
      height: 450px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.25);
      transition: 0.5s;
      -webkit-transition: 0.5s;
      -moz-transition: 0.5s;

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