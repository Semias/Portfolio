import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { AccentPicker } from '../../../shared/ui/accent-picker/accent-picker';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, AccentPicker],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly t = inject(LanguageService).t;
}
