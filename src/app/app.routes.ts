import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', title: 'Full Stack Developer | Stefan Gall', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'about', title: 'About | Stefan Gall', loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent) },
  { path: 'projects', title: 'Projects | Stefan Gall', loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsComponent) },
  { path: 'cv', title: 'Cv | Stefan Gall', loadComponent: () => import('./pages/cv/cv').then(m => m.CvComponent) },
  { path: 'contact', title: 'Contact | Stefan Gall', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent) },
  { path: '**', title: 'Page not found | Stefan Gall', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent) },
];
