import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="page"><h1>Page not found</h1><p>The page you requested does not exist.</p><a routerLink="/">Return home</a></section>`,
})
export class NotFoundComponent {}
