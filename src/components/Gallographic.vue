<template>
  
  <section class="section-row-gallery" id="gallographic">
    <div class="section-container-gallery">
      <div class="section-column-gallery">
        <h1>{{ headline }}</h1>
        <GallographicGallery/>
        <div class="gallery-links">
          <div class="gallery-links-text"><a href="https://semias.github.io" title="Link zur Seite von Gallographic" target="blank">semias.github.io</a></div>
          <div class="gallery-links-qrcode"><img src="../assets/images/gallographic/qrcode.svg" alt="QR Code Gallographic"></div>
        </div>
      </div>
    </div>
  </section>

</template>

<script>
import GallographicGallery from './Gallographic-gallery.vue'


export default {
  components: {
    GallographicGallery
  },
  props: {
    headline: String,
  },
}
</script>

<style lang="scss" scoped>

$ciprime: #42B883;
$cibg1: #303030;
$cibg2: #202020;
$cibg3: #2a2a2a;
  .section-row-gallery {
    background-color: $cibg2;
    padding: 5rem 0;
    .section-container-gallery {
        max-width: 1500px;
        margin: 0 auto;
      .section-column-gallery {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 90px;

        h1 {
          font-size: 3.8rem;
        }

        .gallery-links {
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 3rem;
          width: fit-content;

          .gallery-links-text {
            a {
              text-decoration: underline;
              text-underline-offset: 6px;
              color: currentColor;
              font-family: "Jetbrains Mono";
              font-size: 2rem;
              transition: 0.3s;
              -webkit-transition: 0.3s;
              -moz-transition: 0.3s;


              &:hover,
              &:focus {
                text-decoration-color: transparent;
              }
            }
          }
        }
      }
    }
  }
</style>