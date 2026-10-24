import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Der Beitragstext aus content/blog, als HTML eingesetzt. Die Styles gelten global für
 * app-post-body, weil Angulars Kapselung eingesetztes HTML nicht erreicht.
 */
@Component({
  selector: 'app-post-body',
  template: '',
  host: { '[innerHTML]': 'trusted()' },
  encapsulation: ViewEncapsulation.None,
  styleUrl: './post-body.scss',
})
export class PostBody {
  /** HTML aus scripts/build-content.mjs */
  readonly html = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);

  // Angulars Sanitizer würde die IDs der Überschriften entfernen und damit das Inhaltsverzeichnis
  // brechen. Der Text stammt aus dem Repo, und das Content-Skript lässt kein rohes HTML und keine
  // unsicheren Links durch, deshalb gilt er als vertrauenswürdig.
  protected readonly trusted = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.html()));
}
