import { App, Modal, Setting } from 'obsidian';
import { t } from 'src/lang/helpers';

export class CustomPointsModal extends Modal {
  private value: string = '';
  private onSubmit: (value: string) => void;

  constructor(app: App, defaultValue: string = '', onSubmit: (value: string) => void) {
    super(app);
    this.value = defaultValue;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: t('Enter custom points') });

    new Setting(contentEl)
      .setName(t('Points'))
      .addText((text) => {
        text.setValue(this.value);
        text.onChange((val) => {
          this.value = val;
        });
        text.inputEl.focus();
        text.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.close();
            this.onSubmit(this.value.trim());
          }
        });
      });

    new Setting(contentEl)
      .addButton((btn) => {
        btn
          .setButtonText(t('Set points'))
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.value.trim());
          });
      })
      .addButton((btn) => {
        btn.setButtonText(t('Cancel')).onClick(() => {
          this.close();
        });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
