import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../util/utils';

const expect = chai.expect;

export default class PostUpdatePage {
  pageTitle: ElementFinder = element(by.id('newsApp.post.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  titleInput: ElementFinder = element(by.css('input#post-title'));
  contentInput: ElementFinder = element(by.css('input#post-content'));
  coverImageUrlInput: ElementFinder = element(by.css('input#post-coverImageUrl'));
  authorSelect: ElementFinder = element(by.css('select#post-author'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setTitleInput(title) {
    await this.titleInput.sendKeys(title);
  }

  async getTitleInput() {
    return this.titleInput.getAttribute('value');
  }

  async setContentInput(content) {
    await this.contentInput.sendKeys(content);
  }

  async getContentInput() {
    return this.contentInput.getAttribute('value');
  }

  async setCoverImageUrlInput(coverImageUrl) {
    await this.coverImageUrlInput.sendKeys(coverImageUrl);
  }

  async getCoverImageUrlInput() {
    return this.coverImageUrlInput.getAttribute('value');
  }

  async authorSelectLastOption() {
    await this.authorSelect.all(by.tagName('option')).last().click();
  }

  async authorSelectOption(option) {
    await this.authorSelect.sendKeys(option);
  }

  getAuthorSelect() {
    return this.authorSelect;
  }

  async getAuthorSelectedOption() {
    return this.authorSelect.element(by.css('option:checked')).getText();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  getSaveButton() {
    return this.saveButton;
  }

  async enterData() {
    await waitUntilDisplayed(this.saveButton);
    await this.setTitleInput('title');
    expect(await this.getTitleInput()).to.match(/title/);
    await waitUntilDisplayed(this.saveButton);
    await this.setContentInput('content');
    expect(await this.getContentInput()).to.match(/content/);
    await waitUntilDisplayed(this.saveButton);
    await this.setCoverImageUrlInput('coverImageUrl');
    expect(await this.getCoverImageUrlInput()).to.match(/coverImageUrl/);
    await this.authorSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
