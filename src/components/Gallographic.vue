<template>
	<section class="section-row-gallery" id="gallographic">
		<div class="section-container-gallery">
			<div class="section-column-gallery">
				<h1 v-motion :initial="{ opacity: 0, y: 100 }" :visibleOnce="{ opacity: 1, y: 0, scale: 1 }" :variants="{ custom: { scale: 2 } }" :delay="300">
					{{ headline }}
				</h1>
				<GallographicGallery />
				<div class="gallery-links">
					<div class="gallery-links-text">
						<a href="https://gallographic.netlify.app/" title="Link zur Seite von Gallographic" target="blank">gallographic.netlify.app</a>
					</div>
					<div class="gallery-links-qrcode">
						<img src="../assets/images/gallographic/qr-gallographic-white.svg" alt="QR Code Gallographic" />
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	import GallographicGallery from "./Gallographic-gallery.vue";

	export default {
		components: {
			GallographicGallery,
		},
		props: {
			headline: String,
		},
	};
</script>

<style lang="scss" scoped>
	@import "./src/assets/include-media";

	$ciprime: #42b883;
	$cibg1: #303030;
	$cibg2: #202020;
	$cibg3: #2a2a2a;

	.section-row-gallery {
		background-color: var(--cibg3);
		padding: 8rem 0 6rem;
		transition: 0.2s;
		-webkit-transition: 0.2s;
		-moz-transition: 0.2s;
		.section-container-gallery {
			max-width: 1500px;
			margin: 0 auto;
			padding: 0 1rem;
			.section-column-gallery {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 90px;

				@include media("<=sm") {
					gap: 50px;
				}

				h1 {
					font-size: 3.8rem;
					color: $ciprime;

					@include media("<=sm") {
						font-size: 3.4rem;
					}

					@include media("<=xs") {
						font-size: 3rem;
					}
				}

				.gallery-links {
					color: var(--text);
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					gap: 3rem;
					width: fit-content;

					.gallery-links-text {
						a {
							text-decoration: underline;
							text-underline-offset: 8px;
							text-decoration-thickness: 2px;
							color: currentColor;
							// font-family: "Jetbrains Mono";
							font-size: 1.8rem;
							transition: 0.3s;
							-webkit-transition: 0.3s;
							-moz-transition: 0.3s;

							@include media("<=sm") {
								font-size: 1.5rem;
							}

							&:hover,
							&:focus {
								text-decoration-color: transparent;
							}
						}
					}

					.gallery-links-qrcode {
						width: 180px;
						height: 180px;

						img {
							height: 100%;
							width: 100%;
							object-fit: contain;
							object-position: center;
						}
					}
				}
			}
		}
	}
</style>
