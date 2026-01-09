import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { CvComponent } from './pages/cv/cv';
import { ProjectsComponent } from './pages/projects/projects';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'cv',
    component: CvComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
];
