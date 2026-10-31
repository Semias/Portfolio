import { TestBed } from '@angular/core/testing';
import { PostBody } from './post-body';

describe('PostBody', () => {
  it('keeps the markup of the content script, including heading ids for the contents', async () => {
    // Auszug aus der Ausgabe von scripts/lib/content.mjs
    const html =
      '<p>Lead with <em>emphasis</em> and <code>code</code>.</p>\n' +
      '<h2 id="part"><span class="heading-number" aria-hidden="true">01</span>Part</h2>\n' +
      '<pre tabindex="0"><code class="hljs language-typescript"><span class="hljs-keyword">type</span> A = <span class="hljs-string">"x"</span>;</code></pre>\n' +
      '<blockquote>\n<p>Quote</p>\n</blockquote>\n<ul>\n<li>one</li>\n</ul>';
    const fixture = TestBed.createComponent(PostBody);
    fixture.componentRef.setInput('html', html);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.innerHTML).toBe(html);
    expect(element.querySelector('#part')).not.toBeNull();
  });
});
