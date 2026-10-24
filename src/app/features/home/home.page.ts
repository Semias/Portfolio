import { Component } from '@angular/core';
import { NetworkBackground } from '../../shared/three/network-background';
import { About } from './about/about';
import { BlogTeasers } from './blog-teasers/blog-teasers';
import { Contact } from './contact/contact';
import { Cv } from './cv/cv';
import { Hero } from './hero/hero';
import { InfoStrip } from './info-strip/info-strip';
import { Projects } from './projects/projects';

@Component({
  selector: 'app-home-page',
  imports: [NetworkBackground, Hero, InfoStrip, About, Cv, Projects, BlogTeasers, Contact],
  template: `
    <app-network-background />
    <app-hero />
    <app-info-strip />
    <app-about />
    <app-cv />
    <app-projects />
    <app-blog-teasers />
    <app-contact />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class HomePage {}
