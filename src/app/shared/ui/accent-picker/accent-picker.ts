import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { PRESET_ACCENTS, PresetAccent } from '../../../core/theme/color';
import { ThemeService } from '../../../core/theme/theme.service';

/** Farbmuster für die vier Akzentfarben plus freie Farbe */
@Component({
  selector: 'app-accent-picker',
  templateUrl: './accent-picker.html',
  styleUrl: './accent-picker.scss',
})
export class AccentPicker {
  private readonly theme = inject(ThemeService);
  protected readonly t = inject(LanguageService).t;

  protected readonly swatches = computed(() => {
    const current = this.theme.accent();
    const names = this.t().hero.accents;
    return PRESET_ACCENTS.map((id) => ({
      id,
      name: names[id],
      color: this.theme.paletteFor(id).acc,
      active: current === id,
    }));
  });
  protected readonly isCustom = computed(() => this.theme.accent() === 'custom');
  /** Startwert des Farbfelds: die freie Farbe oder die aktuelle Akzentfarbe */
  protected readonly inputValue = computed(() =>
    this.isCustom()
      ? (this.theme.customHex() ?? this.theme.palette().acc)
      : this.theme.palette().acc,
  );
  protected readonly customColor = computed(() =>
    this.isCustom() ? this.theme.palette().acc : null,
  );

  protected pick(id: PresetAccent): void {
    this.theme.setAccent(id);
  }

  protected onInput(event: Event): void {
    this.theme.setCustomColor((event.target as HTMLInputElement).value);
  }
}
