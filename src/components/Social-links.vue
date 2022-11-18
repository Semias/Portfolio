<template>
  <div class="social-links">

    <button type="button" class="github">
      <a href="https://github.com/Semias" target="blank">
        <i class="icon-github"></i>
      </a>
    </button>

    <button type="button" class="linkedin">
      <a href="https://www.linkedin.com/in/stefan-g-2329481b8?jobid=1234&lipi=urn%3Ali%3Apage%3Ad_jobs_easyapply_pdfgenresume%3Bb1yZB%2BNVQ1m7kwXBYstFYQ%3D%3D&licu=urn%3Ali%3Acontrol%3Ad_jobs_easyapply_pdfgenresume-v02_profile" target="blank">
        <i class="icon-linkedin"></i>
      </a>
    </button>

  </div>

</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
  .social-links {
    display: flex;
    gap: 3rem;
    justify-content: center;

    button {
      display: flex;
      background-color: transparent;
      border: unset;

      a {
        text-decoration: none;
        color: rgba(255,255,255,0.7);
        transition: 0.3s;
        -webkit-transition: 0.3s;
        -moz-transition: 0.3s;

        &:hover,
        &:focus {
          color: white;
        }

        i {
          font-size: 3.8rem;
        }
      }
    }
  }

</style>