import { by, element, ElementFinder } from 'protractor';

import AlertPage from '../../page-objects/alert-page';

export default class PostUpdatePage extends AlertPage {
  title: ElementFinder = element(by.id('newsApp.post.home.createOrEditLabel'));
  footer: ElementFinder = element(by.id('footer'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));

  titleInput: ElementFinder = element(by.css('input#post-title'));

  contentInput: ElementFinder = element(by.css('input#post-content'));

  coverImageUrlInput: ElementFinder = element(by.css('input#post-coverImageUrl'));

  authorSelect = element(by.css('select#post-author'));
}
